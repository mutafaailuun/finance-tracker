// Supabase Edge Function for iOS Shortcuts with OCR Support
// File: supabase/functions/ios-shortcut/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to convert text with 'k' notation to actual numbers
function preprocessAmount(text: string): string {
  return text.replace(/(\d+(?:\.\d+)?)\s*[kK]\b/g, (match, num) => {
    const value = parseFloat(num) * 1000
    return Math.floor(value).toString()
  })
}

// Format currency for display
function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR' || currency === 'Rp') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

// Parse OCR receipt text
function parseReceiptText(text: string): {
  merchant?: string
  total?: number
  date?: string
  items?: string[]
  paymentMethod?: string
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  
  let merchant = ''
  let total = 0
  let date = ''
  let items: string[] = []
  let paymentMethod = ''
  
  // Look for merchant/store name (usually at top)
  for (const line of lines.slice(0, 5)) {
    if (line.includes('PT.') || line.includes('TBK') || line.includes('CV.') || line.includes('Toko')) {
      merchant = line.replace(/PT\.|TBK|CV\./g, '').trim()
      break
    }
  }
  
  // Look for total amount - Indonesian receipt patterns
  const totalPatterns = [
    /total\s*belanja[\s:]*([\d.,]+)/i,
    /total\s*bayar[\s:]*([\d.,]+)/i,
    /grand\s*total[\s:]*([\d.,]+)/i,
    /total[\s:]*([\d.,]+)/i,
    /([\d.,]+)\s*$/  // Last number on line with "Total"
  ]
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (line.toLowerCase().includes('total') || line.toLowerCase().includes('belanja')) {
      // Try to extract number from this line or next few lines
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const numMatch = lines[j].replace(/[.,](?=\d{3})/g, '').match(/(\d[\d.,]*)/)
        if (numMatch) {
          const num = parseFloat(numMatch[1].replace(/\./g, '').replace(',', '.'))
          if (num > total && num < 100000000) { // Reasonable amount
            total = num
            break
          }
        }
      }
      if (total > 0) break
    }
  }
  
  // Look for date
  const datePatterns = [
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /tgl\.?\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/i,  // Tgl. DD/MM/YYYY
  ]
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        const [, day, month, year] = match
        const fullYear = year.length === 2 ? (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year
        date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        break
      }
    }
    if (date) break
  }
  
  // Look for payment method
  const paymentKeywords = ['tunai', 'cash', 'debit', 'credit', 'kartu', 'ovo', 'gopay', 'shopeepay', 'dana', 'qris', 'transfer']
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    for (const keyword of paymentKeywords) {
      if (lowerLine.includes(keyword)) {
        paymentMethod = keyword.toUpperCase()
        break
      }
    }
    if (paymentMethod) break
  }
  
  // Extract items (lines with prices)
  const itemPattern = /^(.+?)\s+(?:\d+)\s+([\d.,]+)\s+([\d.,]+)/
  for (const line of lines) {
    const match = line.match(itemPattern)
    if (match && !line.toLowerCase().includes('total')) {
      items.push(match[1].trim())
    }
  }
  
  return { merchant, total: total > 0 ? total : undefined, date, items, paymentMethod }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, apiKey, isOcr = false, imageText } = await req.json()
    
    // Verify API Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find user by API key
    const { data: userPref } = await supabase
      .from('user_preferences')
      .select('user_id, currency')
      .eq('shortcut_api_key', apiKey)
      .single()

    if (!userPref) {
      return new Response(
        JSON.stringify({ error: 'Invalid API Key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userPref.user_id
    
    let processedText = text
    let receiptData = null
    let isReceipt = false
    
    // If OCR text is provided, parse it as receipt
    if (isOcr || imageText) {
      isReceipt = true
      const ocrText = imageText || text
      receiptData = parseReceiptText(ocrText)
      
      // Use total from receipt if found
      if (receiptData.total) {
        processedText = `Belanja di ${receiptData.merchant || 'toko'} total ${receiptData.total}`
      }
    }
    
    // Preprocess text to handle "k" notation (25k -> 25000)
    processedText = preprocessAmount(processedText)

    // AI Processing
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    
    let prompt = ''
    
    if (isReceipt && receiptData?.total) {
      // Receipt-specific prompt
      prompt = `Parse this receipt transaction:
Original text: "${text}"
Extracted data: Total=${receiptData.total}, Merchant=${receiptData.merchant || 'unknown'}, Date=${receiptData.date || 'today'}

Rules:
- Amount: ${receiptData.total}
- Type: "expense" (receipts are always expenses)
- Description: Create a refined description based on merchant name
  * If merchant is known (Alfamart, Indomaret, etc.): "Belanja [Merchant]"
  * If unknown: "Pembelian di Toko"
  * Use Proper Case
- Category: Choose from: food, transport, shopping, entertainment, health, education, bills, housing, travel, groceries, other
  * Alfamart/Indomaret/Minimarket = groceries
  * Restaurant/Cafe = food
  * Gas station = transport

Return ONLY valid JSON: { "amount": ${receiptData.total}, "type": "expense", "description": "string", "category": "string" }`
    } else {
      // Regular transaction prompt
      prompt = `Parse and refine this transaction: "${processedText}"
Rules:
- Amount should be a number without currency symbols (already converted: 25k = 25000)
- "k" or "K" means thousands (e.g., 25k = 25000)
- Type is "income" for money received, "expense" for money spent
- Description MUST be refined and proper:
  * Use Proper Case ( capitalize each word)
  * Remove casual/slang words like "beli", "bayar", "dapet", "gajian"
  * Use professional terms: "Pembelian", "Pembayaran", "Penerimaan", "Pengeluaran"
  * Be concise but clear (max 4-5 words)
  * Examples:
    - "beli kopi" → "Pembelian Kopi"
    - "bayar listrik" → "Pembayaran Listrik"
    - "gajian bulan ini" → "Gaji Bulanan"
    - "nonton bioskop" → "Nonton Bioskop"
    - "bensin motor" → "Bensin Motor"
    - "makan siang" → "Makan Siang"
- Category should be one of: food, transport, shopping, entertainment, health, education, bills, housing, travel, other

Return ONLY valid JSON: { "amount": number, "type": "income"|"expense", "description": "string", "category": "string" }`
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You parse transactions. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await aiResponse.json()
    let parsed
    try {
      parsed = JSON.parse(aiData.choices[0].message.content)
    } catch (e) {
      const content = aiData.choices[0].message.content
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```([\s\S]*?)```/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    // Get default wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    // Find category
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)

    const category = categories?.find(c => 
      c.name.toLowerCase() === parsed.category?.toLowerCase() ||
      c.name.toLowerCase().includes(parsed.category?.toLowerCase())
    )

    // Use receipt date if available
    const transactionDate = receiptData?.date || new Date().toISOString().split('T')[0]

    // Save transaction
    const { data: tx, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parsed.amount,
        type: parsed.type,
        description: parsed.description,
        category_id: category?.id,
        wallet_id: wallet?.id,
        date: transactionDate,
        source: 'ios_shortcut',
      })
      .select()
      .single()

    if (error) throw error

    // Format nice message for iOS Shortcuts notification
    const typeEmoji = parsed.type === 'income' ? '💰' : '💸'
    const typeText = parsed.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
    const formattedAmount = formatCurrency(parsed.amount, userPref.currency)
    
    let plainMessage = `${typeEmoji} ${typeText} Tercatat!`
    
    if (isReceipt && receiptData?.merchant) {
      plainMessage += ` 📄`
    }
    
    plainMessage += `\n\n${parsed.description}\n${formattedAmount}`
    
    if (category) {
      plainMessage += `\n📁 ${category.name}`
    }
    
    if (receiptData?.paymentMethod) {
      plainMessage += `\n💳 ${receiptData.paymentMethod}`
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: plainMessage,
        isReceipt: isReceipt,
        data: {
          description: parsed.description,
          amount: parsed.amount,
          type: parsed.type,
          category: category?.name || parsed.category,
          merchant: receiptData?.merchant,
          date: transactionDate
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('iOS Shortcut Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Terjadi kesalahan saat mencatat transaksi'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
