// Supabase Edge Function for iOS Shortcuts
// File: supabase/functions/ios-shortcut/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, apiKey } = await req.json()
    
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

    // AI Processing (same as WhatsApp)
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    
    const prompt = `Parse this transaction: "${text}"
Return JSON: { "amount": number, "type": "income"|"expense", "description": "string", "category": "string" }`

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You parse transactions. Return only JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await aiResponse.json()
    const parsed = JSON.parse(aiData.choices[0].message.content)

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
      c.name.toLowerCase() === parsed.category?.toLowerCase()
    )

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
        date: new Date().toISOString().split('T')[0],
        source: 'ios_shortcut',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `✅ ${parsed.type === 'income' ? 'Income' : 'Expense'}: ${parsed.description} - Rp ${parsed.amount.toLocaleString()}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
