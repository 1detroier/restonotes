import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { cocinaRepo } from '../../src/db/repositories/cocina'

describe('cocinaRepo', () => {
  beforeEach(async () => {
    await db.cocina.clear()
    // Seed cocina items
    await db.cocina.bulkAdd([
      { id: 1, mesaId: 3, pedidoId: 'a', productoNombre: 'Café', cantidad: 2, precio: 1.5, status: 'pendiente', timestamp: '2026-04-05T10:00:00Z', nota: '' },
      { id: 2, mesaId: 3, pedidoId: 'b', productoNombre: 'Ensalada', cantidad: 1, precio: 8, status: 'en_curso', timestamp: '2026-04-05T10:05:00Z', nota: 'Sin cebolla' },
      { id: 3, mesaId: 7, pedidoId: 'c', productoNombre: 'Tarta', cantidad: 1, precio: 6, status: 'listo', timestamp: '2026-04-05T09:00:00Z', nota: '' },
      { id: 4, mesaId: 7, pedidoId: 'd', productoNombre: 'Sopa', cantidad: 1, precio: 5, status: 'pendiente', timestamp: '2026-04-05T10:10:00Z', nota: '' }
    ])
  })

  afterEach(async () => {
    await db.cocina.clear()
  })

  describe('create', () => {
    it('inserts a cocina record and returns id', async () => {
      const id = await cocinaRepo.create({
        mesaId: 5,
        pedidoId: 'x',
        productoNombre: 'Pizza',
        cantidad: 1,
        precio: 12,
        status: 'pendiente',
        timestamp: '2026-04-05T12:00:00Z',
        nota: ''
      })
      expect(id).toBeDefined()
      const item = await db.cocina.get(id)
      expect(item.productoNombre).toBe('Pizza')
      expect(item.status).toBe('pendiente')
    })
  })

  describe('updateStatus', () => {
    it('updates status from pendiente to en_curso', async () => {
      await cocinaRepo.updateStatus(1, 'en_curso')
      const item = await db.cocina.get(1)
      expect(item.status).toBe('en_curso')
    })

    it('updates status from en_curso to listo', async () => {
      await cocinaRepo.updateStatus(2, 'listo')
      const item = await db.cocina.get(2)
      expect(item.status).toBe('listo')
    })
  })

  describe('getPending', () => {
    it('returns only pendiente and en_curso items', async () => {
      const items = await cocinaRepo.getPending()
      expect(items).toHaveLength(3)
      expect(items.every((i) => i.status === 'pendiente' || i.status === 'en_curso')).toBe(true)
    })

    it('sorts by timestamp ascending', async () => {
      const items = await cocinaRepo.getPending()
      expect(items[0].timestamp).toBe('2026-04-05T10:00:00Z')
      expect(items[2].timestamp).toBe('2026-04-05T10:10:00Z')
    })
  })

  describe('getAll', () => {
    it('returns all items sorted by timestamp desc', async () => {
      const items = await cocinaRepo.getAll()
      expect(items).toHaveLength(4)
      expect(items[0].timestamp).toBe('2026-04-05T10:10:00Z')
      expect(items[3].timestamp).toBe('2026-04-05T09:00:00Z')
    })
  })

  describe('getByMesaId', () => {
    it('returns all items for a specific mesa', async () => {
      const items = await cocinaRepo.getByMesaId(3)
      expect(items).toHaveLength(2)
      expect(items.every((i) => i.mesaId === 3)).toBe(true)
    })

    it('returns empty array for mesa with no items', async () => {
      const items = await cocinaRepo.getByMesaId(99)
      expect(items).toHaveLength(0)
    })
  })
})
