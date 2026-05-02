<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Budgets</h1>
        <p class="text-gray-500 mt-1">Set monthly spending limits</p>
      </div>
    </div>

    <!-- Month Selector -->
    <div class="flex items-center gap-3 mb-6">
      <select v-model="currentMonth" class="input-field w-auto">
        <option v-for="m in months" :key="m" :value="m">{{ getMonthName(m) }}</option>
      </select>
      <button @click="openAddModal" class="btn-primary">+ Add Budget</button>
    </div>

    <!-- Budget List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="card"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-100">
              <template v-if="isEmoji(budget.icon)">
                {{ budget.icon }}
              </template>
              <template v-else>
                <LucideIcon :name="budget.icon || getCategoryIcon(budget.categories?.icon) || 'wallet'" size="20" />
              </template>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ budget.categories?.name }}</h3>
              <p class="text-xs text-gray-400">{{ getMonthName(budget.month) }}</p>
            </div>
          </div>
          <button @click="confirmDelete(budget)" class="text-gray-400 hover:text-red-600 p-1">
            <LucideIcon name="trash" size="16" />
          </button>
        </div>

        <div class="mb-2">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-500">
              {{ formatCurrency(budget.spent, currency) }} of {{ formatCurrency(budget.amount, currency) }}
            </span>
            <span
              class="font-medium"
              :class="budget.spent > budget.amount ? 'text-red-600' : 'text-green-600'"
            >
              {{ Math.round((budget.spent / budget.amount) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all duration-500"
              :class="budget.spent > budget.amount ? 'bg-red-500' : 'bg-primary-600'"
              :style="{ width: Math.min((budget.spent / budget.amount) * 100, 100) + '%' }"
            />
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span v-if="budget.spent > budget.amount" class="text-red-600 font-medium">
            Over by {{ formatCurrency(budget.spent - budget.amount, currency) }}
          </span>
          <span v-else class="text-green-600 font-medium">
            {{ formatCurrency(budget.amount - budget.spent, currency) }} remaining
          </span>
          <button @click="openEditModal(budget)" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Edit
          </button>
        </div>
      </div>

      <div v-if="budgets.length === 0" class="col-span-full">
        <div class="card">
          <p class="text-gray-400 text-center py-8">
            No budgets set for {{ getMonthName(currentMonth) }}. Click "Add Budget" to create one.
          </p>
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
              {{ editingBudget ? 'Edit Budget' : 'Add Budget' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select v-model="form.category_id" required class="input-field">
                  <option value="">Select a category</option>
                  <option
                    v-for="cat in expenseCategories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji atau Pilih)</label>
                <div class="space-y-3">
                  <!-- Emoji Input -->
                  <input 
                    v-model="form.icon" 
                    type="text" 
                    class="input-field" 
                    placeholder="Contoh: 🍔, 🚗, 🛍️"
                    maxlength="2"
                  />
                  <!-- Emoji Preset Grid -->
                  <div class="grid grid-cols-8 gap-2">
                    <button
                      v-for="emoji in commonEmojis"
                      :key="emoji"
                      type="button"
                      @click="form.icon = emoji"
                      class="p-2 rounded-lg text-xl hover:bg-gray-100 transition-colors"
                      :class="form.icon === emoji ? 'bg-primary-50 ring-2 ring-primary-500' : ''"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">Klik emoji atau ketik emoji lain</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
                <input v-model.number="form.amount" type="number" step="0.01" required class="input-field" placeholder="0.00" />
              </div>

              <div v-if="formError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {{ formError }}
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1">
                  {{ saving ? 'Saving...' : editingBudget ? 'Update' : 'Add' }}
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
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Delete Budget?</h2>
            <p class="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
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
import { isEmoji, getCategoryIcon } from '~/composables/useUtils'

definePageMeta({ middleware: 'auth' })

const { getCategories, getBudgets, getSpendingByCategory, createBudget, updateBudget, deleteBudget } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const currentMonth = ref(getCurrentMonth())
const months = generateMonths()
const categories = ref([])
const budgets = ref([])
const showModal = ref(false)
const editingBudget = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const saving = ref(false)

const form = reactive({
  category_id: '',
  amount: null,
  icon: '',
})

// Common emojis for budgets
const commonEmojis = [
  '🍔', '🚗', '🛍️', '🎬', '🏥', '📚', '📄', '💰',
  '📈', '🎁', '✈️', '🏠', '📌', '💪', '☕', '🍕',
  '🏋️', '💊', '🎮', '👕', '📱', '⚡', '💧', '🏦',
  '💳', '💵', '🪙', '📺', '🎵', '🏃', '🚲', '🚌'
]

const expenseCategories = computed(() =>
  categories.value.filter((c) => c.type === 'expense')
)

const loadData = async () => {
  const [cats, budgetsData, spendingData] = await Promise.all([
    getCategories(),
    getBudgets(currentMonth.value),
    getSpendingByCategory(currentMonth.value),
  ])

  categories.value = cats

  budgets.value = budgetsData.map((b) => {
    const spent = spendingData
      .filter((s) => s.categories && s.categories.name === b.categories?.name)
      .reduce((sum, s) => sum + Number(s.amount), 0)
    return { ...b, spent }
  })
}

const openAddModal = () => {
  editingBudget.value = null
  form.category_id = ''
  form.amount = null
  form.icon = ''
  formError.value = ''
  showModal.value = true
}

const openEditModal = (budget) => {
  editingBudget.value = budget
  form.category_id = budget.category_id
  form.amount = budget.amount
  form.icon = budget.icon || ''
  formError.value = ''
  showModal.value = true
}

  const handleSubmit = async () => {
  saving.value = true
  formError.value = ''

  try {
    if (editingBudget.value) {
      await updateBudget(editingBudget.value.id, { 
        category_id: form.category_id,
        amount: form.amount,
        icon: form.icon || null
      })
    } else {
      await createBudget({
        category_id: form.category_id,
        amount: form.amount,
        month: currentMonth.value,
        icon: form.icon || null
      })
    }

    showModal.value = false
    await loadData()
  } catch (e) {
    formError.value = e.message
  }

  saving.value = false
}

const confirmDelete = (budget) => {
  deleteTarget.value = budget
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  await deleteBudget(deleteTarget.value.id)
  deleteTarget.value = null
  await loadData()
}

watch(currentMonth, () => loadData())

onMounted(() => {
  getPreferences()
  loadData()
})
</script>
