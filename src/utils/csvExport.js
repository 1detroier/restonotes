/**
 * Export ventas data to CSV with UTF-8 BOM for Excel compatibility.
 * @param {Array} ventas - Array of venta records
 * @param {string} filename - Filename (default: ventas-YYYY-MM-DD.csv)
 */
export function exportVentasToCSV(ventas, filename) {
  // UTF-8 BOM for Excel compatibility with ñ and accents
  const BOM = '\uFEFF'

  // CSV headers
  const headers = ['Fecha', 'Hora', 'Mesa', 'Items', 'Total', 'Método de pago']

  // Build rows
  const rows = ventas.map((venta) => {
    const fecha = venta.fecha || ''
    const timestamp = venta.timestamp || ''
    const hora = timestamp ? timestamp.substring(11, 16) : ''
    const mesa = venta.mesaId != null ? `Mesa #${venta.mesaId}` : 'Para Llevar'
    const items = formatItems(venta.items || [])
    const total = (venta.total || 0).toFixed(2)
    const paymentMethod = formatPaymentMethod(venta.paymentMethod)

    return [fecha, hora, mesa, items, total, paymentMethod].map(escapeCSV).join(',')
  })

  // Combine BOM + headers + rows
  const csvContent = BOM + headers.join(',') + '\n' + rows.join('\n')

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `ventas-${new Date().toISOString().substring(0, 10)}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format items array into a semicolon-separated string.
 * @param {Array} items - Array of pedido items
 * @returns {string} Formatted items string
 */
function formatItems(items) {
  return items
    .map((item) => `${item.cantidad}× ${item.nombre}`)
    .join('; ')
}

/**
 * Escape a CSV field value (wrap in quotes if it contains commas, quotes, or newlines).
 * @param {string} value - Field value
 * @returns {string} Escaped value
 */
function escapeCSV(value) {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Format payment method to human-readable label.
 * @param {string} method - Payment method key
 * @returns {string} Human-readable label
 */
function formatPaymentMethod(method) {
  const labels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta'
  }
  return labels[method] || method || ''
}
