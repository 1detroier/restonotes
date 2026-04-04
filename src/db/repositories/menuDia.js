import { db } from '../schema'

export const menuDiaRepo = {
  getAll: async () => {
    return await db.menuDia.toArray()
  },

  getById: async (id) => {
    return await db.menuDia.get(id)
  },

  create: async (data) => {
    return await db.menuDia.add(data)
  },

  update: async (id, data) => {
    return await db.menuDia.update(id, data)
  },

  delete: async (id) => {
    return await db.menuDia.delete(id)
  },

  // T2: Repository extensions
  getByFecha: async (date) => {
    const menus = await db.menuDia.where('fecha').equals(date).toArray()
    return menus.length > 0 ? menus[0] : null
  },

  deactivateAll: async () => {
    const allIds = await db.menuDia.toCollection().primaryKeys()
    await db.menuDia.bulkUpdate(
      allIds.map((id) => ({ key: id, changes: { activo: false } }))
    )
  },

  getHistorial: async (limit = 10) => {
    return await db.menuDia
      .orderBy('fecha')
      .reverse()
      .limit(limit)
      .toArray()
  }
}
