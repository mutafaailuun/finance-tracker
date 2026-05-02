export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (!user.value && to.path !== '/auth/login' && to.path !== '/auth/signup') {
    return navigateTo('/auth/login')
  }

  if (user.value && (to.path === '/auth/login' || to.path === '/auth/signup')) {
    return navigateTo('/')
  }
})
