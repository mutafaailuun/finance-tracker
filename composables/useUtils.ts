export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const getMonthName = (month: string): string => {
  const [year, m] = month.split('-')
  return new Date(Number(year), Number(m) - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

export const getCategoryIcon = (icon: string): string => {
  return icon || 'wallet'
}

export const generateMonths = (count = 12): string[] => {
  const months = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export const isEmoji = (str: string): boolean => {
  if (!str) return false
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u
  return emojiRegex.test(str)
}
