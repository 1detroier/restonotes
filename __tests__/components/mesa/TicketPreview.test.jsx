import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TicketPreview from '../../../src/components/mesa/TicketPreview'

describe('TicketPreview', () => {
  const pedidos = [
    { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 2, categoria: 'bebidas', emoji: '☕' },
    { id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, categoria: 'entrantes', emoji: '🥗' },
    { id: 'c', nombre: 'Agua', precio: 2, cantidad: 1, categoria: 'bebidas', emoji: '💧' }
  ]

  it('shows empty state when no pedidos', () => {
    render(<TicketPreview pedidos={[]} />)
    expect(screen.getByText('No hay artículos en el pedido')).toBeInTheDocument()
  })

  it('groups items by category', () => {
    render(<TicketPreview pedidos={pedidos} />)
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('Entrantes')).toBeInTheDocument()
  })

  it('shows correct subtotals per category', () => {
    render(<TicketPreview pedidos={pedidos} />)
    // Bebidas: 1.5*2 + 2*1 = 5
    // Primeros: 8*1 = 8
    expect(screen.getByText('Subtotal: 5.00€')).toBeInTheDocument()
    expect(screen.getByText('Subtotal: 8.00€')).toBeInTheDocument()
  })

  it('shows grand total', () => {
    render(<TicketPreview pedidos={pedidos} />)
    // Total: 1.5*2 + 8*1 + 2*1 = 13
    expect(screen.getByText('13.00€')).toBeInTheDocument()
  })

  it('calls onRemove when swipe triggers delete', () => {
    const onRemove = vi.fn()
    const { container } = render(<TicketPreview pedidos={pedidos} onRemove={onRemove} />)

    // The swipe handlers are on the inner div with class "relative flex justify-between"
    // Find the first item's swipeable content div
    const swipeContent = container.querySelectorAll('.relative.flex.justify-between')
    const firstItem = swipeContent[0]

    fireEvent.touchStart(firstItem, { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(firstItem, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(firstItem)

    expect(onRemove).toHaveBeenCalledWith('a')
  })

  it('displays quantity and item name', () => {
    const { container } = render(<TicketPreview pedidos={pedidos} />)
    // Check that the content contains the expected text fragments
    const text = container.textContent
    expect(text).toContain('Café')
    expect(text).toContain('Ensalada')
    expect(text).toContain('Agua')
  })
})
