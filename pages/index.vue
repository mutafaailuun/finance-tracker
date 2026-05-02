<template>
  <div>
    <!-- Header - Mobile optimized -->
    <div class="flex items-center justify-between mb-4 md:mb-8">
      <div>
        <h1 class="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p class="text-gray-400 mt-0.5 text-xs md:text-sm">{{ getMonthName(currentMonth) }}</p>
      </div>
      <select v-model="currentMonth" class="input-field w-auto text-xs md:text-sm py-1.5 md:py-2">
        <option v-for="m in months" :key="m" :value="m">{{ getMonthName(m) }}</option>
      </select>
    </div>

    <!-- Summary Cards - Compact on mobile -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
      <!-- Income -->
      <div class="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 md:p-6 text-white shadow-lg shadow-emerald-200">
        <div class="flex items-center justify-between mb-2 md:mb-3">
          <p class="text-[10px] md:text-xs font-semibold text-emerald-100 uppercase tracking-widest">Income</p>
          <div class="w-7 h-7 md:w-9 md:h-9 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
            <LucideIcon name="trending-up" size="14" class="md:size-[18px]" />
          </div>
        </div>
        <p class="text-xl md:text-3xl font-bold tracking-tight">{{ formatCurrency(summary.income, currency) }}</p>
      </div>

      <!-- Expenses -->
      <div class="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 p-4 md:p-6 text-white shadow-lg shadow-rose-200">
        <div class="flex items-center justify-between mb-2 md:mb-3">
          <p class="text-[10px] md:text-xs font-semibold text-rose-100 uppercase tracking-widest">Expenses</p>
          <div class="w-7 h-7 md:w-9 md:h-9 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
            <LucideIcon name="trending-down" size="14" class="md:size-[18px]" />
          </div>
        </div>
        <p class="text-xl md:text-3xl font-bold tracking-tight">{{ formatCurrency(summary.expense, currency) }}</p>
      </div>

      <!-- Balance -->
      <div
        class="relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg"
        :class="summary.balance >= 0
          ? 'bg-gradient-to-br from-violet-500 to-violet-700 shadow-violet-200'
          : 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-200'"
      >
        <div class="flex items-center justify-between mb-2 md:mb-3">
          <p class="text-[10px] md:text-xs font-semibold text-white/70 uppercase tracking-widest">Balance</p>
          <div class="w-7 h-7 md:w-9 md:h-9 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
            <LucideIcon name="wallet" size="14" class="md:size-[18px]" />
          </div>
        </div>
        <p class="text-xl md:text-3xl font-bold tracking-tight">{{ formatCurrency(summary.balance, currency) }}</p>
      </div>
    </div>

    <!-- Wallet Balances - Horizontal scroll on mobile -->
    <div class="mb-4 md:mb-6">
      <h2 class="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <LucideIcon name="wallet" size="14" class="md:size-[16px] text-primary-500" />
        Wallet Balances
      </h2>
      <div v-if="wallets.length > 0" class="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 -mx-3 px-3 md:mx-0 md:px-0">
        <NuxtLink
          v-for="wallet in wallets"
          :key="wallet.id"
          to="/wallets"
          class="relative overflow-hidden rounded-lg md:rounded-xl p-3 md:p-4 transition-all hover:shadow-md shrink-0 w-[140px] md:w-auto"
          :style="{ backgroundColor: wallet.color + '15', border: `1px solid ${wallet.color}30` }"
        >
          <div class="flex items-start justify-between mb-1.5 md:mb-2">
            <div
              class="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: wallet.color + '25' }"
            >
              <LucideIcon :name="wallet.icon || 'wallet'" size="12" class="md:size-[16px]" :style="{ color: wallet.color }" />
            </div>
            <span v-if="wallet.is_default" class="text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 rounded-full font-medium" :style="{ backgroundColor: wallet.color + '30', color: wallet.color }">
              Default
            </span>
          </div>
          <p class="text-[10px] md:text-xs text-gray-500 mb-0.5 truncate">{{ wallet.name }}</p>
          <p class="text-sm md:text-lg font-bold text-gray-900">{{ formatCurrency(wallet.balance, currency) }}</p>
        </NuxtLink>
      </div>
      <div v-else class="card py-6 md:py-8 text-center">
        <LucideIcon name="wallet" size="32" class="md:size-[40px] mx-auto text-gray-300 mb-2 md:mb-3" />
        <p class="text-gray-500 text-xs md:text-sm">No wallets yet</p>
        <NuxtLink to="/wallets" class="text-primary-600 text-xs md:text-sm font-medium mt-2 inline-block">
          Create your first wallet →
        </NuxtLink>
      </div>
    </div>

    <!-- Charts Section - Single column on mobile -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
       <!-- Spending by Category Chart -->
       <div class="card p-4 md:p-6">
         <h2 class="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
           <LucideIcon name="pie-chart" size="14" class="md:size-[16px] text-primary-500" />
           Spending by Category
         </h2>
         <div v-if="spendingByCategory.length > 0" class="relative h-48 md:h-64 w-full">
           <canvas ref="pieChartRef" style="width: 100% !important; height: 100% !important;"></canvas>
         </div>
         <p v-else class="text-gray-400 text-xs md:text-sm text-center py-10 md:py-14">No expenses this month</p>
       </div>

       <!-- Yearly Income vs Expense Chart -->
       <div class="card p-4 md:p-6">
         <div class="flex items-center justify-between mb-3">
           <h2 class="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
             <LucideIcon name="bar-chart" size="14" class="md:size-[16px] text-primary-500" />
             Yearly Overview
           </h2>
           <select v-model="selectedYear" @change="loadYearlyData" class="input-field w-auto text-xs md:text-sm py-1">
             <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
           </select>
         </div>
         <div v-if="yearlyData.length > 0" class="relative h-48 md:h-64 w-full">
           <canvas ref="barChartRef" style="width: 100% !important; height: 100% !important;"></canvas>
         </div>
         <p v-else class="text-gray-400 text-xs md:text-sm text-center py-10 md:py-14">No data available</p>
       </div>
    </div>

    <!-- Recent Transactions - Mobile card style -->
    <div class="card p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
          <LucideIcon name="list" size="14" class="md:size-[16px] text-primary-500" />
          Recent Transactions
        </h2>
        <NuxtLink to="/transactions" class="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
          View All
          <LucideIcon name="arrow-right" size="12" class="md:size-[14px]" />
        </NuxtLink>
      </div>

      <!-- Mobile: Card style list -->
      <div v-if="recentTransactions.length > 0" class="md:hidden space-y-2">
        <div
          v-for="tx in recentTransactions"
          :key="tx.id"
          class="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :style="{ backgroundColor: (tx.categories?.color || '#6b7280') + '20' }"
            >
              <LucideIcon :name="getCategoryIcon(tx.categories?.icon || 'wallet')" size="16" :style="{ color: tx.categories?.color || '#6b7280' }" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 text-sm truncate">{{ tx.categories?.name || 'Uncategorized' }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(tx.date) }}</p>
            </div>
          </div>
          <span class="font-semibold text-sm shrink-0" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, currency) }}
          </span>
        </div>
      </div>

      <!-- Desktop: Table style -->
      <div v-if="recentTransactions.length > 0" class="hidden md:block overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left pb-3 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Date</th>
              <th class="text-left pb-3 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Wallet</th>
              <th class="text-left pb-3 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Category</th>
              <th class="text-left pb-3 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</th>
              <th class="text-right pb-3 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in recentTransactions"
              :key="tx.id"
              class="border-b border-gray-50 hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-3 text-gray-500 text-xs">{{ formatDate(tx.date) }}</td>
              <td class="py-3 px-3">
                <span class="inline-flex items-center gap-1 text-xs text-gray-600">
                  <LucideIcon :name="tx.wallets?.icon || 'wallet'" size="12" :style="{ color: tx.wallets?.color || '#9ca3af' }" />
                  {{ tx.wallets?.name || '—' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{
                    backgroundColor: (tx.categories?.color || '#6b7280') + '22',
                    color: tx.categories?.color || '#6b7280'
                  }"
                >
                  <LucideIcon :name="getCategoryIcon(tx.categories?.icon || 'wallet')" size="11" />
                  {{ tx.categories?.name || 'Uncategorized' }}
                </span>
              </td>
              <td class="py-3 px-3 text-gray-500 text-xs">{{ tx.description || '—' }}</td>
              <td class="py-3 px-3 text-right font-semibold text-sm" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, currency) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-400 text-xs md:text-sm text-center py-8 md:py-10">No transactions yet</p>
    </div>
  </div>
</template>

<script setup>
import { Chart, DoughnutController, BarController, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { getCategoryIcon } from '~/composables/useUtils'

Chart.register(DoughnutController, BarController, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

definePageMeta({ middleware: 'auth' })

const { getMonthlySummary, getSpendingByCategory, getBudgets, getTransactions, getWallets, seedDefaultCategories, getYearlyMonthlyData } = useSupabase()
const { currency, getPreferences } = useUserPreferences()

const currentMonth = ref(getCurrentMonth())
const months = generateMonths()
const summary = reactive({ income: 0, expense: 0, balance: 0 })
const spendingByCategory = ref([])
const budgets = ref([])
const wallets = ref([])
const recentTransactions = ref([])
const pieChartRef = ref(null)
const barChartRef = ref(null)
let pieChartInstance = null
let barChartInstance = null
const yearlyData = ref([])

// Year selector for chart
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y)
  }
  return years
})

