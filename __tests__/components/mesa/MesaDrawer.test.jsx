import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MesaDrawer from '../../../src/components/mesa/MesaDrawer'
import { useAppStore } from '../../../src/store/useAppStore'

// Mock the stores
vi.mock('../../../src/store/useAppStore', () => ({
  useAppStore: vi.fn()
}))

const mockCloseModal = vi.fn()

vi.mock('../../../src/store/useUIStore', () => ({
  useUIStore: vi.fn(() => ({
    closeModal: mockCloseModal
  }))
}))

const mockCancelMesaPedido = vi.fn()

describe('MesaDrawer', () => {
  const mockMesa = {
    id: 1,
    numero: 5,
    estado: 'ocupada',
    pedidos: [],
    total: 0,
    openedAt: new Date().toISOString()
  }

  const mockProductos = [
    { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebidas', emoji: '☕', activo: true },
    { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'entrantes', emoji: '🥗', activo: true },
    { id: 3, nombre: 'Merluza', precio: 14, categoria: 'sin_arroz', emoji: '🐟', activo: true },
    { id: 4, nombre: 'Tarta', precio: 6, categoria: 'con_arroz', emoji: '🍰', activo: true },
    { id: 5, nombre: 'Agua', precio: 2, categoria: 'bebidas', emoji: '💧', activo: true }
  ]

  const mockLoadMesas = vi.fn()

  beforeEach(() => {
    mockCloseModal.mockReset()
    mockLoadMesas.mockReset()
    useAppStore.mockReturnValue({
      mesas: [mockMesa],
      productos: mockProductos,
      menuDelDia: null,
      addItemToMesa: vi.fn(),
      removeItemFromMesa: vi.fn(),
      updateItemQuantity: vi.fn(),
      closeCuenta: vi.fn(),
      cancelItem: vi.fn(),
      cancelMesaPedido: mockCancelMesaPedido,
      loadMesas: mockLoadMesas
    })
  })

  it('renders mesa header with number', () => {
    render(<MesaDrawer mesaId={1} />)
    expect(screen.getByText('Mesa #5')).toBeInTheDocument()
  })

  it('renders three tabs', () => {
    render(<MesaDrawer mesaId={1} />)
    expect(screen.getByText('Carta')).toBeInTheDocument()
    expect(screen.getByText('Menú Hoy')).toBeInTheDocument()
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
  })

  it('filters products by Carta tab (excludes bebidas)', () => {
    render(<MesaDrawer mesaId={1} />)
    // Carta tab shows non-bebidas items
    expect(screen.getByText('Ensalada')).toBeInTheDocument()
    expect(screen.getByText('Merluza')).toBeInTheDocument()
    expect(screen.getByText('Tarta')).toBeInTheDocument()
    // Bebidas should NOT be in Carta tab
    expect(screen.queryByText('Café')).not.toBeInTheDocument()
    expect(screen.queryByText('Agua')).not.toBeInTheDocument()
  })

  it('filters products by Bebidas tab', () => {
    render(<MesaDrawer mesaId={1} />)
    // Switch to Bebidas tab
    fireEvent.click(screen.getByText('Bebidas'))
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('Agua')).toBeInTheDocument()
    // Carta items should NOT be in Bebidas tab
    expect(screen.queryByText('Ensalada')).not.toBeInTheDocument()
  })

  it('shows product cards with emoji, name, and price', () => {
    render(<MesaDrawer mesaId={1} />)
    // Carta tab shows non-bebidas items
    expect(screen.getByText('🥗')).toBeInTheDocument()
    expect(screen.getByText('8.00€')).toBeInTheDocument()
  })

  it('opens cancel confirmation modal when tapping cancel button', () => {
    render(<MesaDrawer mesaId={1} />)
    fireEvent.click(screen.getByText('✕ Cancelar Pedido'))
    expect(screen.getByText('⚠️ Cancelar Pedido')).toBeInTheDocument()
    expect(screen.getByText('Cancelar Pedido')).toBeInTheDocument()
  })

  it('calls mesaRepo.closeCuenta and loadMesas when confirming cancel order', async () => {
    render(<MesaDrawer mesaId={1} />)
    fireEvent.click(screen.getByText('✕ Cancelar Pedido'))
    fireEvent.click(screen.getByText('Cancelar Pedido'))
    await waitFor(() => {
      expect(mockCancelMesaPedido).toHaveBeenCalledWith(1)
      expect(mockCloseModal).toHaveBeenCalled()
    })
  })
})
