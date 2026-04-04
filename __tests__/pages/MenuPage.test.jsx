import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MenuPage from '../../src/pages/MenuPage'
import { useAppStore } from '../../src/store/useAppStore'
import { useUIStore } from '../../src/store/useUIStore'
import { menuDiaRepo } from '../../src/db/repositories/menuDia'

vi.mock('../../src/store/useAppStore', () => ({
  useAppStore: vi.fn()
}))

vi.mock('../../src/store/useUIStore', () => ({
  useUIStore: vi.fn()
}))

vi.mock('../../src/db/repositories/menuDia', () => ({
  menuDiaRepo: {
    getByFecha: vi.fn().mockResolvedValue(null),
    getHistorial: vi.fn().mockResolvedValue([])
  }
}))

describe('MenuPage Integration', () => {
  const mockSaveMenuDelDia = vi.fn().mockResolvedValue(undefined)
  const mockLoadMenuDelDia = vi.fn().mockResolvedValue(undefined)
  const mockLoadMenuHistorial = vi.fn().mockResolvedValue([])
  const mockAddToast = vi.fn()

  const mockProductos = [
    { id: 1, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗', activo: true },
    { id: 2, nombre: 'Sopa', precio: 7, categoria: 'primero', emoji: '🍲', activo: true },
    { id: 3, nombre: 'Merluza', precio: 14, categoria: 'segundo', emoji: '🐟', activo: true },
    { id: 4, nombre: 'Tarta', precio: 6, categoria: 'postre', emoji: '🍰', activo: true }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    useAppStore.mockReturnValue({
      productos: mockProductos,
      saveMenuDelDia: mockSaveMenuDelDia,
      loadMenuDelDia: mockLoadMenuDelDia,
      loadMenuHistorial: vi.fn().mockResolvedValue([])
    })
    useUIStore.mockReturnValue({
      addToast: mockAddToast
    })
    menuDiaRepo.getByFecha.mockResolvedValue(null)
    menuDiaRepo.getHistorial.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders page title', () => {
    render(<MenuPage />)

    expect(screen.getByText('Menú del Día')).toBeInTheDocument()
  })

  it('shows date picker', () => {
    render(<MenuPage />)

    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThan(0)
  })

  it('shows product categories for selection', () => {
    render(<MenuPage />)

    expect(screen.getByText('Seleccionar Productos')).toBeInTheDocument()
    expect(screen.getByText('Primeros (0)')).toBeInTheDocument()
    expect(screen.getByText('Segundos (0)')).toBeInTheDocument()
    expect(screen.getByText('Postres (0)')).toBeInTheDocument()
  })

  it('shows productos in category selection', () => {
    render(<MenuPage />)

    // Check that active productos are visible in the multi-select
    expect(screen.getByText('Ensalada')).toBeInTheDocument()
    expect(screen.getByText('Merluza')).toBeInTheDocument()
  })

  it('shows preview section', () => {
    render(<MenuPage />)

    expect(screen.getByText('Vista Previa del Menú')).toBeInTheDocument()
  })

  it('shows price input', () => {
    render(<MenuPage />)

    const priceInputs = document.querySelectorAll('input[type="number"]')
    expect(priceInputs.length).toBeGreaterThan(0)
  })

  it('shows incluye bebida toggle', () => {
    render(<MenuPage />)

    expect(screen.getByText('Incluye bebida')).toBeInTheDocument()
  })

  it('shows activate menu button', () => {
    render(<MenuPage />)

    expect(screen.getByText('Activar Menú')).toBeInTheDocument()
  })

  it('saves menu when activate is clicked with valid data', async () => {
    render(<MenuPage />)

    // Select productos first (toggle checkboxes for primero and segundo)
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is for primero (Ensalada), second for segundo (Merluza)
    // Skip the "incluye bebida" toggle which is first
    fireEvent.click(checkboxes[1]) // primero: Ensalada
    fireEvent.click(checkboxes[3]) // segundo: Merluza

    // Set price - find the number input
    const priceInput = document.querySelector('input[type="number"]')
    fireEvent.change(priceInput, { target: { value: '15' } })

    // Click activate
    fireEvent.click(screen.getByText('Activar Menú'))

    await waitFor(() => {
      expect(mockSaveMenuDelDia).toHaveBeenCalled()
    })
  })
})