onMounted(async () => {
  getPreferences()
  await seedDefaultCategories() // Seed default categories for new users
  loadData()
})

const loadData = async () => {
  const [summaryData, spendingData, txData, walletsData, yearly] = await Promise.all([
    getMonthlySummary(currentMonth.value),
    getSpendingByCategory(currentMonth.value),
    getTransactions({ month: currentMonth.value }),
    getWallets(),
    getYearlyMonthlyData(selectedYear.value),
  ])

  summary.income = summaryData.income
  summary.expense = summaryData.expense
  summary.balance = summaryData.balance
  wallets.value = walletsData
  recentTransactions.value = txData.slice(0, 5)
  yearlyData.value = yearly

  const categoryMap = new Map()
  spendingData.forEach((item) => {
    const name = item.categories?.name || 'Uncategorized'
    const color = item.categories?.color || '#6b7280'
    const current = categoryMap.get(name) || { name, color, amount: 0 }
    current.amount += Number(item.amount)
    categoryMap.set(name, current)
  })
  spendingByCategory.value = Array.from(categoryMap.values())

  nextTick(() => {
    renderPieChart()
    renderBarChart()
  })
}

const loadYearlyData = async () => {
  const yearly = await getYearlyMonthlyData(selectedYear.value)
  yearlyData.value = yearly
  nextTick(() => {
    renderBarChart()
  })
}

