/**
 * Format a number as a price string with € symbol.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price (e.g. "12.50€")
 */
export function formatPrice(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00€'
  }
  return `${amount.toFixed(2)}€`
}

/**
 * Format a date to a locale string.
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale string (default: 'es-ES')
 * @returns {string} Formatted date
 */
export function formatDate(date, locale = 'es-ES') {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format minutes into a human-readable string.
 * @param {number} minutes - Number of minutes
 * @returns {string} Formatted string (e.g. "32min", "1h 15min")
 */
export function formatMinutes(minutes) {
  if (typeof minutes !== 'number' || minutes < 0) {
    return '0min'
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}min`
  }
  return `${hours}h ${mins}min`
}
