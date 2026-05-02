<template>
  <div class="h-full flex flex-col bg-slate-50">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">AI Assistant</h1>
        <p class="text-gray-400 mt-0.5 text-sm">Describe your transaction in natural language</p>
      </div>
      <NuxtLink to="/settings" class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <LucideIcon name="settings" size="20" />
      </NuxtLink>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Messages Container -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Welcome Message -->
        <div v-if="chatMessages.length === 0" class="text-center py-12 px-4">
          <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
            <LucideIcon name="bot" size="40" class="text-white" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Welcome to AI Assistant</h2>
          <p class="text-gray-500 max-w-md mx-auto mb-6">
            I can help you track your finances. Just describe what you spent or earned, and I'll automatically add it to your records.
          </p>
          
          <!-- Example prompts -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              v-for="example in examples"
              :key="example"
              @click="useExample(example)"
              class="text-left p-3 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-sm text-gray-600"
            >
              {{ example }}
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <template v-else>
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <!-- Assistant Message -->
            <div v-if="message.role === 'assistant'" class="flex items-start gap-3 max-w-[85%]">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <LucideIcon name="bot" size="16" class="text-white" />
              </div>
              <div class="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <p v-if="message.isTyping" class="flex items-center gap-1 h-6">
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                </p>
                <template v-else>
                  <p class="text-gray-700 text-sm leading-relaxed">{{ message.content }}</p>
                  
                  <!-- Transaction Details -->
                  <div v-if="message.transaction" class="mt-3 pt-3 border-t border-gray-200">
                    <div class="flex items-center gap-2 mb-2">
                      <span 
                        class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="message.transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ message.transaction.type === 'income' ? 'Income' : 'Expense' }}
                      </span>
                      <span class="text-xs text-gray-400">{{ formatDate(message.transaction.date) }}</span>
                    </div>
                    <div class="bg-white rounded-lg p-3 space-y-1.5">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Amount:</span>
                        <span class="font-semibold" :class="message.transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                          {{ message.transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(message.transaction.amount, currency) }}
                        </span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Category:</span>
                        <span class="font-medium">{{ message.transaction.categoryName }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Wallet:</span>
                        <span class="font-medium">{{ message.transaction.walletName }}</span>
                      </div>
                      <div v-if="message.transaction.description" class="flex justify-between text-sm">
                        <span class="text-gray-500">Note:</span>
                        <span class="font-medium text-gray-700">{{ message.transaction.description }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Success/Error Status -->
                  <div 
                    v-if="message.status"
                    class="mt-3 flex items-center gap-2 text-sm"
                    :class="message.status === 'success' ? 'text-green-600' : 'text-red-600'"
                  >
                    <LucideIcon :name="message.status === 'success' ? 'check-circle' : 'x-circle'" size="16" />
                    <span>{{ message.statusMessage }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- User Message -->
            <div v-else class="max-w-[80%]">
              <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                <p class="text-sm">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-100 p-4 bg-white">
        <div v-if="!aiConfig.apiKey" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
          <div class="flex items-start gap-3">
            <LucideIcon name="alert-circle" size="20" class="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm text-amber-800 font-medium">AI Configuration Required</p>
              <p class="text-xs text-amber-600 mt-1">
                Please configure your AI API key in 
                <NuxtLink to="/settings" class="underline font-semibold">Settings</NuxtLink> 
                to use the AI assistant.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="flex gap-3">
          <input
            ref="inputRef"
            v-model="inputMessage"
            type="text"
            :disabled="isProcessing || !aiConfig.apiKey"
            :placeholder="aiConfig.apiKey ? 'Describe your transaction...' : 'Configure AI settings first'"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-sm"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isProcessing || !aiConfig.apiKey"
            class="px-5 py-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2"
          >
            <LucideIcon v-if="isProcessing" name="loader" size="18" class="animate-spin" />
            <LucideIcon v-else name="send" size="18" />
            <span class="hidden sm:inline">{{ isProcessing ? 'Processing...' : 'Send' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { getCategories, getWallets, createTransaction } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const inputMessage = ref('')
const chatMessages = ref([])
const isProcessing = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const categories = ref([])
const wallets = ref([])

const aiConfig = reactive({
  provider: 'openai',
  apiKey: '',
  model: ''
})

const examples = [
  'Makan nasi padang 25k',
  'Gaji masuk 5 juta',
  'Beli pulsa 50k',
  'Bayar listrik 350k',
]

onMounted(() => {
  getPreferences()
  loadData()
  
  // Load AI config from localStorage
  const savedConfig = localStorage.getItem('ai_config')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    aiConfig.provider = config.provider || 'openai'
    aiConfig.apiKey = config.apiKey || ''
    aiConfig.model = config.model || ''
  }

  // Focus input on mount
  inputRef.value?.focus()
})

const loadData = async () => {
  const [cats, wals] = await Promise.all([
    getCategories(),
    getWallets()
  ])
  categories.value = cats
  wallets.value = wals
}

const useExample = (example) => {
  inputMessage.value = example
  inputRef.value?.focus()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isProcessing.value) return

  const userMessage = inputMessage.value.trim()
  chatMessages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''
  isProcessing.value = true
  scrollToBottom()

  // Add typing indicator
  const typingIndex = chatMessages.value.push({
    role: 'assistant',
    content: '',
    isTyping: true
  }) - 1

  try {
    const response = await processWithAI(userMessage)
    
    // Remove typing indicator
    chatMessages.value.splice(typingIndex, 1)

    if (response.success && response.transaction) {
      const category = categories.value.find(c => c.id === response.transaction.category_id)
      const wallet = wallets.value.find(w => w.id === response.transaction.wallet_id)
      
      // Auto-save transaction
      try {
        const { categoryName, walletName, ...transactionData } = response.transaction
        await createTransaction(transactionData)
        
        chatMessages.value.push({
          role: 'assistant',
          content: response.message,
          transaction: {
            ...response.transaction,
            categoryName: category?.name || 'Uncategorized',
            walletName: wallet?.name || 'No Wallet'
          },
          status: 'success',
          statusMessage: 'Transaction saved automatically'
        })
      } catch (error) {
        chatMessages.value.push({
          role: 'assistant',
          content: response.message,
          transaction: {
            ...response.transaction,
            categoryName: category?.name || 'Uncategorized',
            walletName: wallet?.name || 'No Wallet'
          },
          status: 'error',
          statusMessage: 'Failed to save: ' + error.message
        })
      }
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: response.message || 'I could not understand that. Please try describing your transaction more clearly.'
      })
    }
  } catch (error) {
    chatMessages.value.splice(typingIndex, 1)
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sorry, there was an error processing your request. Please check your API key in Settings and try again.'
    })
  }

  isProcessing.value = false
  scrollToBottom()
}

