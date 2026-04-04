import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuantityModal from '../../../src/components/mesa/QuantityModal'

describe('QuantityModal', () => {
  const producto = { id: 1, nombre: 'Café', precio: 1.5, emoji: '☕' }

  it('renders product info', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('1.50€ / unidad')).toBeInTheDocument()
  })

  it('starts with quantity 1', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(1)
  })

  it('increments quantity with + button', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const plusBtn = screen.getByLabelText('Increase quantity')
    fireEvent.click(plusBtn)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(2)
  })

  it('decrements quantity with - button', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    // First increment, then decrement
    const plusBtn = screen.getByLabelText('Increase quantity')
    fireEvent.click(plusBtn)
    const minusBtn = screen.getByLabelText('Decrease quantity')
    fireEvent.click(minusBtn)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(1)
  })

  it('enforces minimum quantity of 1', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const minusBtn = screen.getByLabelText('Decrease quantity')
    fireEvent.click(minusBtn)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(1)
  })

  it('enforces maximum quantity of 99', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '100' } })
    expect(input).toHaveValue(99)
  })

  it('calls onConfirm with correct quantity', () => {
    const onConfirm = vi.fn()
    render(
      <QuantityModal
        producto={producto}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )
    const plusBtn = screen.getByLabelText('Increase quantity')
    fireEvent.click(plusBtn)
    const confirmBtn = screen.getByText('Añadir 2×')
    fireEvent.click(confirmBtn)
    expect(onConfirm).toHaveBeenCalledWith(producto, 2)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows correct subtotal preview', () => {
    render(
      <QuantityModal
        producto={producto}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    // 1 × 1.50 = 1.50
    expect(screen.getByText('Subtotal: 1.50€')).toBeInTheDocument()
  })
})
