<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <div>
        <h1 class="text-lg md:text-2xl font-bold text-gray-900">Wallets</h1>
        <p class="text-gray-500 mt-0.5 text-xs md:text-sm">Manage your accounts</p>
      </div>
      <button @click="openAddModal" class="btn-primary text-xs md:text-sm px-3 py-2">
        <LucideIcon name="plus" size="16" class="md:mr-1" />
        <span class="hidden md:inline">Add Wallet</span>
        <span class="md:hidden">Add</span>
      </button>
    </div>

    <!-- Total Balance Card -->
    <div class="card mb-4 md:mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 md:p-6">
      <p class="text-xs md:text-sm text-primary-100">Total Balance</p>
      <p class="text-2xl md:text-3xl font-bold mt-1">{{ formatCurrency(totalBalance, currency) }}</p>
      <p class="text-xs md:text-sm text-primary-200 mt-1 md:mt-2">Across {{ wallets.length }} wallet{{ wallets.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Wallets Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <div
        v-for="wallet in wallets"
        :key="wallet.id"
        class="card relative cursor-pointer hover:shadow-lg transition-shadow p-4 md:p-6"
        :class="wallet.is_default ? 'ring-2 ring-primary-500' : ''"
        @click="openWalletHistory(wallet)"
      >
        <div v-if="wallet.is_default" class="absolute -top-2 left-3 md:left-4 bg-primary-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full">
          Default
        </div>
        
        <div class="flex items-start justify-between mb-2 md:mb-3">
          <div class="flex items-center gap-2 md:gap-3">
            <div
              class="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: wallet.color + '20' }"
            >
              <LucideIcon :name="wallet.icon || getWalletIcon(wallet.type)" size="20" class="md:size-[24px]" :style="{ color: wallet.color }" />
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-gray-900 text-sm md:text-base truncate">{{ wallet.name }}</h3>
              <p class="text-[10px] md:text-xs text-gray-500 capitalize">{{ wallet.type }}</p>
            </div>
          </div>
          <div class="flex items-center gap-0.5 md:gap-1" @click.stop>
            <button 
              v-if="!wallet.is_default"
              @click="setDefaultWallet(wallet)"
              class="text-gray-400 hover:text-primary-600 p-1.5 md:p-1"
              title="Set as default"
            >
              <LucideIcon name="star" size="14" class="md:size-[16px]" />
            </button>
            <button @click="openEditModal(wallet)" class="text-gray-400 hover:text-primary-600 p-1.5 md:p-1">
              <LucideIcon name="edit" size="14" class="md:size-[16px]" />
            </button>
            <button @click="confirmDelete(wallet)" class="text-gray-400 hover:text-red-600 p-1.5 md:p-1">
              <LucideIcon name="trash" size="14" class="md:size-[16px]" />
            </button>
          </div>
        </div>

        <div class="mt-3 md:mt-4">
          <p class="text-xs md:text-sm text-gray-500">Balance</p>
          <p class="text-xl md:text-2xl font-bold" :class="wallet.balance >= 0 ? 'text-gray-900' : 'text-red-600'">
            {{ formatCurrency(wallet.balance, currency) }}
          </p>
        </div>
      </div>

      <div v-if="wallets.length === 0" class="col-span-full">
        <div class="card text-center py-8 md:py-12">
          <LucideIcon name="wallet" size="40" class="md:size-[48px] mx-auto text-gray-300 mb-3 md:mb-4" />
          <p class="text-gray-500 text-sm">No wallets yet</p>
          <p class="text-xs text-gray-400 mt-1">Click "Add Wallet" to create your first wallet</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center px-3 md:px-4 py-4 md:py-8">
          <div class="fixed inset-0 bg-black/30" @click="showModal = false" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-4 md:p-6">
            <h2 class="text-base md:text-lg font-semibold text-gray-900 mb-4">
              {{ editingWallet ? 'Edit Wallet' : 'Add Wallet' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-3 md:space-y-4">
              <div>
                <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="form.name" type="text" required class="input-field text-sm" placeholder="e.g., Main Cash, Bank BCA" />
              </div>

              <div>
                <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="form.type" class="input-field text-sm">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div class="grid grid-cols-5 gap-1.5 md:gap-2">
                  <button
                    v-for="(iconName, key) in walletIcons"
                    :key="key"
                    type="button"
                    @click="form.icon = key"
                    class="p-1.5 md:p-2 rounded-lg border-2 transition-colors flex items-center justify-center"
                    :class="form.icon === key ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <LucideIcon :name="iconName" size="18" class="md:size-[20px]" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1">Color</label>
                <div class="grid grid-cols-6 gap-1.5 md:gap-2">
                  <button
                    v-for="color in colorOptions"
                    :key="color"
                    type="button"
                    @click="form.color = color"
                    class="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-colors"
                    :style="{ backgroundColor: color }"
                    :class="form.color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1">{{ editingWallet ? 'Balance' : 'Initial Balance' }}</label>
                <input 
                  v-model.number="form.balance" 
                  type="number" 
                  step="0.01" 
                  class="input-field text-sm" 
                  placeholder="0.00" 
                />
                <p class="text-[10px] md:text-xs text-gray-500 mt-1" v-if="editingWallet">
                  Warning: Changing balance directly does not create transaction records.
                </p>
              </div>

              <div v-if="!editingWallet">
                <label class="flex items-center gap-2">
                  <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span class="text-xs md:text-sm text-gray-700">Set as default wallet</span>
                </label>
              </div>

              <div v-if="formError" class="text-xs md:text-sm text-red-600 bg-red-50 p-2.5 md:p-3 rounded-lg">
                {{ formError }}
              </div>

              <div class="flex gap-2 md:gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-secondary flex-1 text-xs md:text-sm">Cancel</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1 text-xs md:text-sm">
                  {{ saving ? 'Saving...' : editingWallet ? 'Update' : 'Add' }}
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
        <div class="flex min-h-screen items-center justify-center px-3 md:px-4">
          <div class="fixed inset-0 bg-black/30" @click="deleteTarget = null" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-4 md:p-6">
            <h2 class="text-base md:text-lg font-semibold text-gray-900 mb-2">Delete Wallet?</h2>
            <p class="text-xs md:text-sm text-gray-500 mb-4">
              This will delete "{{ deleteTarget.name }}" and all associated transactions will become uncategorized.
            </p>
            <div class="flex gap-2 md:gap-3">
              <button @click="deleteTarget = null" class="btn-secondary flex-1 text-xs md:text-sm">Cancel</button>
              <button @click="handleDelete" class="btn-danger flex-1 text-xs md:text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Wallet Transaction History Modal -->
    <Teleport to="body">
      <div v-if="historyWallet" class="fixed inset-0 z-50 overflow-hidden">
        <div class="absolute inset-0 bg-black/30" @click="historyWallet = null" />
        <div class="absolute bottom-0 left-0 right-0 md:relative md:min-h-screen md:flex md:items-center md:justify-center md:px-4 md:py-8">
          <div class="relative bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-2xl md:max-h-[85vh] h-[85vh] md:h-auto flex flex-col">
            <!-- Header -->
            <div class="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2.5 md:gap-3">
                <div
                  class="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center"
                  :style="{ backgroundColor: historyWallet.color + '20' }"
                >
                  <LucideIcon :name="historyWallet.icon || getWalletIcon(historyWallet.type)" size="18" class="md:size-[20px]" :style="{ color: historyWallet.color }" />
                </div>
                <div>
                  <h2 class="text-base md:text-lg font-semibold text-gray-900">{{ historyWallet.name }}</h2>
                  <p class="text-xs md:text-sm text-gray-500">Transaction History</p>
                </div>
              </div>
              <button @click="historyWallet = null" class="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LucideIcon name="x" size="18" class="md:size-[20px] text-gray-500" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 md:p-6">
              <!-- Summary -->
              <div class="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                <div class="bg-emerald-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <p class="text-[10px] md:text-xs text-emerald-600 font-medium uppercase">Income</p>
                  <p class="text-sm md:text-lg font-bold text-emerald-700">{{ formatCurrency(walletStats.income, currency) }}</p>
                </div>
                <div class="bg-rose-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <p class="text-[10px] md:text-xs text-rose-600 font-medium uppercase">Expense</p>
                  <p class="text-sm md:text-lg font-bold text-rose-700">{{ formatCurrency(walletStats.expense, currency) }}</p>
                </div>
                <div class="bg-violet-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <p class="text-[10px] md:text-xs text-violet-600 font-medium uppercase">Net</p>
                  <p class="text-sm md:text-lg font-bold" :class="walletStats.net >= 0 ? 'text-violet-700' : 'text-rose-700'">
                    {{ formatCurrency(walletStats.net, currency) }}
                  </p>
                </div>
              </div>

              <!-- Month Filter -->
              <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <LucideIcon name="calendar" size="14" class="md:size-[16px] text-gray-400" />
                <select v-model="historyMonth" @change="loadWalletHistory" class="input-field w-auto text-xs md:text-sm py-1.5">
                  <option v-for="m in months" :key="m" :value="m">{{ formatMonthLabel(m) }}</option>
                </select>
              </div>

              <!-- Transactions List -->
              <div v-if="walletTransactions.length > 0" class="space-y-2 md:space-y-3">
                <div
                  v-for="tx in walletTransactions"
                  :key="tx.id"
                  class="flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center gap-2.5 md:gap-3 min-w-0">
                    <div
                      class="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
                      :style="{ backgroundColor: (tx.categories?.color || '#6b7280') + '20' }"
                    >
                      <LucideIcon :name="tx.categories?.icon || 'tag'" size="16" class="md:size-[18px]" :style="{ color: tx.categories?.color || '#6b7280' }" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 text-sm truncate">{{ tx.categories?.name || 'Uncategorized' }}</p>
                      <p class="text-[10px] md:text-xs text-gray-500 truncate">{{ tx.description || 'No description' }}</p>
                      <p class="text-[10px] md:text-xs text-gray-400">{{ formatDate(tx.date) }}</p>
                    </div>
                  </div>
                  <span
                    class="font-semibold text-sm shrink-0"
                    :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'"
                  >
                    {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, currency) }}
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-8 md:py-12">
                <LucideIcon name="receipt" size="40" class="md:size-[48px] mx-auto text-gray-300 mb-2 md:mb-3" />
                <p class="text-gray-500 text-sm">No transactions for this period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate, getCategoryIcon, getCurrentMonth, generateMonths } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { getWallets, createWallet, updateWallet, deleteWallet, seedDefaultCategories, getTransactions } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const wallets = ref([])
const showModal = ref(false)
const editingWallet = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const saving = ref(false)

// Wallet transaction history
const historyWallet = ref(null)
const walletTransactions = ref([])
const historyMonth = ref(getCurrentMonth())
const walletStats = reactive({ income: 0, expense: 0, net: 0 })

const months = generateMonths()

const form = reactive({
  name: '',
  type: 'cash',
  icon: 'wallet',
  color: '#3b82f6',
  balance: 0,
  is_default: false,
})

const walletIcons = {
  wallet: 'wallet',
  piggybank: 'piggy-bank',
  banknote: 'banknote',
  landmark: 'landmark',
  smartphone: 'smartphone',
  creditcard: 'credit-card',
  coins: 'coins',
  bank: 'building-2',
  briefcase: 'briefcase',
  wallet2: 'wallet-2',
}

const colorOptions = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#6366f1', '#f97316', '#14b8a6', '#d946ef',
]

