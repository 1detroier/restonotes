import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { mesaRepo } from '../../src/db/repositories/mesas'

describe('mesaRepo extensions', () => {
  beforeEach(async () => {
    await db.mesas.clear()
    // Seed 3 mesas
    await db.mesas.bulkAdd([
      { id: 1, numero: 1, estado: 'libre', pedidos: [], total: 0, openedAt: null, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
      { id: 2, numero: 2, estado: 'ocupada', pedidos: [{ id: 'a', nombre: 'Café', precio: 1.5, cantidad: 2, categoria: 'bebida' }], total: 3, openedAt: '2026-04-01T10:00:00Z', createdAt: '2026-04-01', updatedAt: '2026-04-01' },
      { id: 3, numero: 3, estado: 'ocupada', pedidos: [{ id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, categoria: 'primero' }], total: 8, openedAt: '2026-04-01T11:00:00Z', createdAt: '2026-04-01', updatedAt: '2026-04-01' }
    ])
  })

  afterEach(async () => {
    await db.mesas.clear()
  })

  describe('updatePedidos', () => {
    it('persists pedidos array and total to IndexedDB', async () => {
      const newPedidos = [{ id: 'x', nombre: 'Tarta', precio: 6, cantidad: 1, categoria: 'postre' }]
      await mesaRepo.updatePedidos(1, newPedidos, 6)

      const mesa = await db.mesas.get(1)
      expect(mesa.pedidos).toHaveLength(1)
      expect(mesa.pedidos[0].nombre).toBe('Tarta')
      expect(mesa.total).toBe(6)
    })

    it('updates the updatedAt timestamp', async () => {
      const before = new Date().toISOString()
      await mesaRepo.updatePedidos(1, [], 0)
      const mesa = await db.mesas.get(1)
      expect(mesa.updatedAt).toBeDefined()
      expect(mesa.updatedAt >= before).toBe(true)
    })
  })

  describe('closeCuenta', () => {
    it('resets mesa to libre state with empty pedidos', async () => {
      await mesaRepo.closeCuenta(2)

      const mesa = await db.mesas.get(2)
      expect(mesa.estado).toBe('libre')
      expect(mesa.pedidos).toEqual([])
      expect(mesa.total).toBe(0)
      expect(mesa.openedAt).toBeNull()
    })
  })

  describe('getByEstado', () => {
    it('returns all mesas matching the given estado', async () => {
      const ocupadas = await mesaRepo.getByEstado('ocupada')
      expect(ocupadas).toHaveLength(2)
      expect(ocupadas.map((m) => m.id).sort()).toEqual([2, 3])
    })

    it('returns empty array for estado with no mesas', async () => {
      const cuenta = await mesaRepo.getByEstado('cuenta')
      expect(cuenta).toHaveLength(0)
    })

    it('returns free mesas', async () => {
      const libres = await mesaRepo.getByEstado('libre')
      expect(libres).toHaveLength(1)
      expect(libres[0].id).toBe(1)
    })
  })
})
