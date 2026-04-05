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
  const mockItems = [
    { id: 1, mesaId: 3, productoNombre: 'Café', cantidad: 2, precio: 1.5, status: 'pendiente', timestamp: '2026-04-05T10:00:00Z', nota: '' },
    { id: 2, mesaId: 3, productoNombre: 'Ensalada', cantidad: 1, precio: 8, status: 'en_curso', timestamp: '2026-04-05T10:05:00Z', nota: 'Sin cebolla' },
    { id: 3, mesaId: 7, productoNombre: 'Tarta', cantidad: 1, precio: 6, status: 'pendiente', timestamp: '2026-04-05T10:10:00Z', nota: '' }
  ]

  it('renders mesa groups', () => {
    render(<CocinaQueue items={mockItems} />)
    expect(screen.getByText('Mesa #3')).toBeInTheDocument()
    expect(screen.getByText('Mesa #7')).toBeInTheDocument()
  })

  it('renders product names', () => {
    render(<CocinaQueue items={mockItems} />)
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('Ensalada')).toBeInTheDocument()
    expect(screen.getByText('Tarta')).toBeInTheDocument()
  })

  it('renders quantities', () => {
    render(<CocinaQueue items={mockItems} />)
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getAllByText('1×')).toHaveLength(2)
  })

  it('renders status badges', () => {
    render(<CocinaQueue items={mockItems} />)
    // "Pendiente" appears twice (2 items with pendiente status)
    expect(screen.getAllByText('Pendiente')).toHaveLength(2)
    expect(screen.getByText('En curso')).toBeInTheDocument()
  })

  it('renders empty when no items', () => {
    const { container } = render(<CocinaQueue items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('groups items by mesa correctly', () => {
    render(<CocinaQueue items={mockItems} />)
    const mesa3Section = screen.getByText('Mesa #3').closest('.bg-base-200')
    expect(mesa3Section).toHaveTextContent('Café')
    expect(mesa3Section).toHaveTextContent('Ensalada')
    expect(mesa3Section).not.toHaveTextContent('Tarta')
  })

  it('renders completar nota button when handler is provided', () => {
    const handler = vi.fn()
    render(<CocinaQueue items={mockItems} onCompleteMesa={handler} />)
    const completeButtons = screen.getAllByText('Completar nota')
    fireEvent.click(completeButtons[0])
    expect(handler).toHaveBeenCalledWith(3)
  })
})
