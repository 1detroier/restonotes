import { describe, it, expect } from 'vitest'
import { calcTotal, groupByCategory, condenseMenuDia, createPedidoItem, isCancelled, getCancelledCount } from '../../src/utils/orderHelpers'

describe('orderHelpers', () => {
  describe('calcTotal', () => {
    it('returns 0 for empty array', () => {
      expect(calcTotal([])).toBe(0)
    })

    it('returns 0 for null/undefined', () => {
      expect(calcTotal(null)).toBe(0)
      expect(calcTotal(undefined)).toBe(0)
    })

    it('calculates sum of precio * cantidad', () => {
      const pedidos = [
        { precio: 1.5, cantidad: 2 },
        { precio: 8, cantidad: 1 }
      ]
      expect(calcTotal(pedidos)).toBe(11)
    })

    it('handles single item', () => {
      expect(calcTotal([{ precio: 5, cantidad: 3 }])).toBe(15)
    })

    it('excludes cancelled items from total', () => {
      const pedidos = [
        { precio: 10, cantidad: 1, status: 'activo' },
        { precio: 5, cantidad: 1, status: 'cancelado' },
        { precio: 8, cantidad: 2, status: 'activo' }
      ]
      expect(calcTotal(pedidos)).toBe(26) // 10 + 16, excludes cancelled 5
    })

    it('treats items without status as active (backward compatible)', () => {
      const pedidos = [
        { precio: 10, cantidad: 1 },
        { precio: 5, cantidad: 1 }
      ]
      expect(calcTotal(pedidos)).toBe(15)
    })
  })

  describe('groupByCategory', () => {
    it('returns empty object for non-array', () => {
      expect(groupByCategory(null)).toEqual({})
    })

    it('groups items by categoria', () => {
      const pedidos = [
        { nombre: 'Café', categoria: 'bebida' },
        { nombre: 'Ensalada', categoria: 'primero' },
        { nombre: 'Agua', categoria: 'bebida' }
      ]
      const result = groupByCategory(pedidos)
      expect(Object.keys(result)).toHaveLength(2)
      expect(result.bebida).toHaveLength(2)
      expect(result.primero).toHaveLength(1)
    })

    it('defaults to "otros" for missing categoria', () => {
      const pedidos = [{ nombre: 'Mystery', categoria: null }]
      const result = groupByCategory(pedidos)
      expect(result.otros).toHaveLength(1)
    })
  })

  describe('condenseMenuDia', () => {
    const menuDelDia = { activo: true, precio: 12 }

    it('returns pedidos as-is when no menu is active', () => {
      const pedidos = [{ categoria: 'primero' }]
      expect(condenseMenuDia(pedidos, null)).toBe(pedidos)
    })

    it('condenses 1 primero + 1 segundo + 1 postre into Menú Completo', () => {
      const pedidos = [
        { id: '1', categoria: 'primero', nombre: 'Ensalada', precio: 8, cantidad: 1 },
        { id: '2', categoria: 'segundo', nombre: 'Merluza', precio: 14, cantidad: 1 },
        { id: '3', categoria: 'postre', nombre: 'Tarta', precio: 6, cantidad: 1 }
      ]
      const result = condenseMenuDia(pedidos, menuDelDia)
      expect(result).toHaveLength(1)
      expect(result[0].nombre).toBe('Menú Completo')
      expect(result[0].precio).toBe(12)
      expect(result[0].categoria).toBe('menu')
    })

    it('does not condense incomplete menu (missing segundo)', () => {
      const pedidos = [
        { id: '1', categoria: 'primero', nombre: 'Ensalada', precio: 8, cantidad: 1 },
        { id: '3', categoria: 'postre', nombre: 'Tarta', precio: 6, cantidad: 1 }
      ]
      const result = condenseMenuDia(pedidos, menuDelDia)
      expect(result).toHaveLength(2)
    })

    it('preserves non-menu items when condensing', () => {
      const pedidos = [
        { id: '1', categoria: 'primero', nombre: 'Ensalada', precio: 8, cantidad: 1 },
        { id: '2', categoria: 'segundo', nombre: 'Merluza', precio: 14, cantidad: 1 },
        { id: '3', categoria: 'postre', nombre: 'Tarta', precio: 6, cantidad: 1 },
        { id: '4', categoria: 'bebida', nombre: 'Agua', precio: 2, cantidad: 1 }
      ]
      const result = condenseMenuDia(pedidos, menuDelDia)
      expect(result).toHaveLength(2)
      expect(result.find((i) => i.nombre === 'Agua')).toBeDefined()
      expect(result.find((i) => i.nombre === 'Menú Completo')).toBeDefined()
    })
  })

  describe('createPedidoItem', () => {
    it('creates item with denormalized fields', () => {
      const producto = { id: 10, nombre: 'Café', precio: 1.5, categoria: 'bebida', emoji: '☕' }
      const item = createPedidoItem(producto)

      expect(item.productoId).toBe(10)
      expect(item.nombre).toBe('Café')
      expect(item.precio).toBe(1.5)
      expect(item.cantidad).toBe(1)
      expect(item.categoria).toBe('bebida')
      expect(item.emoji).toBe('☕')
      expect(item.subtotal).toBe(1.5)
      expect(item.id).toBeDefined()
    })

    it('respects custom quantity', () => {
      const producto = { id: 1, nombre: 'Tarta', precio: 6, categoria: 'postre' }
      const item = createPedidoItem(producto, 3)
      expect(item.cantidad).toBe(3)
      expect(item.subtotal).toBe(18)
    })

    it('includes tipo and nota fields', () => {
      const producto = { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebida' }
      const item = createPedidoItem(producto, 1, 'menu', 'Sin azúcar')
      expect(item.tipo).toBe('menu')
      expect(item.nota).toBe('Sin azúcar')
    })

    it('includes status field with default "activo"', () => {
      const producto = { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebida' }
      const item = createPedidoItem(producto)
      expect(item.status).toBe('activo')
    })
  })

  describe('isCancelled', () => {
    it('returns true for cancelled items', () => {
      expect(isCancelled({ status: 'cancelado' })).toBe(true)
    })

    it('returns false for active items', () => {
      expect(isCancelled({ status: 'activo' })).toBe(false)
    })

    it('returns false for items without status', () => {
      expect(isCancelled({})).toBe(false)
    })
  })

  describe('getCancelledCount', () => {
    it('returns count of cancelled items', () => {
      const pedidos = [
        { status: 'activo' },
        { status: 'cancelado' },
        { status: 'activo' },
        { status: 'cancelado' }
      ]
      expect(getCancelledCount(pedidos)).toBe(2)
    })

    it('returns 0 for no cancelled items', () => {
      const pedidos = [
        { status: 'activo' },
        { status: 'activo' }
      ]
      expect(getCancelledCount(pedidos)).toBe(0)
    })

    it('returns 0 for non-array input', () => {
      expect(getCancelledCount(null)).toBe(0)
      expect(getCancelledCount(undefined)).toBe(0)
    })
  })
})
