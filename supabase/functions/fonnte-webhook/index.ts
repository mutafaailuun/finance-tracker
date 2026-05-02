// Supabase Edge Function for Fonnte WhatsApp Webhook
// File: supabase/functions/fonnte-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI Processing function (similar to your web app)
async function processTransactionWithAI(message: string, userId: string, supabase: any) {
  // Get user preferences for currency
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('currency, ai_provider, ai_api_key')
    .eq('user_id', userId)
    .single()

  const currency = preferences?.currency || 'IDR'
  
  // Get user's wallets for default selection
  const { data: wallets } = await supabase
    .from('wallets')
    .select('id, name, is_default')
    .eq('user_id', userId)
  
  const defaultWallet = wallets?.find(w => w.is_default) || wallets?.[0]
  
  // Get categories for matching
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, keywords')
    .eq('user_id', userId)

  // OpenAI API call
  const aiProvider = preferences?.ai_provider || 'openai'
  const apiKey = preferences?.ai_api_key || Deno.env.get('OPENAI_API_KEY')
  
  const prompt = `Parse this transaction message into structured data.
Message: "${message}"

Available categories: ${categories?.map(c => c.name).join(', ') || 'General'}
Currency: ${currency}

Extract:
1. Amount (convert "48k" to 48000, "1.5jt" to 1500000)
2. Type: income or expense
3. Category (match with available categories, or use "Other")
4. Description (summarize in 2-4 words, sentence case)
5. Date (if mentioned, else today in YYYY-MM-DD format)

Return ONLY a JSON object:
{
  "amount": number,
  "type": "income" | "expense",
  "category": "string",
  "description": "string",
  "date": "YYYY-MM-DD"
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a transaction parser. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await response.json()
    const aiContent = aiData.choices?.[0]?.message?.content
    
    if (!aiContent) {
      throw new Error('No AI response')
    }

    // Parse AI response
    let parsed
    try {
      parsed = JSON.parse(aiContent.replace(/```json\n?|\n?```/g, '').trim())
    } catch {
      // Try to extract JSON from text
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    // Find matching category
    const matchedCategory = categories?.find(c => 
      c.name.toLowerCase() === parsed.category?.toLowerCase() ||
      c.keywords?.some(k => parsed.description?.toLowerCase().includes(k.toLowerCase()))
    )

    return {
      amount: parsed.amount,
      type: parsed.type,
      category_id: matchedCategory?.id || null,
      description: parsed.description,
      date: parsed.date || new Date().toISOString().split('T')[0],
      wallet_id: defaultWallet?.id,
    }
  } catch (error) {
    console.error('AI processing error:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, sender, name } = await req.json()
    
    console.log('Received WhatsApp message:', { sender, message, name })

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find user by phone number
    // Store phone number in user_preferences or create a mapping table
    const { data: userMapping } = await supabase
      .from('user_phone_mappings')
      .select('user_id')
      .eq('phone_number', sender)
      .single()

    if (!userMapping) {
      // Send reply: User not registered
      return new Response(
        JSON.stringify({ 
          reply: '❌ Nomor ini belum terdaftar. Silakan daftar melalui aplikasi web terlebih dahulu.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userMapping.user_id

    // Check if it's a command
    if (message.toLowerCase().startsWith('/')) {
      // Handle commands
      if (message.toLowerCase() === '/help') {
        return new Response(
          JSON.stringify({
            reply: `🤖 *FinTracker Bot*

Cara mencatat transaksi:
• Ketik pesan natural: "Beli nasi goreng 25k"
• Atau: "Gaji masuk 5jt"
• Atau: "Bayar listrik 350k"

Perintah:
/help - Bantuan
/saldo - Cek total saldo
/ringkasan - Ringkasan bulan ini`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (message.toLowerCase() === '/saldo') {
        const { data: wallets } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
        
        const totalBalance = wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0
        
        return new Response(
          JSON.stringify({
            reply: `💰 *Total Saldo:* Rp ${totalBalance.toLocaleString('id-ID')}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Process transaction with AI
    const transaction = await processTransactionWithAI(message, userId, supabase)

    // Save transaction
    const { data: savedTx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        wallet_id: transaction.wallet_id,
        description: transaction.description,
        date: transaction.date,
      })
      .select('*, categories(name)')
      .single()

    if (txError) {
      throw txError
    }

    // Format reply message
    const typeEmoji = transaction.type === 'income' ? '💵' : '💸'
    const typeText = transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
    
    const replyMessage = `${typeEmoji} *${typeText} Tercatat!*

📝 ${transaction.description}
💰 Rp ${transaction.amount.toLocaleString('id-ID')}
📁 ${savedTx.categories?.name || 'Umum'}
📅 ${transaction.date}

✅ Transaksi berhasil disimpan dan sinkron dengan web app.`

    return new Response(
      JSON.stringify({ reply: replyMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        reply: '❌ Maaf, terjadi kesalahan. Pastikan format pesan sudah benar.\n\nContoh:\n• "Makan siang 35k"\n• "Gaji bulanan 5000000"\n• "Bayar parkir 5000"'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
