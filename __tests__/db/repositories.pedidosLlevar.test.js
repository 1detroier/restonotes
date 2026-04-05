import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { pedidosLlevarRepo } from '../../src/db/repositories/pedidosLlevar'

describe('pedidosLlevarRepo', () => {
  beforeEach(async () => {
    await db.pedidosLlevar.clear()
    const now = '2026-04-05T10:00:00Z'
    await db.pedidosLlevar.bulkAdd([
      { id: 1, customerName: 'Juan', pedidos: [], status: 'pendiente', total: 0, createdAt: now, updatedAt: now },
      { id: 2, customerName: 'María', pedidos: [{ nombre: 'Café', cantidad: 1, precio: 1.5 }], status: 'listo', total: 1.5, createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-05T09:30:00Z' },
      { id: 3, customerName: 'Pedro', pedidos: [], status: 'entregado', total: 0, createdAt: '2026-04-05T08:00:00Z', updatedAt: '2026-04-05T08:30:00Z' }
    ])
  })

  afterEach(async () => {
    await db.pedidosLlevar.clear()
  })

  describe('create', () => {
    it('inserts a takeaway order and returns id', async () => {
      const now = new Date().toISOString()
      const id = await pedidosLlevarRepo.create({
        customerName: 'Ana',
        pedidos: [],
        status: 'pendiente',
        total: 0,
        createdAt: now,
        updatedAt: now
      })
      expect(id).toBeDefined()
      const order = await db.pedidosLlevar.get(id)
      expect(order.customerName).toBe('Ana')
    })
  })

  describe('update', () => {
    it('updates fields and sets updatedAt', async () => {
      const before = new Date().toISOString()
      await pedidosLlevarRepo.update(1, { status: 'listo' })
      const order = await db.pedidosLlevar.get(1)
      expect(order.status).toBe('listo')
      expect(order.updatedAt >= before).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes a takeaway order', async () => {
      await pedidosLlevarRepo.delete(1)
      const order = await db.pedidosLlevar.get(1)
      expect(order).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('returns all orders sorted by createdAt desc', async () => {
      const orders = await pedidosLlevarRepo.getAll()
      expect(orders).toHaveLength(3)
      expect(orders[0].createdAt).toBe('2026-04-05T10:00:00Z')
      expect(orders[2].createdAt).toBe('2026-04-05T08:00:00Z')
    })
  })

  describe('getByStatus', () => {
    it('returns orders matching a specific status', async () => {
      const orders = await pedidosLlevarRepo.getByStatus('pendiente')
      expect(orders).toHaveLength(1)
      expect(orders[0].customerName).toBe('Juan')
    })

    it('returns empty array for status with no orders', async () => {
      const orders = await pedidosLlevarRepo.getByStatus('pagado')
      expect(orders).toHaveLength(0)
    })
  })
})
