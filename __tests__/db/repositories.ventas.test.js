import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { ventaRepo } from '../../src/db/repositories/ventas'

describe('ventaRepo', () => {
  beforeEach(async () => {
    await db.ventas.clear()
    // Seed ventas
    await db.ventas.bulkAdd([
      { id: 1, mesaId: 3, fecha: '2026-04-05', timestamp: '2026-04-05T10:00:00Z', total: 25, items: [{ nombre: 'Café', cantidad: 2, precio: 1.5 }], paymentMethod: 'efectivo' },
      { id: 2, mesaId: 7, fecha: '2026-04-05', timestamp: '2026-04-05T11:30:00Z', total: 40, items: [{ nombre: 'Ensalada', cantidad: 1, precio: 8 }], paymentMethod: 'tarjeta' },
      { id: 3, mesaId: 1, fecha: '2026-04-04', timestamp: '2026-04-04T20:00:00Z', total: 15, items: [], paymentMethod: 'efectivo' }
    ])
  })

  afterEach(async () => {
    await db.ventas.clear()
  })

  describe('create', () => {
    it('inserts a venta record and returns id', async () => {
      const id = await ventaRepo.create({
        mesaId: 5,
        fecha: '2026-04-05',
        timestamp: '2026-04-05T14:00:00Z',
        total: 30,
        items: [],
        paymentMethod: 'efectivo'
      })
      expect(id).toBeDefined()
      const venta = await db.ventas.get(id)
      expect(venta.mesaId).toBe(5)
      expect(venta.total).toBe(30)
    })
  })

  describe('getByFecha', () => {
    it('returns all ventas for a specific date sorted by timestamp asc', async () => {
      const ventas = await ventaRepo.getByFecha('2026-04-05')
      expect(ventas).toHaveLength(2)
      expect(ventas[0].timestamp).toBe('2026-04-05T10:00:00Z')
      expect(ventas[1].timestamp).toBe('2026-04-05T11:30:00Z')
    })

    it('returns empty array for date with no ventas', async () => {
      const ventas = await ventaRepo.getByFecha('2026-01-01')
      expect(ventas).toHaveLength(0)
    })
  })

  describe('getAll', () => {
    it('returns all ventas sorted by timestamp desc', async () => {
      const ventas = await ventaRepo.getAll()
      expect(ventas).toHaveLength(3)
      expect(ventas[0].timestamp).toBe('2026-04-05T11:30:00Z')
      expect(ventas[2].timestamp).toBe('2026-04-04T20:00:00Z')
    })
  })

  describe('getTotalByDate', () => {
    it('returns sum of totals for a given date', async () => {
      const total = await ventaRepo.getTotalByDate('2026-04-05')
      expect(total).toBe(65) // 25 + 40
    })

    it('returns 0 for date with no ventas', async () => {
      const total = await ventaRepo.getTotalByDate('2026-01-01')
      expect(total).toBe(0)
    })
  })
})
