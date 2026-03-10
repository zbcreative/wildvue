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
      .select('remaining, lifetime_used')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.remaining <= 0) {
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

    const prompt = `Recreate this photo to remove all barriers between the camera and the animal — including wire fencing, cage bars, glass, netting, or mesh. If there is any debris, algae, grass, or foreign objects in the water or environment that obstruct the animal, remove those too. Every other detail (animal's appearance, position, and expression, the background, lighting, color, angle, and composition) must match exactly. Hyper realistic recreation. Return only the image.`

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

    // Decrement credit only after successful cleanup
    await supabase
      .from('credits')
      .update({
        remaining: credits.remaining - 1,
        lifetime_used: credits.lifetime_used + 1
      })
      .eq('user_id', user.id)

    const outputBase64 = imagePart.inlineData.data
    const outputMime = imagePart.inlineData.mimeType

    return NextResponse.json({
      image: `data:${outputMime};base64,${outputBase64}`,
      creditsRemaining: credits.remaining - 1,
    })

  } catch (error: unknown) {
    console.error('Cleanup error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
