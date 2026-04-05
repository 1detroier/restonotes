import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TakeawayCard from '../../../src/components/takeaway/TakeawayCard'

vi.mock('../../../src/store/useAppStore', () => {
  const productos = []
  const mesas = []
  const menuDelDia = null
  const updateTakeaway = vi.fn()
  const payTakeaway = vi.fn()
  const deleteTakeaway = vi.fn()
  const addTakeawayItem = vi.fn()
  const removeTakeawayItem = vi.fn()
  const updateTakeawayItemQty = vi.fn()
  return {
    useAppStore: () => ({
      productos,
      mesas,
      menuDelDia,
      updateTakeaway,
      payTakeaway,
      deleteTakeaway,
      addTakeawayItem,
      removeTakeawayItem,
      updateTakeawayItemQty
    })
  }
})

describe('TakeawayCard', () => {
  const mockOrder = {
    id: 1,
    customerName: 'Juan Pérez',
    pedidos: [
      { nombre: 'Café', cantidad: 2, precio: 1.5 },
      { nombre: 'Tarta', cantidad: 1, precio: 6 }
    ],
    status: 'pendiente',
    total: 9,
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z'
  }

  it('displays customer name', () => {
    render(<TakeawayCard order={mockOrder} />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('displays order total', () => {
    render(<TakeawayCard order={mockOrder} />)
    expect(screen.getByText('9.00€')).toBeInTheDocument()
  })

  it('displays status badge', () => {
    render(<TakeawayCard order={mockOrder} />)
    expect(screen.getByText('Preparando')).toBeInTheDocument()
  })

  it('displays item count', () => {
    render(<TakeawayCard order={mockOrder} />)
    // The component renders "2 artículos" in the relative time line
    expect(screen.getByText(/2 artículo/)).toBeInTheDocument()
  })

  it('shows pagado card as dimmed', () => {
    const order = { ...mockOrder, status: 'pagado' }
    render(<TakeawayCard order={order} />)
    const card = screen.getByText('Juan Pérez').closest('.card')
    expect(card).toHaveClass('opacity-50')
  })

  it('shows cancel button for non-pagado orders', () => {
    render(<TakeawayCard order={mockOrder} />)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('hides cancel button for pagado orders', () => {
    const order = { ...mockOrder, status: 'pagado' }
    render(<TakeawayCard order={order} />)
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument()
  })

  it('shows gestionar button for active orders', () => {
    render(<TakeawayCard order={mockOrder} />)
    expect(screen.getByText('Gestionar pedido')).toBeInTheDocument()
  })

  it('shows ver pedido button when pagado', () => {
    const order = { ...mockOrder, status: 'pagado' }
    render(<TakeawayCard order={order} />)
    expect(screen.getByText('Ver pedido')).toBeInTheDocument()
  })
})
