import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TakeawayList from '../../../src/components/takeaway/TakeawayList'

describe('TakeawayList', () => {
  const mockOrders = [
    { id: 1, customerName: 'Juan', pedidos: [], status: 'pendiente', total: 0, createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 2, customerName: 'María', pedidos: [{ nombre: 'Café', cantidad: 1, precio: 1.5 }], status: 'listo', total: 1.5, createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-05T09:30:00Z' }
  ]

  it('renders order cards', () => {
    render(<TakeawayList orders={mockOrders} />)
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByText('María')).toBeInTheDocument()
  })

  it('displays status badges', () => {
    render(<TakeawayList orders={mockOrders} />)
    expect(screen.getByText('Preparando')).toBeInTheDocument()
    expect(screen.getByText('Listo')).toBeInTheDocument()
  })

  it('displays totals', () => {
    render(<TakeawayList orders={mockOrders} />)
    expect(screen.getByText('0.00€')).toBeInTheDocument()
    expect(screen.getByText('1.50€')).toBeInTheDocument()
  })

  it('renders empty when no orders', () => {
    const { container } = render(<TakeawayList orders={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('sorts orders by createdAt descending', () => {
    const { container } = render(<TakeawayList orders={mockOrders} />)
    const cards = container.querySelectorAll('.card')
    expect(cards[0]).toHaveTextContent('Juan')
    expect(cards[1]).toHaveTextContent('María')
  })

  it('prioritizes pickup time when available', () => {
    const orders = [
      { id: 1, customerName: 'Sin hora', status: 'pendiente', total: 0, createdAt: '2026-04-05T12:00:00Z' },
      { id: 2, customerName: 'Pickup temprano', status: 'pendiente', total: 0, createdAt: '2026-04-05T08:00:00Z', pickupAt: '2026-04-05T10:00:00Z' },
      { id: 3, customerName: 'Pickup tarde', status: 'pendiente', total: 0, createdAt: '2026-04-05T07:00:00Z', pickupAt: '2026-04-05T12:00:00Z' }
    ]
    const { container } = render(<TakeawayList orders={orders} />)
    const cards = container.querySelectorAll('.card')
    expect(cards[0]).toHaveTextContent('Pickup temprano')
    expect(cards[1]).toHaveTextContent('Pickup tarde')
    expect(cards[2]).toHaveTextContent('Sin hora')
  })

  it('hides paid orders from the list', () => {
    const orders = [
      { id: 1, customerName: 'Pagado', status: 'pagado', total: 10, createdAt: '2026-04-05T08:00:00Z' }
    ]
    const { container } = render(<TakeawayList orders={orders} />)
    expect(container.firstChild).toBeNull()
  })
})
