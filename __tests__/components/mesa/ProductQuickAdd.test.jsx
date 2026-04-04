import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductQuickAdd from '../../../src/components/mesa/ProductQuickAdd'

describe('ProductQuickAdd', () => {
  const productos = [
    { id: 1, nombre: 'Café', precio: 1.5, categoria: 'bebida', emoji: '☕' },
    { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗' }
  ]

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

  it('calls onLongPressProduct on right-click (context menu)', () => {
    const onLongPress = vi.fn()
    render(<ProductQuickAdd productos={productos} onLongPressProduct={onLongPress} />)

    const cafeCard = screen.getByText('Café').closest('button')
    fireEvent.contextMenu(cafeCard)

    expect(onLongPress).toHaveBeenCalledWith(productos[0])
  })
})
