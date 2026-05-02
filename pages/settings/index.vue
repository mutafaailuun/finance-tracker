<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-500 mt-1">Manage your preferences and AI configuration</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Currency Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LucideIcon name="dollar-sign" size="20" />
          Currency Settings
        </h2>
        
        <form @submit.prevent="saveCurrency" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select v-model="currencyForm.currency" class="input-field">
              <option v-for="curr in availableCurrencies" :key="curr.code" :value="curr.code">
                {{ curr.code }} - {{ curr.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Select your preferred currency for displaying amounts
            </p>
          </div>

          <div v-if="currencyError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {{ currencyError }}
          </div>

          <div v-if="currencySuccess" class="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            Currency settings saved successfully!
          </div>

          <button 
            type="submit" 
            :disabled="savingCurrency" 
            class="btn-primary w-full flex items-center justify-center"
          >
            <LucideIcon v-if="savingCurrency" name="loader" size="18" class="mr-2 animate-spin" />
            {{ savingCurrency ? 'Saving...' : 'Save Currency' }}
          </button>
        </form>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">Preview:</p>
          <p class="text-xl font-bold text-primary-600 mt-1">
            {{ formatCurrency(1234.56, currencyForm.currency) }}
          </p>
        </div>
      </div>

      <!-- AI Configuration -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LucideIcon name="settings" size="20" />
          AI Configuration
        </h2>
        
        <form @submit.prevent="saveAIConfig" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
            <select v-model="aiForm.provider" class="input-field">
              <option value="openai">OpenAI (GPT-3.5/4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div class="relative">
              <input 
                v-model="aiForm.apiKey" 
                :type="showApiKey ? 'text' : 'password'" 
                class="input-field pr-10"
                placeholder="Enter your API key"
              />
              <button 
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <LucideIcon :name="showApiKey ? 'eye-off' : 'eye'" size="16" />
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Your API key is stored locally in your browser. Never share it with anyone.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Model (Optional)</label>
            <input 
              v-model="aiForm.model" 
              type="text" 
              class="input-field"
              placeholder="e.g., gpt-4, claude-3-sonnet, gemini-pro"
            />
            <p class="text-xs text-gray-500 mt-1">
              Leave empty to use the default model for the selected provider
            </p>
          </div>

          <div v-if="aiError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {{ aiError }}
          </div>

          <div v-if="aiSuccess" class="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            AI configuration saved successfully!
          </div>

          <button 
            type="submit" 
            :disabled="savingAI" 
            class="btn-primary w-full flex items-center justify-center"
          >
            <LucideIcon v-if="savingAI" name="loader" size="18" class="mr-2 animate-spin" />
            {{ savingAI ? 'Saving...' : 'Save AI Configuration' }}
          </button>
        </form>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 mb-2">Supported Providers:</p>
          <ul class="text-xs text-gray-500 space-y-1">
            <li>• OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo</li>
            <li>• Anthropic: claude-3-haiku, claude-3-sonnet, claude-3-opus</li>
            <li>• Google: gemini-pro, gemini-ultra</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { preferences, currency, getPreferences, updatePreferences } = useUserPreferences()

// Currency form
const currencyForm = reactive({
  currency: 'USD'
})
const savingCurrency = ref(false)
const currencyError = ref('')
const currencySuccess = ref(false)

// AI form
const aiForm = reactive({
  provider: 'openai',
  apiKey: '',
  model: ''
})
const savingAI = ref(false)
const aiError = ref('')
const aiSuccess = ref(false)
const showApiKey = ref(false)

const availableCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'PHP', name: 'Philippine Peso' },
]

// Load preferences on mount
onMounted(async () => {
  await getPreferences()
  if (preferences.value) {
    currencyForm.currency = preferences.value.currency
  }
  
  // Load AI config from localStorage
  const savedAIConfig = localStorage.getItem('ai_config')
  if (savedAIConfig) {
    const config = JSON.parse(savedAIConfig)
    aiForm.provider = config.provider || 'openai'
    aiForm.apiKey = config.apiKey || ''
    aiForm.model = config.model || ''
  }
})

// Watch currency changes
watch(() => preferences.value?.currency, (newCurrency) => {
  if (newCurrency) {
    currencyForm.currency = newCurrency
  }
})

const saveCurrency = async () => {
  savingCurrency.value = true
  currencyError.value = ''
  currencySuccess.value = false

  try {
    const result = await updatePreferences({ currency: currencyForm.currency })
    if (result) {
      currencySuccess.value = true
      setTimeout(() => currencySuccess.value = false, 3000)
    }
  } catch (e) {
    currencyError.value = e.message || 'Failed to save currency settings'
  }

  savingCurrency.value = false
}

const saveAIConfig = () => {
  savingAI.value = true
  aiError.value = ''
  aiSuccess.value = false

  try {
    // Save to localStorage
    localStorage.setItem('ai_config', JSON.stringify({
      provider: aiForm.provider,
      apiKey: aiForm.apiKey,
      model: aiForm.model
    }))
    
    aiSuccess.value = true
    setTimeout(() => aiSuccess.value = false, 3000)
  } catch (e) {
    aiError.value = 'Failed to save AI configuration'
  }

  savingAI.value = false
}
</script>