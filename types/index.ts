export interface UserPreferences {
  id: string
  user_id: string
  currency: string
  shortcut_api_key: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: 'cash' | 'bank' | 'ewallet' | 'savings' | 'other'
  balance: number
  color: string
  icon: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  wallet_id: string | null
  amount: number
  type: 'income' | 'expense'
  description: string | null
  date: string
  created_at: string
  categories?: Category
  wallets?: Wallet
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: string
  created_at: string
  categories?: Category
  spent?: number
}