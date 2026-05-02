<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Receipt Scanner</h1>
        <p class="text-gray-500 mt-1">Scan receipts to automatically add transactions</p>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="card mb-6">
      <div 
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
        @click="$refs.fileInput.click()"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <LucideIcon name="camera" size="48" class="mx-auto text-gray-400 mb-4" />
        <p class="text-gray-600 font-medium mb-1">Click or drag image here</p>
        <p class="text-sm text-gray-400">Supports JPG, PNG, WEBP</p>
      </div>
    </div>

    <!-- Preview and OCR Result -->
    <div v-if="selectedImage" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Image Preview -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-4">Receipt Preview</h3>
        <img 
          :src="selectedImage" 
          class="w-full rounded-lg max-h-96 object-contain"
          alt="Receipt preview"
        />
        <button 
          @click="resetScan" 
          class="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Scan Another Receipt
        </button>
      </div>

      <!-- OCR Processing / Results -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-4">Extracted Data</h3>
        
        <!-- Loading State -->
        <div v-if="isProcessing" class="text-center py-12">
          <LucideIcon name="loader-2" size="40" class="mx-auto text-primary-500 animate-spin mb-4" />
          <p class="text-gray-600">Reading receipt...</p>
          <p class="text-sm text-gray-400 mt-1">This may take a few seconds</p>
        </div>

        <!-- Error State -->
        <div v-else-if="ocrError" class="text-center py-8">
          <LucideIcon name="alert-circle" size="40" class="mx-auto text-red-400 mb-4" />
          <p class="text-red-600">{{ ocrError }}</p>
          <button 
            @click="processOCR" 
            class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>

        <!-- Success State - Show Extracted Data -->
        <div v-else-if="extractedData" class="space-y-4">
          <!-- Extracted Text Preview -->
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
            <p class="font-medium text-gray-700 mb-1">Raw Text:</p>
            <p class="whitespace-pre-wrap">{{ extractedText }}</p>
          </div>

          <!-- Parsed Form -->
          <form @submit.prevent="saveTransaction" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input 
                v-model="extractedData.amount" 
                type="number" 
                step="0.01"
                required
                class="input-field" 
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                v-model="extractedData.description" 
                type="text" 
                required
                class="input-field" 
                placeholder="e.g., Grocery shopping"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  v-model="extractedData.date" 
                  type="date" 
                  required
                  class="input-field" 
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="extractedData.type" class="input-field">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Wallet</label>
              <select v-model="extractedData.wallet_id" class="input-field" required>
                <option v-for="wallet in wallets" :key="wallet.id" :value="wallet.id">
                  {{ wallet.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select v-model="extractedData.category_id" class="input-field">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="flex gap-3 pt-2">
              <button 
                type="button" 
                @click="resetScan" 
                class="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="saving"
                class="btn-primary flex-1"
              >
                {{ saving ? 'Saving...' : 'Save Transaction' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center py-12">
          <LucideIcon name="scan-line" size="48" class="mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500">Upload a receipt to extract data</p>
          <button 
            v-if="selectedImage"
            @click="processOCR" 
            class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Start Scanning
          </button>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="card mt-6 bg-blue-50 border-blue-100">
      <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <LucideIcon name="info" size="18" />
        Tips for better results
      </h3>
      <ul class="text-sm text-blue-700 space-y-1 list-disc list-inside">
        <li>Use clear, well-lit photos</li>
        <li>Make sure the receipt is flat and not crumpled</li>
        <li>Ensure all text is visible and in focus</li>
        <li>Supported: receipts, invoices, bills</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { createWorker } from 'tesseract.js'
import { formatCurrency } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { getWallets, getCategories, createTransaction } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const fileInput = ref(null)
const selectedImage = ref(null)
const isProcessing = ref(false)
const ocrError = ref('')
const extractedText = ref('')
const extractedData = ref(null)
const saving = ref(false)
const wallets = ref([])
const categories = ref([])

onMounted(async () => {
  getPreferences()
  await loadData()
})

const loadData = async () => {
  const [walletsData, categoriesData] = await Promise.all([
    getWallets(),
    getCategories()
  ])
  wallets.value = walletsData
  categories.value = categoriesData
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target.result
    ocrError.value = ''
    extractedData.value = null
    extractedText.value = ''
  }
  reader.readAsDataURL(file)
}

const processOCR = async () => {
  if (!selectedImage.value) return
  
  isProcessing.value = true
  ocrError.value = ''
  
  try {
    const worker = await createWorker('eng')
    const result = await worker.recognize(selectedImage.value)
    await worker.terminate()
    
    extractedText.value = result.data.text
    extractedData.value = parseReceiptText(result.data.text)
  } catch (error) {
    console.error('OCR Error:', error)
    ocrError.value = 'Failed to read receipt. Please try again with a clearer image.'
  } finally {
    isProcessing.value = false
  }
}

const parseReceiptText = (text) => {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Try to find amount (look for numbers with decimal points or currency symbols)
  let amount = null
  const amountPatterns = [
    /total[\s:]*[$€£Rp]?\s*([\d,]+\.?\d*)/i,
    /amount[\s:]*[$€£Rp]?\s*([\d,]+\.?\d*)/i,
    /[$€£Rp]\s*([\d,]+\.?\d*)/,
    /([\d,]+\.\d{2})/,
  ]
  
  for (const pattern of amountPatterns) {
    for (const line of lines) {
      const match = line.match(pattern)
      if (match) {
        const num = parseFloat(match[1].replace(/,/g, ''))
        if (num > 0) {
          amount = num
          break
        }
      }
    }
    if (amount) break
  }
  
  // Try to find date
  let date = new Date().toISOString().split('T')[0]
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
  ]
  
  for (const pattern of datePatterns) {
    for (const line of lines) {
      const match = line.match(pattern)
      if (match) {
        const parsedDate = new Date(match[1])
        if (!isNaN(parsedDate)) {
          date = parsedDate.toISOString().split('T')[0]
          break
        }
      }
    }
    if (date !== new Date().toISOString().split('T')[0]) break
  }
  
  // Try to extract description from first few lines
  const description = lines.slice(0, 3).join(' ').substring(0, 100) || 'Receipt scan'
  
  // Get default wallet
  const defaultWallet = wallets.value.find(w => w.is_default) || wallets.value[0]
  
  return {
    amount: amount || 0,
    description: description,
    date: date,
    type: 'expense',
    wallet_id: defaultWallet?.id || '',
    category_id: ''
  }
}

const saveTransaction = async () => {
  if (!extractedData.value) return
  
  saving.value = true
  try {
    await createTransaction({
      amount: extractedData.value.amount,
      description: extractedData.value.description,
      date: extractedData.value.date,
      type: extractedData.value.type,
      wallet_id: extractedData.value.wallet_id,
      category_id: extractedData.value.category_id || null
    })
    
    // Reset and show success
    alert('Transaction saved successfully!')
    resetScan()
  } catch (error) {
    console.error('Save error:', error)
    alert('Failed to save transaction. Please try again.')
  } finally {
    saving.value = false
  }
}

const resetScan = () => {
  selectedImage.value = null
  extractedText.value = ''
  extractedData.value = null
  ocrError.value = ''
  isProcessing.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
