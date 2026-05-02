export const useSupabase = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const getCategories = async () => {
    const { data } = await client.from('categories').select('*').eq('user_id', user.value?.id).order('name')
    return data || []
  }

  const createCategory = async (category: {
    name: string
    type: 'income' | 'expense'
    icon?: string
    color?: string
  }) => {
    const { data, error } = await client.from('categories').insert({
      ...category,
      user_id: user.value?.id,
    }).select().single()
    if (error) throw error
    return data
  }

  const updateCategory = async (id: string, updates: Partial<{
    name: string
    type: 'income' | 'expense'
    icon: string
    color: string
  }>) => {
    const { error } = await client.from('categories').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteCategory = async (id: string) => {
    const { error } = await client.from('categories').delete().eq('id', id)
    if (error) throw error
  }

  // Wallet functions
  const getWallets = async () => {
    const { data } = await client.from('wallets').select('*').order('name')
    return data || []
  }

  const createWallet = async (wallet: {
    name: string
    type: 'cash' | 'bank' | 'ewallet' | 'savings' | 'other'
    color?: string
    icon?: string
    is_default?: boolean
  }) => {
    const { data, error } = await client.from('wallets').insert({
      ...wallet,
      user_id: user.value?.id,
      balance: 0,
    }).select().single()
    if (error) throw error
    return data
  }

  const updateWallet = async (id: string, updates: Partial<{
    name: string
    type: 'cash' | 'bank' | 'ewallet' | 'savings' | 'other'
    color: string
    icon: string
    balance: number
    is_default: boolean
  }>) => {
    const { error } = await client.from('wallets').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteWallet = async (id: string) => {
    const { error } = await client.from('wallets').delete().eq('id', id)
    if (error) throw error
  }

  const getTransactions = async (filters?: {
    month?: string
    categoryId?: string
    walletId?: string
    type?: 'income' | 'expense'
  }) => {
    let query = client.from('transactions').select('*, categories(name, icon, color), wallets(name, icon, color)').order('date', { ascending: false })

    if (filters?.month) {
      const [year, month] = filters.month.split('-')
      query = query
        .gte('date', `${year}-${month}-01`)
        .lte('date', `${year}-${month}-31`)
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }
    if (filters?.walletId) {
      query = query.eq('wallet_id', filters.walletId)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    const { data } = await query
    return data || []
  }

  const createTransaction = async (transaction: {
    amount: number
    type: 'income' | 'expense'
    category_id: string
    wallet_id?: string
    description?: string
    date: string
  }) => {
    const { data, error } = await client.from('transactions').insert({
      ...transaction,
      user_id: user.value?.id,
    }).select().single()
    if (error) throw error
    return data
  }

  const updateTransaction = async (id: string, updates: Partial<{
    amount: number
    type: 'income' | 'expense'
    category_id: string
    wallet_id: string
    description: string
    date: string
  }>) => {
    const { error } = await client.from('transactions').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await client.from('transactions').delete().eq('id', id)
    if (error) throw error
  }

  const getBudgets = async (month: string) => {
    const { data } = await client
      .from('budgets')
      .select('*, categories(name, icon, color)')
      .eq('month', month)
    return data || []
  }

  const createBudget = async (budget: {
    category_id: string
    amount: number
    month: string
    icon?: string
  }) => {
    const { data, error } = await client.from('budgets').insert({
      ...budget,
      user_id: user.value?.id,
    }).select().single()
    if (error) throw error
    return data
  }

  const updateBudget = async (id: string, updates: { amount: number, category_id?: string, icon?: string }) => {
    const { error } = await client.from('budgets').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteBudget = async (id: string) => {
    const { error } = await client.from('budgets').delete().eq('id', id)
    if (error) throw error
  }

  const getMonthlySummary = async (month: string) => {
    const [year, m] = month.split('-')
    const start = `${year}-${m}-01`
    const end = `${year}-${m}-31`

    const { data: transactions } = await client
      .from('transactions')
      .select('type, amount')
      .gte('date', start)
      .lte('date', end)

    const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0

    return { income, expense, balance: income - expense }
  }

  const getSpendingByCategory = async (month: string) => {
    const [year, m] = month.split('-')
    const start = `${year}-${m}-01`
    const end = `${year}-${m}-31`

    const { data } = await client
      .from('transactions')
      .select('amount, categories(name, color)')
      .eq('type', 'expense')
      .gte('date', start)
      .lte('date', end)

    return data || []
  }

  // Get monthly income and expense for a specific year
  const getYearlyMonthlyData = async (year: number) => {
    const months = []
    
    // Generate all 12 months for the specified year
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, i, 1)
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
        end: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-31`,
      })
    }

    const monthlyData = await Promise.all(
      months.map(async (m) => {
        const { data: transactions } = await client
          .from('transactions')
          .select('type, amount')
          .gte('date', m.start)
          .lte('date', m.end)

        const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
        const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0

        return {
          label: m.label,
          income,
          expense,
        }
      })
    )

    return monthlyData
  }

  // Seed default categories - adds missing categories for all users
  const seedDefaultCategories = async () => {
    if (!user.value) return

    // Get existing category names for this user
    const { data: existingCategories } = await client
      .from('categories')
      .select('name')
      .eq('user_id', user.value.id)

    const existingNames = new Set(existingCategories?.map(c => c.name.toLowerCase()) || [])

    const defaultCategories = [
      // 🍽️ Food & Dining
      { name: 'Food & Dining', type: 'expense', icon: 'food', color: '#f97316' },
      { name: 'Coffee & Snacks', type: 'expense', icon: 'coffee', color: '#92400e' },
      { name: 'Groceries', type: 'expense', icon: 'cart', color: '#22c55e' },
      
      // 🚗 Transportation
      { name: 'Transportation', type: 'expense', icon: 'transport', color: '#3b82f6' },
      { name: 'Fuel', type: 'expense', icon: 'gas', color: '#dc2626' },
      { name: 'Parking', type: 'expense', icon: 'parking', color: '#6b7280' },
      { name: 'Public Transport', type: 'expense', icon: 'bus', color: '#0891b2' },
      
      // 🛍️ Shopping
      { name: 'Shopping', type: 'expense', icon: 'shopping', color: '#ec4899' },
      { name: 'Clothing', type: 'expense', icon: 'clothing', color: '#8b5cf6' },
      { name: 'Electronics', type: 'expense', icon: 'electronics', color: '#06b6d4' },
      { name: 'Personal Care', type: 'expense', icon: 'beauty', color: '#f472b6' },
      
      // 🎬 Entertainment
      { name: 'Entertainment', type: 'expense', icon: 'entertainment', color: '#a855f7' },
      { name: 'Movies', type: 'expense', icon: 'movie', color: '#7c3aed' },
      { name: 'Games', type: 'expense', icon: 'game', color: '#6366f1' },
      { name: 'Hobbies', type: 'expense', icon: 'hobby', color: '#14b8a6' },
      
      // 🏥 Health & Medical
      { name: 'Health & Medical', type: 'expense', icon: 'health', color: '#ef4444' },
      { name: 'Doctor', type: 'expense', icon: 'doctor', color: '#dc2626' },
      { name: 'Medicine', type: 'expense', icon: 'medicine', color: '#f87171' },
      { name: 'Fitness', type: 'expense', icon: 'fitness', color: '#ea580c' },
      
      // 📚 Education
      { name: 'Education', type: 'expense', icon: 'education', color: '#0ea5e9' },
      { name: 'Books', type: 'expense', icon: 'book', color: '#0284c7' },
      
      // 📱 Bills & Utilities
      { name: 'Bills & Utilities', type: 'expense', icon: 'bills', color: '#64748b' },
      { name: 'Phone & Internet', type: 'expense', icon: 'phone', color: '#475569' },
      { name: 'Electricity', type: 'expense', icon: 'electricity', color: '#fbbf24' },
      { name: 'Water', type: 'expense', icon: 'home', color: '#60a5fa' },
      
      // 🏠 Housing
      { name: 'Housing', type: 'expense', icon: 'home', color: '#854d0e' },
      { name: 'Rent', type: 'expense', icon: 'rental', color: '#a16207' },
      { name: 'Repairs', type: 'expense', icon: 'repair', color: '#ca8a04' },
      
      // ✈️ Travel
      { name: 'Travel', type: 'expense', icon: 'travel', color: '#06b6d4' },
      { name: 'Hotel', type: 'expense', icon: 'hotel', color: '#0891b2' },
      { name: 'Flights', type: 'expense', icon: 'flight', color: '#0e7490' },
      
      // 👶 Family
      { name: 'Family', type: 'expense', icon: 'baby', color: '#f472b6' },
      { name: 'Pets', type: 'expense', icon: 'pets', color: '#fb923c' },
      
      // 🌱 Others
      { name: 'Insurance', type: 'expense', icon: 'insurance', color: '#94a3b8' },
      { name: 'Taxes', type: 'expense', icon: 'tax', color: '#475569' },
      { name: 'Charity', type: 'expense', icon: 'charity', color: '#fb7185' },
      { name: 'Gifts', type: 'expense', icon: 'gift', color: '#e879f9' },
      { name: 'Other Expenses', type: 'expense', icon: 'other', color: '#9ca3af' },
      
      // 💰 Income Categories
      { name: 'Salary', type: 'income', icon: 'salary', color: '#10b981' },
      { name: 'Freelance', type: 'income', icon: 'freelance', color: '#34d399' },
      { name: 'Business', type: 'income', icon: 'business', color: '#059669' },
      { name: 'Investment', type: 'income', icon: 'investment', color: '#0ea5e9' },
      { name: 'Rental Income', type: 'income', icon: 'rental', color: '#8b5cf6' },
      { name: 'Interest', type: 'income', icon: 'interest', color: '#f59e0b' },
      { name: 'Bonus', type: 'income', icon: 'bonus', color: '#f97316' },
      { name: 'Gifts Received', type: 'income', icon: 'gift', color: '#ec4899' },
      { name: 'Refund', type: 'income', icon: 'refund', color: '#6b7280' },
      { name: 'Other Income', type: 'income', icon: 'wallet', color: '#64748b' },
    ]

    // Filter out categories that already exist
    const newCategories = defaultCategories
      .filter(cat => !existingNames.has(cat.name.toLowerCase()))
      .map(cat => ({
        ...cat,
        user_id: user.value!.id,
      }))

    if (newCategories.length > 0) {
      const { error } = await client.from('categories').insert(newCategories)
      if (error) throw error
    }
  }

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
    getWallets,
    createWallet,
    updateWallet,
    deleteWallet,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getMonthlySummary,
    getSpendingByCategory,
    getYearlyMonthlyData,
  }
}