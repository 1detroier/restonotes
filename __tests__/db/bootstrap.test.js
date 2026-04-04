import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../src/db/schema'
import { bootstrapMesas, seedProductos } from '../../src/db/bootstrap'
import { MESA_COUNT } from '../../src/utils/constants'

describe('bootstrap', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.mesas.clear()
    await db.productos.clear()
  })

  afterEach(async () => {
    // Clean up after tests
    await db.mesas.clear()
    await db.productos.clear()
  })

  describe('bootstrapMesas', () => {
    it('creates 14 mesas when table is empty', async () => {
      const countBefore = await db.mesas.count()
      expect(countBefore).toBe(0)

      await bootstrapMesas()

      const countAfter = await db.mesas.count()
      expect(countAfter).toBe(MESA_COUNT)
    })

    it('is idempotent - does not duplicate on second call', async () => {
      await bootstrapMesas()
      const countFirst = await db.mesas.count()
      expect(countFirst).toBe(MESA_COUNT)

      await bootstrapMesas()
      const countSecond = await db.mesas.count()
      expect(countSecond).toBe(MESA_COUNT)
    })

    it('creates mesas with estado "libre"', async () => {
      await bootstrapMesas()
      const mesas = await db.mesas.toArray()

      mesas.forEach((mesa) => {
        expect(mesa.estado).toBe('libre')
      })
    })

    it('creates mesas with sequential numbers 1-14', async () => {
      await bootstrapMesas()
      const mesas = await db.mesas.toArray()
      const numeros = mesas.map((m) => m.numero).sort((a, b) => a - b)

      expect(numeros).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    })
  })

  describe('seedProductos', () => {
    it('creates sample products when table is empty', async () => {
      const countBefore = await db.productos.count()
      expect(countBefore).toBe(0)

      await seedProductos()

      const countAfter = await db.productos.count()
      expect(countAfter).toBe(12)
    })

    it('is idempotent - does not duplicate on second call', async () => {
      await seedProductos()
      const countFirst = await db.productos.count()
      expect(countFirst).toBe(12)

      await seedProductos()
      const countSecond = await db.productos.count()
      expect(countSecond).toBe(12)
    })

    it('creates products with activo=true', async () => {
      await seedProductos()
      const productos = await db.productos.toArray()

      productos.forEach((p) => {
        expect(p.activo).toBe(true)
      })
    })
  })
})
