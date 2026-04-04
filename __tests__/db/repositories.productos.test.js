import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { productoRepo } from '../../src/db/repositories/productos'

describe('productoRepo extensions', () => {
  beforeEach(async () => {
    await db.productos.clear()
  })

  afterEach(async () => {
    await db.productos.clear()
  })

  const sampleProductos = [
    { id: 1, nombre: 'Ensalada Mixta', precio: 8.5, categoria: 'primero', emoji: '🥗', activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 2, nombre: 'Sopa de Ajo', precio: 7, categoria: 'primero', emoji: '🍲', activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 3, nombre: 'Merluza a la Plancha', precio: 14, categoria: 'segundo', emoji: '🐟', activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 4, nombre: 'Tarta de Queso', precio: 6, categoria: 'postre', emoji: '🍰', activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 5, nombre: 'Café Solo', precio: 1.5, categoria: 'cafeteria', emoji: '☕', activo: false, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 6, nombre: 'Café con Leche', precio: 2, categoria: 'cafeteria', emoji: '☕', activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' }
  ]

  async function seed(data) {
    for (const p of data) {
      await db.productos.add(p)
    }
  }

  describe('getByCategoria', () => {
    it('returns productos filtered by category sorted by nombre', async () => {
      await seed(sampleProductos)

      const result = await productoRepo.getByCategoria('primero')

      expect(result).toHaveLength(2)
      expect(result[0].nombre).toBe('Ensalada Mixta')
      expect(result[1].nombre).toBe('Sopa de Ajo')
    })

    it('returns empty array for non-existent category', async () => {
      await seed(sampleProductos)

      const result = await productoRepo.getByCategoria('bebida')

      expect(result).toHaveLength(0)
    })
  })

  describe('searchByNombre', () => {
    it('returns active productos matching query case-insensitive', async () => {
      await seed(sampleProductos)

      const result = await productoRepo.searchByNombre('café')

      expect(result).toHaveLength(1)
      expect(result[0].nombre).toBe('Café con Leche')
    })

    it('excludes inactive productos', async () => {
      await seed(sampleProductos)

      const result = await productoRepo.searchByNombre('café solo')

      expect(result).toHaveLength(0)
    })

    it('returns empty array for no matches', async () => {
      await seed(sampleProductos)

      const result = await productoRepo.searchByNombre('pizza')

      expect(result).toHaveLength(0)
    })
  })

  describe('bulkAdd', () => {
    it('inserts multiple productos in a single transaction', async () => {
      // Clear any existing data first
      await db.productos.clear()

      const items = [
        { id: 10, nombre: 'Item A', precio: 5, categoria: 'primero', emoji: '🍝', activo: true },
        { id: 11, nombre: 'Item B', precio: 6, categoria: 'segundo', emoji: '🥩', activo: true }
      ]

      await productoRepo.bulkAdd(items)

      const all = await db.productos.toArray()
      expect(all).toHaveLength(2)
      expect(all.some((p) => p.nombre === 'Item A')).toBe(true)
      expect(all.some((p) => p.nombre === 'Item B')).toBe(true)
    })

    it('upserts existing productos (bulkPut behavior)', async () => {
      await seed([sampleProductos[0]])

      const items = [
        { id: 1, nombre: 'Ensalada Actualizada', precio: 9, categoria: 'primero', emoji: '🥗', activo: true },
        { id: 20, nombre: 'Nuevo Item', precio: 10, categoria: 'postre', emoji: '🍰', activo: true }
      ]

      await productoRepo.bulkAdd(items)

      const updated = await db.productos.get(1)
      expect(updated.nombre).toBe('Ensalada Actualizada')

      const inserted = await db.productos.get(20)
      expect(inserted.nombre).toBe('Nuevo Item')
    })
  })
})
