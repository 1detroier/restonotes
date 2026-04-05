import { db } from '../schema'

/**
 * Repository for cocina (kitchen queue items).
 * Tracks status of order items from all occupied mesas.
 */
export const cocinaRepo = {
  /**
   * Create a cocina item.
   * @param {Object} item - { mesaId, pedidoId, productoNombre, cantidad, precio, status, timestamp, nota }
   * @returns {Promise<number>} The inserted cocina item id
   */
  create: async (item) => {
    return await db.cocina.add(item)
  },

  /**
   * Update the status of a cocina item.
   * @param {number} id - Cocina item ID
   * @param {string} status - New status value
   * @returns {Promise<void>}
   */
  updateStatus: async (id, status) => {
    await db.cocina.update(id, { status })
  },

  /**
   * Get all pending items (pendiente or en_curso).
   * @returns {Promise<Array>} Cocina items sorted by timestamp ascending
   */
  getPending: async () => {
    const items = await db.cocina.toArray()
    return items
      .filter((item) => item.status === 'pendiente' || item.status === 'en_curso')
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  },

  /**
   * Get all cocina items.
   * @returns {Promise<Array>} All items sorted by timestamp descending
   */
  getAll: async () => {
    return await db.cocina.reverse().sortBy('timestamp')
  },

  /**
   * Get all cocina items for a specific mesa.
   * @param {number} mesaId - Mesa ID
   * @returns {Promise<Array>} Cocina items for the mesa
   */
  getByMesaId: async (mesaId) => {
    return await db.cocina.where('mesaId').equals(mesaId).toArray()
  }
}