const renderPieChart = () => {
  if (pieChartInstance) {
    pieChartInstance.destroy()
    pieChartInstance = null
  }
  if (!pieChartRef.value || spendingByCategory.value.length === 0) return

  // Fix for iOS Safari: ensure canvas has proper dimensions
  const canvas = pieChartRef.value
  const parent = canvas.parentElement
  if (parent) {
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }

  requestAnimationFrame(() => {
    pieChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: spendingByCategory.value.map((c) => c.name),
        datasets: [{
          data: spendingByCategory.value.map((c) => c.amount),
          backgroundColor: spendingByCategory.value.map((c) => c.color),
          borderWidth: 3,
          borderColor: '#f8fafc',
          hoverBorderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { 
              padding: 12, 
              usePointStyle: true, 
              pointStyleWidth: 8, 
              font: { size: 11 },
              boxWidth: 8
            },
          },
        },
      },
    })
  })
}

const renderBarChart = () => {
  if (barChartInstance) {
    barChartInstance.destroy()
    barChartInstance = null
  }
  if (!barChartRef.value || yearlyData.value.length === 0) return

  // Fix for iOS Safari: ensure canvas has proper dimensions
  const canvas = barChartRef.value
  const parent = canvas.parentElement
  if (parent) {
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }

  requestAnimationFrame(() => {
    barChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: yearlyData.value.map((d) => d.label),
        datasets: [
          {
            label: 'Income',
            data: yearlyData.value.map((d) => d.income),
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
          {
            label: 'Expense',
            data: yearlyData.value.map((d) => d.expense),
            backgroundColor: '#ef4444',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: false,
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6',
            },
            ticks: {
              font: { size: 10 }
            }
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 }
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${formatCurrency(context.raw, currency.value)}`
              },
            },
          },
        },
      },
    })
  })
}

watch(currentMonth, () => loadData())
</script>
