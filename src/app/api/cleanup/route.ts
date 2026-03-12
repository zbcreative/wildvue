import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Credit check
    const { data: credits } = await supabase
      .from('credits')
      .select('remaining, lifetime_used, is_pro, day_pass_expires_at')
      .eq('user_id', user.id)
      .single()

    if (!credits) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
    }

    const isPro = credits.is_pro
    const dayPassActive = credits.day_pass_expires_at != null && new Date(credits.day_pass_expires_at) > new Date()
    const hasCredits = credits.remaining > 0

    if (!isPro && !dayPassActive && !hasCredits) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
    }

    // Get image from request
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const imageBytes = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBytes).toString('base64')
    const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp'

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as never,
    })

    const prompt = `Recreate this photo to remove all barriers between the camera and the animal — including wire fencing, cage bars, glass, netting, or mesh. If there is any debris, algae, grass, or foreign objects in the water or environment that obstruct the animal, remove those too. Every other detail (animal's appearance, position, and expression, the background, lighting, color, angle, and composition) must match exactly. Hyper realistic recreation. Output at the highest possible resolution and detail, 4K quality. Return only the image.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ])

    const response = result.response
    const candidates = response.candidates

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'No result from Gemini' }, { status: 500 })
    }

    const parts = candidates[0].content.parts
    const imagePart = parts.find(p => p.inlineData)

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'No image in response' }, { status: 500 })
    }

    const outputBase64 = imagePart.inlineData.data
    const outputMime = imagePart.inlineData.mimeType

    // Decrement credit only after successful cleanup (skip if pro or day pass active)
    if (!isPro && !dayPassActive) {
      await supabase
        .from('credits')
        .update({
          remaining: credits.remaining - 1,
          lifetime_used: credits.lifetime_used + 1,
        })
        .eq('user_id', user.id)
    }

    // Persist original + cleaned images to Storage and record in cleanups table.
    // Wrapped in try/catch so a storage failure never blocks the response —
    // the user already paid a credit so they must get their image back.
    let cleanupId: string | null = null
    try {
      const ts   = Date.now()
      const rand = Math.random().toString(36).slice(2, 7)
      const origExt    = mimeType.split('/')[1] || 'jpg'
      const cleanedExt = outputMime.split('/')[1] || 'jpg'
      const originalPath = `${user.id}/originals/${ts}-${rand}.${origExt}`
      const cleanedPath  = `${user.id}/cleaned/${ts}-${rand}.${cleanedExt}`

      const [origUpload, cleanedUpload] = await Promise.all([
        supabase.storage.from('cleanups').upload(
          originalPath,
          Buffer.from(imageBytes),
          { contentType: mimeType, upsert: false }
        ),
        supabase.storage.from('cleanups').upload(
          cleanedPath,
          Buffer.from(outputBase64, 'base64'),
          { contentType: outputMime, upsert: false }
        ),
      ])

      if (!origUpload.error && !cleanedUpload.error) {
        // Generate signed URLs (1-hour expiry) to verify access works, then
        // store the storage paths — paths are permanent and let the history
        // page regenerate fresh signed URLs whenever needed.
        const [origSigned, cleanedSigned] = await Promise.all([
          supabase.storage.from('cleanups').createSignedUrl(originalPath, 3600),
          supabase.storage.from('cleanups').createSignedUrl(cleanedPath,  3600),
        ])

        if (origSigned.error)    console.error('Signed URL (original) error:', origSigned.error)
        if (cleanedSigned.error) console.error('Signed URL (cleaned)  error:', cleanedSigned.error)

        const { data: insertData, error: insertError } = await supabase.from('cleanups').insert({
          user_id:    user.id,
          input_url:  originalPath,
          output_url: cleanedPath,
          status:     'completed',
        }).select('id').single()
        if (insertError) console.error('Cleanups insert error:', insertError)
        if (insertData) cleanupId = insertData.id
      } else {
        if (origUpload.error)    console.error('Original upload error:', origUpload.error)
        if (cleanedUpload.error) console.error('Cleaned upload error:', cleanedUpload.error)
      }
    } catch (storageErr) {
      console.error('Storage/DB save failed (non-fatal):', storageErr)
    }

    const creditsRemaining = !isPro && !dayPassActive ? credits.remaining - 1 : credits.remaining

    return NextResponse.json({
      image: `data:${outputMime};base64,${outputBase64}`,
      creditsRemaining,
      isPro,
      cleanupId,
    })

  } catch (error: unknown) {
    console.error('Cleanup error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
