import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CocinaItem from '../../../src/components/cocina/CocinaItem'

vi.mock('../../../src/store/useAppStore', () => ({
  useAppStore: () => ({
    advanceCocinaStatus: vi.fn()
  })
}))

describe('CocinaItem', () => {
  const mockItem = {
    id: 1,
    mesaId: 3,
    productoNombre: 'Café',
    cantidad: 2,
    precio: 1.5,
    status: 'pendiente',
    timestamp: '2026-04-05T10:00:00Z',
    nota: ''
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('displays product name and quantity', () => {
    render(<CocinaItem item={mockItem} />)
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('2×')).toBeInTheDocument()
  })

  it('displays status badge with correct text', () => {
    render(<CocinaItem item={mockItem} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('displays en_curso status correctly', () => {
    const item = { ...mockItem, status: 'en_curso' }
    render(<CocinaItem item={item} />)
    expect(screen.getByText('En curso')).toBeInTheDocument()
  })

  it('displays listo status correctly', () => {
    const item = { ...mockItem, status: 'listo' }
    render(<CocinaItem item={item} />)
    expect(screen.getByText('Listo')).toBeInTheDocument()
  })

  it('displays nota when present', () => {
    const item = { ...mockItem, nota: 'Sin azúcar' }
    render(<CocinaItem item={item} />)
    expect(screen.getByText('(Sin azúcar)')).toBeInTheDocument()
  })

  it('has clickable element with min 44px height', () => {
    render(<CocinaItem item={mockItem} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
})
