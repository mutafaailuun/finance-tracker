<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Wallets</h1>
        <p class="text-gray-500 mt-1">Manage your accounts and track balances</p>
      </div>
      <button @click="openAddModal" class="btn-primary">+ Add Wallet</button>
    </div>

    <!-- Total Balance Card -->
    <div class="card mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <p class="text-sm text-primary-100">Total Balance</p>
      <p class="text-3xl font-bold mt-1">{{ formatCurrency(totalBalance, currency) }}</p>
      <p class="text-sm text-primary-200 mt-2">Across {{ wallets.length }} wallet{{ wallets.length !== 1 ? 's' : '' }}</p>
    </div>

    <!-- Wallets Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="wallet in wallets"
        :key="wallet.id"
        class="card relative"
        :class="wallet.is_default ? 'ring-2 ring-primary-500' : ''"
      >
        <div v-if="wallet.is_default" class="absolute -top-2 left-4 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
          Default
        </div>
        
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: wallet.color + '20' }"
            >
              <LucideIcon :name="wallet.icon || getWalletIcon(wallet.type)" size="24" :style="{ color: wallet.color }" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ wallet.name }}</h3>
              <p class="text-xs text-gray-500 capitalize">{{ wallet.type }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button 
              v-if="!wallet.is_default"
              @click="setDefaultWallet(wallet)"
              class="text-gray-400 hover:text-primary-600 p-1"
              title="Set as default"
            >
              <LucideIcon name="star" size="16" />
            </button>
            <button @click="openEditModal(wallet)" class="text-gray-400 hover:text-primary-600 p-1">
              <LucideIcon name="edit" size="16" />
            </button>
            <button @click="confirmDelete(wallet)" class="text-gray-400 hover:text-red-600 p-1">
              <LucideIcon name="trash" size="16" />
            </button>
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm text-gray-500">Balance</p>
          <p class="text-2xl font-bold" :class="wallet.balance >= 0 ? 'text-gray-900' : 'text-red-600'">
            {{ formatCurrency(wallet.balance, currency) }}
          </p>
        </div>
      </div>

      <div v-if="wallets.length === 0" class="col-span-full">
        <div class="card text-center py-12">
          <LucideIcon name="wallet" size="48" class="mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500 mb-2">No wallets yet</p>
          <p class="text-sm text-gray-400">Click "Add Wallet" to create your first wallet</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center px-4 py-8">
          <div class="fixed inset-0 bg-black/30" @click="showModal = false" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingWallet ? 'Edit Wallet' : 'Add Wallet' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="form.name" type="text" required class="input-field" placeholder="e.g., Main Cash, Bank BCA" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="form.type" class="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                    v-for="(iconName, key) in walletIcons"
                    :key="key"
                    type="button"
                    @click="form.icon = key"
                    class="p-2 rounded-lg border-2 transition-colors flex items-center justify-center"
                    :class="form.icon === key ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <LucideIcon :name="iconName" size="20" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="color in colorOptions"
                    :key="color"
                    type="button"
                    @click="form.color = color"
                    class="w-8 h-8 rounded-full border-2 transition-colors"
                    :style="{ backgroundColor: color }"
                    :class="form.color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ editingWallet ? 'Balance' : 'Initial Balance' }}</label>
                <input 
                  v-model.number="form.balance" 
                  type="number" 
                  step="0.01" 
                  class="input-field" 
                  placeholder="0.00" 
                />
                <p class="text-xs text-gray-500 mt-1" v-if="editingWallet">
                  Warning: Changing balance directly does not create transaction records.
                </p>
              </div>

              <div v-if="!editingWallet">
                <label class="flex items-center gap-2">
                  <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span class="text-sm text-gray-700">Set as default wallet</span>
                </label>
              </div>

              <div v-if="formError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {{ formError }}
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1">
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
        <div class="flex min-h-screen items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/30" @click="deleteTarget = null" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Delete Wallet?</h2>
            <p class="text-sm text-gray-500 mb-4">
              This will delete "{{ deleteTarget.name }}" and all associated transactions will become uncategorized.
            </p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="btn-secondary flex-1">Cancel</button>
              <button @click="handleDelete" class="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { formatCurrency } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { getWallets, createWallet, updateWallet, deleteWallet, seedDefaultCategories } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const wallets = ref([])
const showModal = ref(false)
const editingWallet = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const saving = ref(false)

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