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
  model: 'gemini-2.0-flash-exp-image-generation',
  generationConfig: {
    responseModalities: ['image', 'text'],
  } as never,
})

    const prompt = `You are a photo editing AI. This photo was taken at a zoo, aquarium, safari, or wildlife park. 
    
Your task: Remove all barriers between the camera and the animal. This includes:
- Metal fence wires or bars
- Chain-link fencing
- Glass reflections or smudges
- Cage bars
- Netting or mesh
- Any other man-made barriers

Rules:
- Keep the animal exactly as it appears — do not alter it
- Keep the background and environment natural
- Fill in any removed barriers with realistic background
- Return only the cleaned image with no text or commentary
- Preserve the original photo composition and lighting`

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
