<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar - Desktop Only -->
    <aside class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 overflow-y-auto">
        <!-- Logo -->
        <div class="flex items-center h-16 px-5 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/50">
              <LucideIcon name="trending-up" size="16" class="text-white" />
            </div>
            <span class="text-xl font-bold text-white tracking-tight">FinTracker</span>
          </div>
        </div>

        <!-- Main nav -->
        <nav class="flex-1 px-3 py-5 space-y-0.5">
          <NuxtLink
            v-for="item in mainNavigation"
            :key="item.name"
            :to="item.href"
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            :class="isActiveRoute(item.href)
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'"
          >
            <LucideIcon :name="item.icon" size="18" class="mr-3 shrink-0" />
            {{ item.name }}
          </NuxtLink>
          
          <!-- AI Assistant for desktop -->
          <NuxtLink
            to="/ai"
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mt-2"
            :class="isActiveRoute('/ai')
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-900/40'
              : 'text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-amber-500/30'"
          >
            <LucideIcon name="bot" size="18" class="mr-3 shrink-0" />
            AI Assistant
          </NuxtLink>
        </nav>

        <!-- Secondary nav + sign out -->
        <div class="px-3 pb-5 pt-3 border-t border-white/10 space-y-0.5">
          <NuxtLink
            v-for="item in secondaryNavigation"
            :key="item.name"
            :to="item.href"
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            :class="isActiveRoute(item.href)
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'"
          >
            <LucideIcon :name="item.icon" size="18" class="mr-3 shrink-0" />
            {{ item.name }}
          </NuxtLink>
          <button
            @click="handleSignOut"
            class="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-700 hover:text-slate-100 transition-all duration-200"
          >
            <LucideIcon name="logout" size="18" class="mr-3 shrink-0" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Mobile header -->
      <header class="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 shrink-0 shadow-sm">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-md flex items-center justify-center">
            <LucideIcon name="trending-up" size="13" class="text-white" />
          </div>
          <span class="text-lg font-bold text-gray-900 tracking-tight">FinTracker</span>
        </div>
        <NuxtLink
          to="/settings"
          class="p-2 rounded-lg transition-colors"
          :class="isActiveRoute('/settings') ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'"
        >
          <LucideIcon name="settings" size="20" />
        </NuxtLink>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
        <slot />
      </main>

      <!-- Mobile Bottom Navigation Bar with Center AI Button -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-lg">
        <!-- Left side items -->
        <div class="flex items-center justify-between h-16 px-2">
          <NuxtLink
            v-for="item in leftNavigation"
            :key="item.name"
            :to="item.href"
            class="flex flex-col items-center justify-center py-2 px-1 min-w-[52px] rounded-xl transition-all"
            :class="isActiveRoute(item.href)
              ? 'text-primary-600'
              : 'text-gray-400 hover:text-gray-600'"
          >
            <LucideIcon :name="item.icon" size="20" />
            <span class="text-[9px] font-medium mt-0.5">{{ item.shortName }}</span>
          </NuxtLink>

          <!-- Center AI Button (Prominent) -->
          <NuxtLink
            to="/ai"
            class="relative -mt-6 flex flex-col items-center justify-center"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all"
              :class="isActiveRoute('/ai')
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-500/40 scale-105'
                : 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-500/40'"
            >
              <LucideIcon name="bot" size="28" class="text-white" />
            </div>
            <span
              class="text-[9px] font-medium mt-1"
              :class="isActiveRoute('/ai') ? 'text-amber-600' : 'text-gray-500'"
            >
              AI
            </span>
          </NuxtLink>

          <!-- Right side items -->
          <NuxtLink
            v-for="item in rightNavigation"
            :key="item.name"
            :to="item.href"
            class="flex flex-col items-center justify-center py-2 px-1 min-w-[52px] rounded-xl transition-all"
            :class="isActiveRoute(item.href)
              ? 'text-primary-600'
              : 'text-gray-400 hover:text-gray-600'"
          >
            <LucideIcon :name="item.icon" size="20" />
            <span class="text-[9px] font-medium mt-0.5">{{ item.shortName }}</span>
          </NuxtLink>

          <!-- More Menu Button -->
          <button
            @click="showMoreMenu = true"
            class="flex flex-col items-center justify-center py-2 px-1 min-w-[52px] rounded-xl transition-all"
            :class="isMoreMenuActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'"
          >
            <LucideIcon name="menu" size="20" />
            <span class="text-[9px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      <!-- More Menu Modal (Mobile) -->
      <Teleport to="body">
        <div v-if="showMoreMenu" class="fixed inset-0 z-50 md:hidden">
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            @click="showMoreMenu = false"
          />
          
          <!-- Menu Panel -->
          <div class="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Menu</h3>
                <button 
                  @click="showMoreMenu = false"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LucideIcon name="x" size="20" class="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div class="p-2 max-h-[60vh] overflow-y-auto">
              <div class="grid grid-cols-3 gap-2">
                <NuxtLink
                  v-for="item in moreMenuItems"
                  :key="item.name"
                  :to="item.href"
                  @click="showMoreMenu = false"
                  class="flex flex-col items-center justify-center p-4 rounded-xl transition-all"
                  :class="isActiveRoute(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'"
                >
                  <LucideIcon :name="item.icon" size="24" />
                  <span class="text-xs font-medium mt-2 text-center">{{ item.name }}</span>
                </NuxtLink>
              </div>
              
              <!-- Sign Out Button -->
              <div class="mt-4 pt-4 border-t border-gray-100">
                <button
                  @click="handleSignOutFromMenu"
                  class="flex items-center justify-center w-full gap-2 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LucideIcon name="logout" size="20" />
                  <span class="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const showMoreMenu = ref(false)

