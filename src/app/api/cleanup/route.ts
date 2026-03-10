import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
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

    // Extract the image from the response
    const parts = candidates[0].content.parts
    const imagePart = parts.find(p => p.inlineData)

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'No image in response' }, { status: 500 })
    }

    const outputBase64 = imagePart.inlineData.data
    const outputMime = imagePart.inlineData.mimeType

    return NextResponse.json({
      image: `data:${outputMime};base64,${outputBase64}`
    })

  } catch (error: unknown) {
    console.error('Cleanup error full details:', JSON.stringify(error, null, 2))
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
