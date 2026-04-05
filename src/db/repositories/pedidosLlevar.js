import { db } from '../schema'

/**
 * Repository for pedidosLlevar (takeaway orders).
 */
export const pedidosLlevarRepo = {
  /**
   * Create a takeaway order.
   * @param {Object} order - { customerName, pedidos, status, total, createdAt, updatedAt }
   * @returns {Promise<number>} The inserted order id
   */
  create: async (order) => {
    return await db.pedidosLlevar.add(order)
  },

  /**
   * Update fields of a takeaway order. Automatically sets updatedAt.
   * @param {number} id - Order ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, data) => {
    await db.pedidosLlevar.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  },

  /**
   * Delete a takeaway order.
   * @param {number} id - Order ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await db.pedidosLlevar.delete(id)
  },

  /**
   * Get all takeaway orders.
   * @returns {Promise<Array>} Orders sorted by createdAt descending
   */
  getAll: async () => {
    const orders = await db.pedidosLlevar.toArray()
    return orders.sort((a, b) => {
      const aPickup = a.pickupAt || ''
      const bPickup = b.pickupAt || ''
      if (aPickup && bPickup && aPickup !== bPickup) {
        return aPickup.localeCompare(bPickup)
      }
      const aCreated = a.createdAt || ''
      const bCreated = b.createdAt || ''
      return bCreated.localeCompare(aCreated)
    })
  },

  /**
   * Get all orders matching a specific status.
   * @param {string} status - Status value to filter by
   * @returns {Promise<Array>} Orders with matching status
   */
  getByStatus: async (status) => {
    return await db.pedidosLlevar.where('status').equals(status).toArray()
  }
}
