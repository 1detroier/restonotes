import { db } from '../schema'
import { CATEGORIAS_CARTA, CATEGORIA_LABELS } from '../../utils/constants'

// Default categories to seed on first run
const DEFAULT_CATEGORIAS = CATEGORIAS_CARTA.map((key, index) => ({
  key,
  label: CATEGORIA_LABELS[key] || key,
  tipo: 'carta',
  orden: index
}))

export const categoriaRepo = {
  /**
   * Get all categories ordered by 'orden'
   */
  getAll: async () => {
    return await db.categorias.orderBy('orden').toArray()
  },

  /**
   * Get a single category by id
   */
  getById: async (id) => {
    return await db.categorias.get(id)
  },

  /**
   * Get a category by key
   */
  getByKey: async (key) => {
    return await db.categorias.where('key').equals(key).first()
  },

  /**
   * Get categories filtered by tipo (e.g., 'carta')
   */
  getByTipo: async (tipo) => {
    return await db.categorias.where('tipo').equals(tipo).sortBy('orden')
  },

  /**
   * Create a new category
   */
  create: async (data) => {
    return await db.categorias.add(data)
  },

  /**
   * Update an existing category
   */
  update: async (id, data) => {
    return await db.categorias.update(id, data)
  },

  /**
   * Delete a category by id
   */
  delete: async (id) => {
    return await db.categorias.delete(id)
  },

  /**
   * Seed default categories if table is empty
   */
  seedDefaults: async () => {
    const count = await db.categorias.count()
    if (count === 0) {
      await db.categorias.bulkAdd(DEFAULT_CATEGORIAS)
      console.log('[CategoriaRepo] Seeded default categories')
    }
  },

  /**
   * Check if a category key is a default (cannot be deleted)
   */
  isDefault: (key) => {
    return CATEGORIAS_CARTA.includes(key)
  }
}