const totalBalance = computed(() => {
  return wallets.value.reduce((sum, wallet) => sum + Number(wallet.balance), 0)
})

const getWalletIcon = (type) => {
  const iconMap = {
    cash: 'wallet',
    bank: 'landmark',
    ewallet: 'smartphone',
    savings: 'piggy-bank',
    other: 'briefcase',
  }
  return iconMap[type] || 'wallet'
}

const loadData = async () => {
  wallets.value = await getWallets()
}

const openAddModal = () => {
  editingWallet.value = null
  form.name = ''
  form.type = 'cash'
  form.icon = 'wallet'
  form.color = '#3b82f6'
  form.balance = 0
  form.is_default = wallets.value.length === 0
  formError.value = ''
  showModal.value = true
}

const openEditModal = (wallet) => {
  editingWallet.value = wallet
  form.name = wallet.name
  form.type = wallet.type
  form.icon = wallet.icon
  form.color = wallet.color
  form.balance = wallet.balance
  form.is_default = wallet.is_default
  formError.value = ''
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  formError.value = ''

  try {
    if (editingWallet.value) {
      await updateWallet(editingWallet.value.id, {
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color,
        balance: form.balance,
      })
    } else {
      await createWallet({
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color,
        balance: form.balance,
        is_default: form.is_default,
      })
    }

    showModal.value = false
    await loadData()
  } catch (e) {
    formError.value = e.message || 'Failed to save wallet'
  }

  saving.value = false
}

const setDefaultWallet = async (wallet) => {
  try {
    await updateWallet(wallet.id, { is_default: true })
    await loadData()
  } catch (e) {
    console.error('Failed to set default wallet:', e)
  }
}

const confirmDelete = (wallet) => {
  deleteTarget.value = wallet
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  await deleteWallet(deleteTarget.value.id)
  deleteTarget.value = null
  await loadData()
}

const openWalletHistory = async (wallet) => {
  historyWallet.value = wallet
  historyMonth.value = getCurrentMonth()
  await loadWalletHistory()
}

const loadWalletHistory = async () => {
  if (!historyWallet.value) return
  
  const transactions = await getTransactions({ 
    month: historyMonth.value,
    wallet_id: historyWallet.value.id 
  })
  
  walletTransactions.value = transactions
  
  // Calculate stats
  let income = 0
  let expense = 0
  transactions.forEach(tx => {
    if (tx.type === 'income') {
      income += Number(tx.amount)
    } else {
      expense += Number(tx.amount)
    }
  })
  
  walletStats.income = income
  walletStats.expense = expense
  walletStats.net = income - expense
}

const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

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
