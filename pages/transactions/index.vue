<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
        <p class="text-gray-500 mt-1">Manage your income and expenses</p>
      </div>
      <div class="flex gap-2">
        <button @click="openAIChat" class="btn-secondary flex items-center gap-2">
          <LucideIcon name="message-square" size="18" />
          AI Chat
        </button>
        <button @click="openAddModal" class="btn-primary">+ Add Transaction</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select v-model="filterMonth" class="input-field">
          <option value="">All Months</option>
          <option v-for="m in months" :key="m" :value="m">{{ getMonthName(m) }}</option>
        </select>
        <select v-model="filterType" class="input-field">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select v-model="filterCategory" class="input-field">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select v-model="filterWallet" class="input-field">
          <option value="">All Wallets</option>
          <option v-for="wallet in wallets" :key="wallet.id" :value="wallet.id">
            {{ wallet.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="card">
      <div v-if="transactions.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Wallet</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Description</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Amount</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 text-gray-600">{{ formatDate(tx.date) }}</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1.5">
                  <LucideIcon 
                    :name="tx.wallets?.icon || 'wallet'" 
                    size="14" 
                    :style="{ color: tx.wallets?.color || '#6b7280' }"
                  />
                  <span class="text-sm">{{ tx.wallets?.name || 'No Wallet' }}</span>
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1.5">
                  <span
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: tx.categories?.color || '#6b7280' }"
                  />
                  <span>{{ tx.categories?.name || 'Uncategorized' }}</span>
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ tx.description || '-' }}</td>
              <td class="py-3 px-4 text-right font-medium" :class="tx.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, currency) }}
              </td>
              <td class="py-3 px-4 text-right">
                <button @click="openEditModal(tx)" class="text-gray-400 hover:text-primary-600 mr-2 p-1">
                  <LucideIcon name="edit" size="16" />
                </button>
                <button @click="confirmDelete(tx)" class="text-gray-400 hover:text-red-600 p-1">
                  <LucideIcon name="trash" size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-400 text-center py-12">
        No transactions found. Click "Add Transaction" to get started.
      </p>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center px-4 py-8">
          <div class="fixed inset-0 bg-black/30" @click="showModal = false" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingTransaction ? 'Edit Transaction' : 'Add Transaction' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div class="flex gap-3">
                  <label class="flex items-center">
                    <input v-model="form.type" type="radio" value="expense" class="mr-2" />
                    <span class="text-sm text-gray-700">Expense</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="form.type" type="radio" value="income" class="mr-2" />
                    <span class="text-sm text-gray-700">Income</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input v-model.number="form.amount" type="number" step="0.01" required class="input-field" placeholder="0.00" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select v-model="form.category_id" required class="input-field">
                  <option value="">Select a category</option>
                  <option
                    v-for="cat in filteredCategories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Wallet</label>
                <select v-model="form.wallet_id" class="input-field">
                  <option value="">Select a wallet (optional)</option>
                  <option
                    v-for="wallet in wallets"
                    :key="wallet.id"
                    :value="wallet.id"
                  >
                    {{ wallet.name }} ({{ formatCurrency(wallet.balance, currency) }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input v-model="form.date" type="date" required class="input-field" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input v-model="form.description" type="text" class="input-field" placeholder="Optional note" />
              </div>

              <div v-if="formError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {{ formError }}
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1">
                  {{ saving ? 'Saving...' : editingTransaction ? 'Update' : 'Add' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/30" @click="deleteTarget = null" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Delete Transaction?</h2>
            <p class="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="btn-secondary flex-1">Cancel</button>
              <button @click="handleDelete" class="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- AI Chat Modal -->
    <Teleport to="body">
      <div v-if="showAIChat" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center px-4 py-8">
          <div class="fixed inset-0 bg-black/30" @click="showAIChat = false" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LucideIcon name="bot" size="20" />
                AI Transaction Assistant
              </h2>
              <button @click="showAIChat = false" class="text-gray-400 hover:text-gray-600">
                <LucideIcon name="x" size="20" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-3 min-h-[300px] max-h-[400px]">
              <div v-for="(message, index) in chatMessages" :key="index" 
                :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']"
              >
                <div :class="[
                  'max-w-[80%] rounded-lg p-3 text-sm',
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700'
                ]">
                  <p v-if="message.role === 'assistant' && message.isTyping" class="flex items-center gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                  </p>
                  <template v-else>
                    <p>{{ message.content }}</p>
                    <div v-if="message.transaction" class="mt-2 pt-2 border-t border-gray-200">
                      <p class="text-xs text-gray-500 mb-1">Detected transaction:</p>
                      <div class="bg-gray-50 rounded p-2 text-xs">
                        <p><strong>Type:</strong> {{ message.transaction.type }}</p>
                        <p><strong>Amount:</strong> {{ formatCurrency(message.transaction.amount, currency) }}</p>
                        <p><strong>Category:</strong> {{ message.transaction.categoryName }}</p>
                        <p><strong>Description:</strong> {{ message.transaction.description }}</p>
                        <p><strong>Date:</strong> {{ formatDate(message.transaction.date) }}</p>
                      </div>
                      <button 
                        @click="confirmAITransaction(message.transaction)"
                        class="mt-2 w-full btn-primary text-xs py-1"
                      >
                        Add This Transaction
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="!aiConfig.apiKey" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p class="text-sm text-yellow-800 flex items-start gap-2">
                <LucideIcon name="alert-circle" size="16" class="mt-0.5 flex-shrink-0" />
                <span>Please configure your AI API key in <NuxtLink to="/settings" class="underline font-medium">Settings</NuxtLink> to use this feature.</span>
              </p>
            </div>

            <form @submit.prevent="sendChatMessage" class="flex gap-2">
              <input 
                v-model="chatInput" 
                type="text" 
                class="input-field flex-1"
                placeholder="e.g., 'I spent $50 on groceries today' or 'Received salary $3000'"
                :disabled="chatLoading || !aiConfig.apiKey"
              />
              <button 
                type="submit" 
                :disabled="chatLoading || !chatInput.trim() || !aiConfig.apiKey"
                class="btn-primary px-4"
              >
                <LucideIcon v-if="chatLoading" name="loader" size="18" class="animate-spin" />
                <LucideIcon v-else name="send" size="18" />
              </button>
            </form>

            <p class="text-xs text-gray-500 mt-2">
              Examples: "Lunch at restaurant $15", "Bought groceries for $80", "Got salary $5000 this month"
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const { getCategories, getWallets, getTransactions, createTransaction, updateTransaction, deleteTransaction, seedDefaultCategories } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const categories = ref([])
const wallets = ref([])
const transactions = ref([])
const filterMonth = ref(getCurrentMonth())
const filterType = ref('')
const filterCategory = ref('')
const filterWallet = ref('')
const months = generateMonths()
const showModal = ref(false)
const editingTransaction = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const saving = ref(false)

const form = reactive({
  type: 'expense',
  amount: null,
  category_id: '',
  wallet_id: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
})

// AI Chat
const showAIChat = ref(false)
const chatInput = ref('')
const chatMessages = ref([])
const chatLoading = ref(false)
const aiConfig = reactive({
  provider: 'openai',
  apiKey: '',
  model: ''
})

const filteredCategories = computed(() => {
  return form.type
    ? categories.value.filter((c) => c.type === form.type)
    : categories.value
})

const loadData = async () => {
  const [cats, wals, txs] = await Promise.all([
    getCategories(),
    getWallets(),
    getTransactions({
      month: filterMonth.value || undefined,
      type: filterType.value || undefined,
      categoryId: filterCategory.value || undefined,
      walletId: filterWallet.value || undefined,
    }),
  ])
  categories.value = cats
  wallets.value = wals
  transactions.value = txs
}

const openAddModal = () => {
  editingTransaction.value = null
  form.type = 'expense'
  form.amount = null
  form.category_id = ''
  form.wallet_id = ''
  form.date = new Date().toISOString().split('T')[0]
  form.description = ''
  formError.value = ''
  showModal.value = true
}

const openEditModal = (tx) => {
  editingTransaction.value = tx
  form.type = tx.type
  form.amount = tx.amount
  form.category_id = tx.category_id || ''
  form.wallet_id = tx.wallet_id || ''
  form.date = tx.date
  form.description = tx.description || ''
  formError.value = ''
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  formError.value = ''

  try {
    const data = {
      amount: form.amount,
      type: form.type,
      category_id: form.category_id,
      wallet_id: form.wallet_id || undefined,
      date: form.date,
      description: form.description || undefined,
    }

    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, data)
    } else {
      await createTransaction(data)
    }

    showModal.value = false
    await loadData()
  } catch (e) {
    formError.value = e.message
  }

  saving.value = false
}

const confirmDelete = (tx) => {
  deleteTarget.value = tx
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  await deleteTransaction(deleteTarget.value.id)
  deleteTarget.value = null
  await loadData()
}

// AI Chat functions
const openAIChat = () => {
  showAIChat.value = true
  // Load AI config from localStorage
  const savedConfig = localStorage.getItem('ai_config')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    aiConfig.provider = config.provider || 'openai'
    aiConfig.apiKey = config.apiKey || ''
    aiConfig.model = config.model || ''
  }
  
  // Add welcome message if chat is empty
  if (chatMessages.value.length === 0) {
    chatMessages.value.push({
      role: 'assistant',
      content: 'Hi! I can help you add transactions. Just describe what you spent or earned, like "I spent $50 on groceries today" or "Received salary $3000".'
    })
  }
}

const sendChatMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return
  
  const userMessage = chatInput.value.trim()
  chatMessages.value.push({
    role: 'user',
    content: userMessage
  })
  chatInput.value = ''
  chatLoading.value = true
  
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
      chatMessages.value.push({
        role: 'assistant',
        content: response.message,
        transaction: {
          ...response.transaction,
          categoryName: category?.name || 'Uncategorized'
        }
      })
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: response.message || 'Sorry, I could not understand that. Please try describing your transaction more clearly.'
      })
    }
  } catch (error) {
    // Remove typing indicator
    chatMessages.value.splice(typingIndex, 1)
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sorry, there was an error processing your request. Please check your API key in Settings and try again.'
    })
  }
  
  chatLoading.value = false
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
  
  const systemPrompt = `You are a helpful financial assistant. Extract transaction details from user messages and return them in JSON format.

Available categories:
${JSON.stringify(categoriesList, null, 2)}

Available wallets:
${JSON.stringify(walletsList, null, 2)}

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
  "message": "A friendly confirmation message",
  "transaction": {
    "type": "expense" or "income",
    "amount": number (without currency symbols),
    "category_id": "the most appropriate category ID from the list",
    "wallet_id": "the most appropriate wallet ID based on transaction type and description, or the default wallet",
    "description": "brief description",
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
- Select the most appropriate wallet based on context (e.g., 'paid cash' -> cash wallet, 'bank transfer' -> bank wallet, 'e-wallet payment' -> ewallet)
- If no specific wallet is mentioned, use the default wallet (is_default: true)
- Default to expense type unless it's clearly income.
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
      messages: [
        { role: 'user', content: message }
      ]
    }
  } else if (aiConfig.provider === 'google') {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model || 'gemini-pro'}:generateContent?key=${aiConfig.apiKey}`
    headers = {
      'Content-Type': 'application/json'
    }
    requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt + '\n\nUser message: ' + message }
          ]
        }
      ]
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
  
  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  
  throw new Error('Could not parse AI response')
}

const confirmAITransaction = async (transaction) => {
  try {
    // Only pass valid fields to createTransaction, exclude categoryName
    const { categoryName, ...validTransaction } = transaction
    await createTransaction(validTransaction)
    chatMessages.value.push({
      role: 'assistant',
      content: '✅ Transaction added successfully!'
    })
    await loadData()
  } catch (error) {
    chatMessages.value.push({
      role: 'assistant',
      content: '❌ Failed to add transaction: ' + error.message
    })
  }
}

watch([filterMonth, filterType, filterCategory, filterWallet], () => loadData())

onMounted(async () => {
  getPreferences()
  try {
    await seedDefaultCategories()
  } catch (e) {
    console.error('Error seeding categories:', e)
  }
  await loadData()
})
</script>
