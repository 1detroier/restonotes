import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ProductQuickAdd from '../../../src/components/mesa/ProductQuickAdd'

describe('ProductQuickAdd', () => {
  const productos = [
    { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebidas', emoji: '☕' },
    { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'entrantes', emoji: '🥗' }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty state when no productos', () => {
    render(<ProductQuickAdd productos={[]} />)
    expect(screen.getByText('No hay productos en esta categoría')).toBeInTheDocument()
  })

  it('renders product cards with emoji, name, and price', () => {
    render(<ProductQuickAdd productos={productos} />)
    expect(screen.getByText('☕')).toBeInTheDocument()
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('1.50€')).toBeInTheDocument()
  })

  it('calls onAdd when product is tapped', () => {
    const onAdd = vi.fn()
    render(<ProductQuickAdd productos={productos} onAdd={onAdd} />)

    const cafeCard = screen.getByText('Café').closest('button')
    fireEvent.click(cafeCard)

    expect(onAdd).toHaveBeenCalledWith(productos[0], 1)
  })

  it('calls onLongPressProduct on long press (touch)', async () => {
    const onLongPress = vi.fn()
    render(<ProductQuickAdd productos={productos} onLongPressProduct={onLongPress} />)

    const cafeCard = screen.getByText('Café').closest('button')

    await act(async () => {
      fireEvent.touchStart(cafeCard, { touches: [{ clientX: 0, clientY: 0 }] })
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).toHaveBeenCalledWith(productos[0])
  })
})
