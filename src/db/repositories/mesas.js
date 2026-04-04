import { db } from '../schema'

export const mesaRepo = {
  getAll: async () => {
    return await db.mesas.toArray()
  },

  getById: async (id) => {
    return await db.mesas.get(id)
  },

  create: async (data) => {
    return await db.mesas.add(data)
  },

  update: async (id, data) => {
    return await db.mesas.update(id, data)
  },

  delete: async (id) => {
    return await db.mesas.delete(id)
  },

  /**
   * Persist pedidos array and total for a given mesa.
   * @param {number} id - Mesa ID
   * @param {Array} pedidos - Array of PedidoItem objects
   * @param {number} total - Computed total
   */
  updatePedidos: async (id, pedidos, total) => {
    return await db.mesas.update(id, {
      pedidos,
      total,
      updatedAt: new Date().toISOString()
    })
  },

  /**
   * Reset a mesa to libre state, clearing pedidos, total, and openedAt.
   * @param {number} id - Mesa ID
   */
  closeCuenta: async (id) => {
    return await db.mesas.update(id, {
      estado: 'libre',
      pedidos: [],
      total: 0,
      openedAt: null,
      updatedAt: new Date().toISOString()
    })
  },

  /**
   * Return all mesas matching the given estado.
   * @param {string} estado - 'libre' | 'ocupada' | 'cuenta'
   */
  getByEstado: async (estado) => {
    return await db.mesas.where('estado').equals(estado).toArray()
  }
}
