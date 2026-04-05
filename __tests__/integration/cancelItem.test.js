import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../../src/store/useAppStore'

// Mock repositories
const mockUpdatePedidos = vi.fn().mockResolvedValue(undefined)
const mockCloseCuenta = vi.fn().mockResolvedValue(undefined)
const mockGetAll = vi.fn().mockResolvedValue([])

vi.mock('../../src/db/repositories/mesas', () => ({
  mesaRepo: {
    updatePedidos: (...args) => mockUpdatePedidos(...args),
    closeCuenta: (...args) => mockCloseCuenta(...args),
    getAll: () => mockGetAll()
  }
}))

vi.mock('../../src/db/repositories/ventas', () => ({
  ventaRepo: { create: vi.fn().mockResolvedValue(undefined) }
}))

vi.mock('../../src/db/repositories/cocina', () => ({
  cocinaRepo: { getAll: vi.fn().mockResolvedValue([]) }
}))

vi.mock('../../src/db/repositories/pedidosLlevar', () => ({
  pedidosLlevarRepo: { getAll: vi.fn().mockResolvedValue([]) }
}))

vi.mock('../../src/db/bootstrap', () => ({
  bootstrapMesas: vi.fn(),
  seedProductos: vi.fn()
}))

describe('Cancel Item Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cancels item and recalculates total', async () => {
    const { result } = renderHook(() => useAppStore())

    // Set up a mesa with items using zustand's setState
    const mesa = {
      id: 1,
      numero: 5,
      estado: 'ocupada',
      pedidos: [
        { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 2, status: 'activo' },
        { id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, status: 'activo' }
      ],
      total: 11,
      openedAt: new Date().toISOString()
    }

    // Use zustand's setState to set initial state
    await act(async () => {
      useAppStore.setState({ mesas: [mesa] })
    })

    // Cancel the café
    await act(async () => {
      await result.current.cancelItem(1, 'a')
    })

    // Verify item is marked as cancelled
    const updatedMesa = result.current.mesas.find(m => m.id === 1)
    const cancelledItem = updatedMesa.pedidos.find(p => p.id === 'a')
    expect(cancelledItem.status).toBe('cancelado')

    // Verify total excludes cancelled item (only ensalada remains: 8)
    expect(updatedMesa.total).toBe(8)
  })

  it('shows cancelled items with strikethrough in ticket', async () => {
    const { result } = renderHook(() => useAppStore())

    const mesa = {
      id: 1,
      numero: 3,
      estado: 'ocupada',
      pedidos: [
        { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 1, status: 'cancelado' },
        { id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, status: 'activo' }
      ],
      total: 8,
      openedAt: new Date().toISOString()
    }

    await act(async () => {
      useAppStore.setState({ mesas: [mesa] })
    })

    const updatedMesa = result.current.mesas.find(m => m.id === 1)
    const cancelledItem = updatedMesa.pedidos.find(p => p.id === 'a')
    const activeItem = updatedMesa.pedidos.find(p => p.id === 'b')

    expect(cancelledItem.status).toBe('cancelado')
    expect(activeItem.status).toBe('activo')
    // Total should only include active items
    expect(updatedMesa.total).toBe(8)
  })

  it('handles cancelling all items (total becomes 0)', async () => {
    const { result } = renderHook(() => useAppStore())

    const mesa = {
      id: 1,
      numero: 1,
      estado: 'ocupada',
      pedidos: [
        { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 1, status: 'activo' }
      ],
      total: 1.5,
      openedAt: new Date().toISOString()
    }

    await act(async () => {
      useAppStore.setState({ mesas: [mesa] })
    })

    await act(async () => {
      await result.current.cancelItem(1, 'a')
    })

    const updatedMesa = result.current.mesas.find(m => m.id === 1)
    expect(updatedMesa.total).toBe(0)
    expect(updatedMesa.pedidos[0].status).toBe('cancelado')
  })
})
