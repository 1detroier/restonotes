import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import CartaPage from '../../src/pages/CartaPage'
import { useAppStore } from '../../src/store/useAppStore'
import { useUIStore } from '../../src/store/useUIStore'

// Mock the stores
vi.mock('../../src/store/useAppStore', () => ({
  useAppStore: vi.fn()
}))

vi.mock('../../src/store/useUIStore', () => ({
  useUIStore: vi.fn()
}))

describe('CartaPage Integration', () => {
  const mockAddProducto = vi.fn().mockResolvedValue(undefined)
  const mockUpdateProducto = vi.fn().mockResolvedValue(undefined)
  const mockToggleProducto = vi.fn().mockResolvedValue(undefined)
  const mockDeleteProducto = vi.fn().mockResolvedValue(undefined)
  const mockAddToast = vi.fn()
  const mockOpenModal = vi.fn()
  const mockCloseModal = vi.fn()

  const mockProductos = [
    { id: 1, nombre: 'Ensalada Mixta', precio: 8.5, categoria: 'entrantes', emoji: '🥗', activo: true },
    { id: 2, nombre: 'Paella Valenciana', precio: 14, categoria: 'con_arroz', emoji: '🥘', activo: true },
    { id: 3, nombre: 'Café Solo', precio: 1.5, categoria: 'bebidas', emoji: '☕', activo: false }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    useAppStore.mockReturnValue({
      productos: mockProductos,
      addProducto: mockAddProducto,
      updateProducto: mockUpdateProducto,
      toggleProducto: mockToggleProducto,
      deleteProducto: mockDeleteProducto
    })
    useUIStore.mockReturnValue({
      modals: [],
      toasts: [],
      addToast: mockAddToast,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      setModals: vi.fn()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders page title and product list', () => {
    render(<CartaPage />)

    expect(screen.getByText('La Carta')).toBeInTheDocument()
    expect(screen.getByText('Ensalada Mixta')).toBeInTheDocument()
    expect(screen.getByText('Paella Valenciana')).toBeInTheDocument()
  })

  it('does not show inactive productos', () => {
    render(<CartaPage />)

    expect(screen.queryByText('Café Solo')).not.toBeInTheDocument()
  })

  it('opens modal when FAB is clicked', () => {
    render(<CartaPage />)

    fireEvent.click(screen.getByLabelText('Nuevo producto'))

    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('filters productos by search query', async () => {
    render(<CartaPage />)

    const searchInput = screen.getByPlaceholderText('Buscar producto...')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'ensalada' } })
      vi.advanceTimersByTime(350)
    })

    expect(screen.getByText('Ensalada Mixta')).toBeInTheDocument()
    expect(screen.queryByText('Merluza')).not.toBeInTheDocument()
  })

  it('filters productos by category', () => {
    render(<CartaPage />)

    // Use getAllByText since "Con Arroz" appears in chip
    const chipBtns = screen.getAllByText('Con Arroz')
    // The chip button is the one with btn class
    const chip = chipBtns.find((el) => el.tagName === 'BUTTON')
    fireEvent.click(chip)

    expect(screen.getByText('Paella Valenciana')).toBeInTheDocument()
    expect(screen.queryByText('Ensalada Mixta')).not.toBeInTheDocument()
  })

  it('calls toggleProducto when toggle button clicked', async () => {
    render(<CartaPage />)

    const toggleBtns = screen.getAllByLabelText('Desactivar')
    await act(async () => {
      fireEvent.click(toggleBtns[0])
    })

    expect(mockToggleProducto).toHaveBeenCalledWith(1)
  })

  it('calls deleteProducto when delete button clicked', async () => {
    render(<CartaPage />)

    const deleteBtn = screen.getAllByLabelText('Eliminar')[0]
    await act(async () => {
      fireEvent.click(deleteBtn)
    })

    expect(mockDeleteProducto).toHaveBeenCalledWith(1)
  })

  it('shows empty state when no productos match filters', () => {
    useAppStore.mockReturnValue({
      productos: [],
      addProducto: mockAddProducto,
      updateProducto: mockUpdateProducto,
      toggleProducto: mockToggleProducto,
      deleteProducto: mockDeleteProducto
    })

    render(<CartaPage />)

    expect(screen.getByText('No hay productos')).toBeInTheDocument()
  })
})
