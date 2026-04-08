import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CocinaQueue from '../../../src/components/cocina/CocinaQueue'

// Mock the store since CocinaItem imports it
vi.mock('../../../src/store/useAppStore', () => ({
  useAppStore: () => ({
    advanceCocinaStatus: vi.fn()
  })
}))

describe('CocinaQueue', () => {
  // Test single mesa group (component expects pre-grouped items per mesa)
  const mockItemsMesa3 = [
    { id: 1, mesaId: 3, productoNombre: 'Café', cantidad: 2, precio: 1.5, status: 'pendiente', timestamp: '2026-04-05T10:00:00Z', nota: '' },
    { id: 2, mesaId: 3, productoNombre: 'Ensalada', cantidad: 1, precio: 8, status: 'preparando', timestamp: '2026-04-05T10:05:00Z', nota: 'Sin cebolla' }
  ]
  
  const mockItemsMesa7 = [
    { id: 3, mesaId: 7, productoNombre: 'Tarta', cantidad: 1, precio: 6, status: 'pendiente', timestamp: '2026-04-05T10:10:00Z', nota: '' }
  ]

  it('renders mesa groups', () => {
    render(<CocinaQueue items={mockItemsMesa3} />)
    expect(screen.getByText('Mesa #3')).toBeInTheDocument()
  })

  it('renders product names', () => {
    render(<CocinaQueue items={mockItemsMesa3} />)
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('Ensalada')).toBeInTheDocument()
  })

  it('renders quantities', () => {
    render(<CocinaQueue items={mockItemsMesa3} />)
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getByText('1×')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<CocinaQueue items={mockItemsMesa3} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Preparando')).toBeInTheDocument()
  })

  it('renders empty when no items', () => {
    const { container } = render(<CocinaQueue items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('groups items by mesa correctly', () => {
    render(<CocinaQueue items={mockItemsMesa3} />)
    const mesa3Section = screen.getByText('Mesa #3').closest('.bg-base-200')
    expect(mesa3Section).toHaveTextContent('Café')
    expect(mesa3Section).toHaveTextContent('Ensalada')
  })

  it('renders completar button when handler is provided', () => {
    const handler = vi.fn()
    // With 'preparando' status, complete button should appear
    render(<CocinaQueue items={mockItemsMesa3} onCompleteMesa={handler} />)
    const completeButton = screen.getByText('Completar')
    fireEvent.click(completeButton)
    expect(handler).toHaveBeenCalledWith(3)
  })
})
