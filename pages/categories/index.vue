<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
        <p class="text-gray-500 mt-1">Manage your income and expense categories</p>
      </div>
      <button @click="openAddModal" class="btn-primary">+ Add Category</button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'expense'"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeTab === 'expense' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        Expenses
      </button>
      <button
        @click="activeTab = 'income'"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeTab === 'income' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        Income
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="card flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            :style="{ backgroundColor: cat.color + '20' }"
          >
            <template v-if="isEmoji(cat.icon)">
              {{ cat.icon }}
            </template>
            <template v-else>
              <LucideIcon :name="getCategoryIcon(cat.icon)" size="20" />
            </template>
          </div>
          <span class="font-medium text-gray-900">{{ cat.name }}</span>
        </div>
        <div class="flex items-center gap-1">
          <button @click="openEditModal(cat)" class="text-gray-400 hover:text-primary-600 p-1">
            <LucideIcon name="edit" size="16" />
          </button>
          <button @click="confirmDelete(cat)" class="text-gray-400 hover:text-red-600 p-1">
            <LucideIcon name="trash" size="16" />
          </button>
        </div>
      </div>

      <div v-if="filteredCategories.length === 0" class="col-span-full">
        <div class="card">
          <p class="text-gray-400 text-center py-8">
            No {{ activeTab }} categories yet. Click "Add Category" to create one.
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
              {{ editingCategory ? 'Edit Category' : 'Add Category' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="form.name" type="text" required class="input-field" placeholder="e.g. Groceries" />
              </div>

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
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div class="mb-3">
                  <label class="block text-xs text-gray-500 mb-1">Or use emoji from keyboard:</label>
                  <input 
                    v-model="form.icon" 
                    type="text" 
                    class="input-field text-2xl text-center py-1"
                    placeholder="🍔"
                    maxlength="2"
                  />
                </div>
                <label class="block text-xs text-gray-500 mb-1">Or choose from icons:</label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                    v-for="(iconName, key) in iconOptions"
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

              <div v-if="formError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {{ formError }}
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1">
                  {{ saving ? 'Saving...' : editingCategory ? 'Update' : 'Add' }}
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
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Delete Category?</h2>
            <p class="text-sm text-gray-500 mb-4">Transactions in this category will become uncategorized.</p>
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

const { getCategories, createCategory, updateCategory, deleteCategory, seedDefaultCategories } = useSupabase()

const categories = ref([])
const activeTab = ref('expense')
const showModal = ref(false)
const editingCategory = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const saving = ref(false)

const filteredCategories = computed(() =>
  categories.value.filter((c) => c.type === activeTab.value)
)

const form = reactive({
  name: '',
  type: 'expense',
  icon: 'wallet',
  color: '#3b82f6',
})

const iconOptions = {
  // 🍽️ Food & Dining
  food: 'food',
  coffee: 'coffee',
  kitchen: 'kitchen',
  // 🚗 Transportation
  transport: 'transport',
  car: 'car',
  bus: 'bus',
  train: 'train',
  bike: 'bike',
  flight: 'flight',
  gas: 'gas',
  parking: 'parking',
  navigation: 'navigation',
  // 🛍️ Shopping
  shopping: 'shopping',
  cart: 'cart',
  clothing: 'clothing',
  shoes: 'shoes',
  electronics: 'electronics',
  furniture: 'furniture',
  beauty: 'beauty',
  book: 'book',
  game: 'game',
  // 🎬 Entertainment
  entertainment: 'entertainment',
  movie: 'movie',
  music: 'music',
  ticket: 'ticket',
  camera: 'camera',
  hobby: 'hobby',
  // 🏥 Health & Medical
  health: 'health',
  medicine: 'medicine',
  doctor: 'doctor',
  dentist: 'dentist',
  fitness: 'fitness',
  sport: 'sport',
  // 📚 Education
  education: 'education',
  // 📱 Bills & Utilities
  bills: 'bills',
  phone: 'phone',
  internet: 'internet',
  electricity: 'electricity',
  // 🏠 Housing
  home: 'home',
  rental: 'rental',
  hotel: 'hotel',
  repair: 'repair',
  // ✈️ Travel
  travel: 'travel',
  plane: 'plane',
  location: 'location',
  // 👶 Family
  baby: 'baby',
  pets: 'pets',
  // 🌱 Others
  garden: 'garden',
  charity: 'charity',
  tax: 'tax',
  insurance: 'insurance',
  package: 'package',
  delivery: 'delivery',
  // 💰 Income
  salary: 'salary',
  freelance: 'freelance',
  investment: 'investment',
  gift: 'gift',
  refund: 'refund',
  business: 'business',
  interest: 'interest',
  bonus: 'bonus',
  // 💼 General
  wallet: 'wallet',
  other: 'other',
}

const colorOptions = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#6366f1', '#f97316', '#14b8a6', '#d946ef',
]

const loadData = async () => {
  categories.value = await getCategories()
}

const openAddModal = () => {
  editingCategory.value = null
  form.name = ''
  form.type = activeTab.value
  form.icon = 'wallet'
  form.color = '#3b82f6'
  formError.value = ''
  showModal.value = true
}

const openEditModal = (cat) => {
  editingCategory.value = cat
  form.name = cat.name
  form.type = cat.type
  form.icon = cat.icon
  form.color = cat.color
  formError.value = ''
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  formError.value = ''

  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, {
        name: form.name,
        icon: form.icon,
        color: form.color,
      })
    } else {
      await createCategory({
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color,
      })
    }

    showModal.value = false
    await loadData()
  } catch (e) {
    formError.value = e.message
  }

  saving.value = false
}

const confirmDelete = (cat) => {
  deleteTarget.value = cat
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  await deleteCategory(deleteTarget.value.id)
  deleteTarget.value = null
  await loadData()
}

onMounted(async () => {
  try {
    await seedDefaultCategories()
  } catch (e) {
    console.error('Error seeding categories:', e)
  }
  await loadData()
})
</script>