// Split navigation for mobile with center AI button
const leftNavigation = [
  { name: 'Dashboard', shortName: 'Home', href: '/', icon: 'dashboard' },
  { name: 'Transactions', shortName: 'Trans.', href: '/transactions', icon: 'transactions' },
]

const rightNavigation = [
  { name: 'Wallets', shortName: 'Wallets', href: '/wallets', icon: 'wallet' },
]

// All menu items for "More" section
const moreMenuItems = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Transactions', href: '/transactions', icon: 'transactions' },
  { name: 'Budgets', href: '/budgets', icon: 'budgets' },
  { name: 'Categories', href: '/categories', icon: 'categories' },
  { name: 'Wallets', href: '/wallets', icon: 'wallet' },
  { name: 'AI Assistant', href: '/ai', icon: 'bot' },
  { name: 'Scanner', href: '/ocr', icon: 'scan-line' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
]

const mainNavigation = [
  { name: 'Dashboard', shortName: 'Home', href: '/', icon: 'dashboard' },
  { name: 'Transactions', shortName: 'Trans.', href: '/transactions', icon: 'transactions' },
  { name: 'Budgets', shortName: 'Budgets', href: '/budgets', icon: 'budgets' },
  { name: 'Categories', shortName: 'Categ.', href: '/categories', icon: 'categories' },
  { name: 'Wallets', shortName: 'Wallets', href: '/wallets', icon: 'wallet' },
  { name: 'Receipt Scanner', shortName: 'Scan', href: '/ocr', icon: 'scan-line' },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: 'settings' },
]

const isActiveRoute = (href) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path === href || route.path.startsWith(href + '/')
}

const isMoreMenuActive = computed(() => {
  return moreMenuItems.some(item => isActiveRoute(item.href)) && 
         !leftNavigation.some(item => isActiveRoute(item.href)) &&
         !rightNavigation.some(item => isActiveRoute(item.href)) &&
         !isActiveRoute('/ai')
})

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/auth/login')
}

const handleSignOutFromMenu = async () => {
  showMoreMenu.value = false
  await handleSignOut()
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
