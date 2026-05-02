<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50">
            <LucideIcon name="trending-up" size="20" class="text-white" />
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">FinTracker</h1>
        </div>
        <p class="text-slate-400">Track your finances with ease</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="Your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
          </div>

          <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center">
            <LucideIcon v-if="loading" name="loader" size="18" class="mr-2 animate-spin" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-center text-xs text-gray-500">
            Contact your administrator for account access
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const error = ref('')
const loading = ref(false)

// Check for saved email
onMounted(() => {
  const savedEmail = localStorage.getItem('fintracker_remember_email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (err) {
    error.value = err.message
  } else {
    // Save or clear remember me preference
    if (rememberMe.value) {
      localStorage.setItem('fintracker_remember_email', email.value)
    } else {
      localStorage.removeItem('fintracker_remember_email')
    }
    router.push('/')
  }

  loading.value = false
}
</script>
