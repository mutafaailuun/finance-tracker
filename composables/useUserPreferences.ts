import type { UserPreferences } from '~/types'

export const useUserPreferences = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const preferences = useState<UserPreferences | null>('userPreferences', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getPreferences = async (): Promise<UserPreferences | null> => {
    if (!user.value) return null
    
    try {
      const { data, error: err } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.value.id)
        .single()
      
      if (err && err.code !== 'PGRST116') { // PGRST116 = no rows found
        throw err
      }
      
      if (data) {
        preferences.value = data
        return data
      }
      
      // Create default preferences if not exists
      return await createPreferences({ currency: 'USD' })
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const createPreferences = async (prefs: Partial<UserPreferences>): Promise<UserPreferences | null> => {
    if (!user.value) return null
    
    try {
      const { data, error: err } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.value.id,
          currency: prefs.currency || 'USD',
        })
        .select()
        .single()
      
      if (err) throw err
      
      preferences.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<UserPreferences | null> => {
    if (!user.value || !preferences.value) return null
    
    try {
      const { data, error: err } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (err) throw err
      
      preferences.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const currency = computed(() => preferences.value?.currency || 'USD')

  return {
    preferences: readonly(preferences),
    loading: readonly(loading),
    error: readonly(error),
    currency,
    getPreferences,
    createPreferences,
    updatePreferences,
  }
}