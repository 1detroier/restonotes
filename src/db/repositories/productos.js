import { db } from '../schema'

export const productoRepo = {
  getAll: async () => {
    return await db.productos.toArray()
  },

  getById: async (id) => {
    return await db.productos.get(id)
  },

  create: async (data) => {
    return await db.productos.add(data)
  },

  update: async (id, data) => {
    return await db.productos.update(id, data)
  },

  delete: async (id) => {
    return await db.productos.delete(id)
  },

  // T1: Repository extensions
  getByCategoria: async (cat) => {
    return await db.productos
      .where('categoria')
      .equals(cat)
      .sortBy('nombre')
  },

  searchByNombre: async (query) => {
    const q = query.toLowerCase()
    const all = await db.productos.toArray()
    return all
      .filter((p) => p.activo && p.nombre.toLowerCase().includes(q))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  bulkAdd: async (items) => {
    return await db.productos.bulkPut(items)
  }
}
