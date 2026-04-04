import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { menuDiaRepo } from '../../src/db/repositories/menuDia'

describe('menuDiaRepo extensions', () => {
  beforeEach(async () => {
    await db.menuDia.clear()
  })

  afterEach(async () => {
    await db.menuDia.clear()
  })

  const sampleMenus = [
    { id: 1, fecha: '2026-04-01', primeroIds: [1], segundoIds: [3], postreIds: [4], precio: 15, incluyeBebida: false, activo: true, createdAt: '2026-04-01', updatedAt: '2026-04-01' },
    { id: 2, fecha: '2026-04-02', primeroIds: [2], segundoIds: [3], postreIds: [], precio: 14, incluyeBebida: true, activo: true, createdAt: '2026-04-02', updatedAt: '2026-04-02' },
    { id: 3, fecha: '2026-04-03', primeroIds: [1, 2], segundoIds: [3], postreIds: [4], precio: 16, incluyeBebida: false, activo: true, createdAt: '2026-04-03', updatedAt: '2026-04-03' }
  ]

  async function seed(data) {
    for (const m of data) {
      await db.menuDia.add(m)
    }
  }

  describe('getByFecha', () => {
    it('returns menu for the given date', async () => {
      await seed(sampleMenus)

      const result = await menuDiaRepo.getByFecha('2026-04-02')

      expect(result).not.toBeNull()
      expect(result.fecha).toBe('2026-04-02')
      expect(result.precio).toBe(14)
    })

    it('returns null when no menu exists for date', async () => {
      await seed(sampleMenus)

      const result = await menuDiaRepo.getByFecha('2026-04-10')

      expect(result).toBeNull()
    })
  })

  describe('deactivateAll', () => {
    it('sets activo=false for all menus', async () => {
      await seed(sampleMenus)

      await menuDiaRepo.deactivateAll()

      const all = await db.menuDia.toArray()
      all.forEach((m) => expect(m.activo).toBe(false))
    })

    it('works when no menus exist', async () => {
      await expect(menuDiaRepo.deactivateAll()).resolves.not.toThrow()
    })
  })

  describe('getHistorial', () => {
    it('returns most recent menus ordered by fecha descending', async () => {
      await seed(sampleMenus)

      const result = await menuDiaRepo.getHistorial(2)

      expect(result).toHaveLength(2)
      expect(result[0].fecha).toBe('2026-04-03')
      expect(result[1].fecha).toBe('2026-04-02')
    })

    it('returns all menus when limit exceeds count', async () => {
      await seed(sampleMenus)

      const result = await menuDiaRepo.getHistorial(10)

      expect(result).toHaveLength(3)
      expect(result[0].fecha).toBe('2026-04-03')
    })

    it('returns empty array when no menus exist', async () => {
      const result = await menuDiaRepo.getHistorial(5)

      expect(result).toHaveLength(0)
    })
  })
})
