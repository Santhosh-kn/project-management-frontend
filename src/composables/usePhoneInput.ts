// Composable for filtering phone number input
export function usePhoneInput() {
  const filterPhoneInput = (value: string): string => {
    // Allow: digits, spaces, parentheses, hyphens, plus sign, dots
    return value.replace(/[^0-9\s()\-+.]/g, '')
  }

  const formatPhoneDisplay = (value: string): string => {
    if (!value) return ''
    // Remove all non-digit characters for counting
    const digitsOnly = value.replace(/\D/g, '')
    return `${digitsOnly.length} digits`
  }

  return {
    filterPhoneInput,
    formatPhoneDisplay
  }
}
