// ============================================
// ORDER OCR SERVICE — AI Vision orqali qo'lyozma buyurtmadan ma'lumot ajratish
// ============================================
// Kerakli .env o'zgaruvchilari:
// VITE_GEMINI_API_KEY=...   yoki   VITE_OPENAI_API_KEY=...

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

const buildPrompt = () => `
Siz buyurtma cheki yoki qo‘lyozma variantdan ma'lumotlarni ajratib oluvchi AI yordamchisiz.
Rasmdan quyidagi ma'lumotlarni FAQAT JSON formatida chiqaring:

{
  "client_name": "Mijoz ismi",
  "phone": "Telefon raqami",
  "initial_payment": 0,
  "materials": [
    {"name": "Material nomi", "count": 1, "price": 10000}
  ],
  "services": {
    "bazis": 0,
    "cutting": 0,
    "kromka": 0,
    "piercing": 0,
    "rover": 0
  },
  "expenses": {
    "masterfee": 0,
    "spares": 0,
    "anotherexpenses": 0
 }
}

Agar maydon topilmasa, 0 yoki null qaytaring. Boshqa matn yozmang, faqat JSON.
`

export const extractOrderFromImage = async (file, apiKey, provider = 'gemini') => {
  if (!apiKey) {
    throw new Error('AI Vision API kaliti sozlanmagan. VITE_GEMINI_API_KEY yoki VITE_OPENAI_API_KEY ni kiriting.')
  }

  const base64 = await fileToBase64(file)

  if (provider === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: buildPrompt() },
                { inline_data: { mime_type: file.type, data: base64 } }
              ]
            }
          ]
        })
      }
    )

    if (!response.ok) {
      throw new Error('Gemini Vision API xatosi: ' + response.statusText)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(jsonText)
  }

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: buildPrompt() },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
            ]
          }
        ],
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI Vision API xatosi: ' + response.statusText)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(jsonText)
  }

  throw new Error('Noma‘lum AI provayder: ' + provider)
}

export const detectProvider = () => {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (geminiKey) return 'gemini'
  if (openaiKey) return 'openai'
  return null
}