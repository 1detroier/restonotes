import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MesasPage from '../../src/pages/MesasPage'

// Mock stores
const mockAddItemToMesa = vi.fn()
const mockRemoveItemFromMesa = vi.fn()
const mockCloseCuenta = vi.fn()
const mockSetMesaActiva = vi.fn()
const mockOpenModal = vi.fn()

vi.mock('../../src/store/useAppStore', () => ({
  useAppStore: vi.fn()
}))

vi.mock('../../src/store/useUIStore', () => ({
  useUIStore: vi.fn()
}))

vi.mock('../../src/components/mesa/MesaDrawer', () => ({
  default: vi.fn(({ mesaId }) => (
    <div data-testid="mesa-drawer">Drawer for mesa {mesaId}</div>
  ))
}))

describe('MesasPage Integration', () => {
  const mesas = [
    { id: 1, numero: 1, estado: 'libre', pedidos: [], total: 0, openedAt: null },
    { id: 2, numero: 2, estado: 'ocupada', pedidos: [{ id: 'a', nombre: 'Café', precio: 1.5, cantidad: 1, categoria: 'bebida' }], total: 1.5, openedAt: new Date().toISOString() },
    { id: 3, numero: 3, estado: 'libre', pedidos: [], total: 0, openedAt: null }
  ]

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useAppStore } = await import('../../src/store/useAppStore')
    useAppStore.mockReturnValue({
      mesas,
      productos: [
        { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebida', emoji: '☕', activo: true },
        { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗', activo: true }
      ],
      menuDelDia: null,
      loading: false,
      addItemToMesa: mockAddItemToMesa,
      removeItemFromMesa: mockRemoveItemFromMesa,
      closeCuenta: mockCloseCuenta,
      setMesaActiva: mockSetMesaActiva
    })

    const { useUIStore } = await import('../../src/store/useUIStore')
    useUIStore.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: vi.fn(),
      modals: [],
      activeTab: 'mesas'
    })
  })

  it('renders mesa grid with all mesas', () => {
    render(<MesasPage />)
    // Should show all 3 mesas
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('shows occupied count in header', () => {
    render(<MesasPage />)
    expect(screen.getByText('1 de 3 ocupadas')).toBeInTheDocument()
  })

  it('opens drawer when tapping a mesa', () => {
    render(<MesasPage />)
    const mesa1 = screen.getByText('#1').closest('[role="button"]')
    fireEvent.click(mesa1)

    expect(mockSetMesaActiva).toHaveBeenCalledWith(1)
    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('shows context menu on long press', async () => {
    render(<MesasPage />)
    const mesa2 = screen.getByText('#2').closest('[role="button"]')

    fireEvent.mouseDown(mesa2)
    // Wait for the 800ms long press duration
    await new Promise((r) => setTimeout(r, 850))

    expect(screen.getByText('🧾 Cerrar cuenta')).toBeInTheDocument()
  })

  it('closes cuenta from context menu', async () => {
    render(<MesasPage />)
    const mesa2 = screen.getByText('#2').closest('[role="button"]')

    fireEvent.mouseDown(mesa2)
    await new Promise((r) => setTimeout(r, 850))

    // Click "Cerrar cuenta" → opens CerrarCuentaModal
    fireEvent.click(screen.getByText('🧾 Cerrar cuenta'))

    // Now the modal should be visible — click "Cobrar"
    await waitFor(() => {
      expect(screen.getByText('✓ Cobrar')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('✓ Cobrar'))

    // closeCuenta should be called with mesaId and paymentMethod (default: 'efectivo')
    await waitFor(() => {
      expect(mockCloseCuenta).toHaveBeenCalledWith(2, 'efectivo')
    })
  })
})
