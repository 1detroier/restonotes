import { db } from '../schema'

/**
 * Repository for ventas (sales snapshots).
 * Each venta is a snapshot saved when a mesa's account is closed.
 */
export const ventaRepo = {
  /**
   * Create a venta record.
   * @param {Object} venta - { mesaId, fecha, timestamp, total, items, paymentMethod }
   * @returns {Promise<number>} The inserted venta id
   */
  create: async (venta) => {
    return await db.ventas.add(venta)
  },

  /**
   * Get all ventas for a specific date.
   * @param {string} fecha - YYYY-MM-DD
   * @returns {Promise<Array>} Ventas sorted by timestamp ascending
   */
  getByFecha: async (fecha) => {
    return await db.ventas.where('fecha').equals(fecha).sortBy('timestamp')
  },

  /**
   * Get all ventas.
   * @returns {Promise<Array>} All ventas sorted by timestamp descending
   */
  getAll: async () => {
    return await db.ventas.reverse().sortBy('timestamp')
  },

  /**
   * Get the sum of all totals for a given date.
   * @param {string} fecha - YYYY-MM-DD
   * @returns {Promise<number>} Sum of totals
   */
  getTotalByDate: async (fecha) => {
    const ventas = await db.ventas.where('fecha').equals(fecha).toArray()
    return ventas.reduce((sum, v) => sum + (v.total || 0), 0)
  },

  /**
   * Delete a venta record.
   * @param {number} id - Venta ID
   */
  delete: async (id) => {
    return await db.ventas.delete(id)
  }
}