const processWithAI = async (message) => {
  const categoriesList = categories.value.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type
  }))

  const walletsList = wallets.value.map(w => ({
    id: w.id,
    name: w.name,
    type: w.type,
    is_default: w.is_default
  }))

  const defaultWallet = wallets.value.find(w => w.is_default)

  const systemPrompt = `You are a helpful financial assistant. Extract transaction details from user messages and return them in JSON format.

Available categories:
${JSON.stringify(categoriesList, null, 2)}

Available wallets:
${JSON.stringify(walletsList, null, 2)}

Default wallet: ${defaultWallet ? defaultWallet.name : 'None'}

Today's date: ${new Date().toISOString().split('T')[0]}

IMPORTANT - Amount Format Rules:
- "k" or "K" at the end of a number means THOUSAND (ribu). Examples:
  - "48k" = 48000
  - "100k" = 100000
  - "5k" = 5000
  - "1.5k" = 1500
  - "2,5k" = 2500 (Indonesian decimal format)
- Convert all amounts to plain numbers without currency symbols
- Remove dots used as thousand separators (e.g., "50.000" becomes 50000)
- Replace commas used as decimal separators with dots (e.g., "48,5k" becomes 48500)

Return a JSON object with this structure:
{
  "success": true,
  "message": "A friendly confirmation message describing what was recorded",
  "transaction": {
    "type": "expense" or "income",
    "amount": number (without currency symbols),
    "category_id": "the most appropriate category ID from the list",
    "wallet_id": "the most appropriate wallet ID based on context, or default wallet",
    "description": "brief description of the transaction",
    "date": "YYYY-MM-DD format"
  }
}

If you cannot extract the information, return:
{
  "success": false,
  "message": "Explanation of what information is missing"
}

Be smart about categorizing and selecting wallets:
- Match the description to the most appropriate category
- Select wallet based on context (cash, bank transfer, e-wallet, etc.)
- Use default wallet if no specific wallet is mentioned
- Default to expense type unless clearly income
- Amount should be a positive number without currency symbols
- Always convert "k/K" suffix to thousands (e.g., 48k = 48000)
- Description must be in sentence case: capitalize the FIRST LETTER of the description only, keep the rest lowercase (e.g., "Bought groceries at supermarket", NOT "Bought Groceries At Supermarket")`

  let apiUrl, requestBody, headers

  if (aiConfig.provider === 'openai') {
    apiUrl = 'https://api.openai.com/v1/chat/completions'
    headers = {
      'Authorization': `Bearer ${aiConfig.apiKey}`,
      'Content-Type': 'application/json'
    }
    requestBody = {
      model: aiConfig.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    }
  } else if (aiConfig.provider === 'anthropic') {
    apiUrl = 'https://api.anthropic.com/v1/messages'
    headers = {
      'x-api-key': aiConfig.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }
    requestBody = {
      model: aiConfig.model || 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    }
  } else if (aiConfig.provider === 'google') {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model || 'gemini-pro'}:generateContent?key=${aiConfig.apiKey}`
    headers = { 'Content-Type': 'application/json' }
    requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nUser message: ' + message }]
      }]
    }
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('API request failed')
  }

  const data = await response.json()
  let content

  if (aiConfig.provider === 'openai') {
    content = data.choices[0].message.content
  } else if (aiConfig.provider === 'anthropic') {
    content = data.content[0].text
  } else if (aiConfig.provider === 'google') {
    content = data.candidates[0].content.parts[0].text
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  throw new Error('Could not parse AI response')
}
</script>
