/**
 * Calculate total from pedidos array.
 * Excludes items where status === 'cancelado'.
 * @param {Array} pedidos - Array of PedidoItem objects
 * @returns {number} Sum of (precio * cantidad) for non-cancelled items
 */
export function calcTotal(pedidos) {
  if (!Array.isArray(pedidos) || pedidos.length === 0) return 0
  return pedidos.reduce((sum, item) => {
    if (item.status === 'cancelado') return sum
    return sum + (item.precio * item.cantidad)
  }, 0)
}

/**
 * Check if a pedido item is cancelled.
 * @param {Object} item - PedidoItem object
 * @returns {boolean} True if item.status === 'cancelado'
 */
export function isCancelled(item) {
  return item.status === 'cancelado'
}

/**
 * Count cancelled items in pedidos array.
 * @param {Array} pedidos - Array of PedidoItem objects
 * @returns {number} Count of items with status === 'cancelado'
 */
export function getCancelledCount(pedidos) {
  if (!Array.isArray(pedidos)) return 0
  return pedidos.filter((item) => item.status === 'cancelado').length
}

/**
 * Group pedidos by category.
 * @param {Array} pedidos - Array of PedidoItem objects
 * @returns {Object} { [categoria]: items[] }
 */
export function groupByCategory(pedidos) {
  if (!Array.isArray(pedidos)) return {}
  return pedidos.reduce((groups, item) => {
    const cat = item.categoria || 'otros'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
    return groups
  }, {})
}

/**
 * Detect if pedidos contain exactly 1 primero + 1 segundo + 1 postre
 * and condense into a single "Menú Completo" item.
 * @param {Array} pedidos - Array of PedidoItem objects
 * @param {Object|null} menuDelDia - Active menu with precio field
 * @returns {Array} Condensed pedidos array
 */
export function condenseMenuDia(pedidos, menuDelDia) {
  if (!menuDelDia || !menuDelDia.activo) return pedidos
  if (!Array.isArray(pedidos) || pedidos.length === 0) return pedidos

  const grouped = groupByCategory(pedidos)
  const primeros = grouped.primero || []
  const segundos = grouped.segundo || []
  const postres = grouped.postre || []

  // Check for exactly 1 of each required category
  if (primeros.length === 1 && segundos.length === 1 && postres.length === 1) {
    const menuItems = pedidos.filter(
      (p) => p.categoria !== 'primero' && p.categoria !== 'segundo' && p.categoria !== 'postre'
    )
    menuItems.push({
      id: crypto.randomUUID(),
      productoId: null,
      nombre: 'Menú Completo',
      precio: menuDelDia.precio,
      cantidad: 1,
      categoria: 'menu',
      subtotal: menuDelDia.precio
    })
    return menuItems
  }

  return pedidos
}

/**
 * Create a PedidoItem from a producto.
 * @param {Object} producto - Producto object from DB
 * @param {number} cantidad - Quantity (default 1)
 * @param {string} tipo - 'carta' | 'menu' (default 'carta')
 * @param {string} nota - Optional note
 * @returns {Object} PedidoItem with denormalized fields
 */
export function createPedidoItem(producto, cantidad = 1, tipo = 'carta', nota = '', variantOptions = []) {
  const precio = producto.precio || 0
  const variantLabel = formatVariantLabel(variantOptions)
  return {
    id: crypto.randomUUID(),
    productoId: producto.id,
    nombre: producto.nombre,
    precio,
    cantidad,
    categoria: producto.categoria,
    tipo,
    nota,
    subtotal: precio * cantidad,
    emoji: producto.emoji || '',
    status: 'activo',
    variantOptions: variantOptions || [],
    variantLabel
  }
}

export function formatVariantLabel(variantOptions) {
  if (!variantOptions || variantOptions.length === 0) return ''
  return variantOptions.map((opt) => opt.optionLabel).join(' / ')
}
