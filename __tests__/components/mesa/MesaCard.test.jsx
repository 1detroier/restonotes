import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MesaCard from '../../../src/components/mesa/MesaCard'

describe('MesaCard', () => {
  const mockMesa = {
    id: 1,
    numero: 3,
    estado: 'libre',
    pedidos: [],
    total: 0,
    openedAt: null
  }

  it('renders mesa number and estado', () => {
    render(<MesaCard mesa={mockMesa} />)
    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('libre')).toBeInTheDocument()
  })

  it('applies green styles for libre state', () => {
    const { container } = render(<MesaCard mesa={mockMesa} />)
    const card = container.firstChild
    expect(card).toHaveClass('bg-green-100')
    expect(card).toHaveClass('border-green-500')
  })

  it('applies red styles for ocupada state', () => {
    const ocupadaMesa = { ...mockMesa, estado: 'ocupada', total: 25.50, openedAt: new Date().toISOString() }
    const { container } = render(<MesaCard mesa={ocupadaMesa} />)
    const card = container.firstChild
    expect(card).toHaveClass('bg-red-100')
    expect(card).toHaveClass('border-red-500')
  })

  it('applies gray styles for cuenta state', () => {
    const cuentaMesa = { ...mockMesa, estado: 'cuenta' }
    const { container } = render(<MesaCard mesa={cuentaMesa} />)
    const card = container.firstChild
    expect(card).toHaveClass('bg-gray-200')
    expect(card).toHaveClass('border-gray-500')
  })

  it('shows timer and total for occupied mesas', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const ocupadaMesa = { ...mockMesa, estado: 'ocupada', total: 47, openedAt: thirtyMinAgo }
    render(<MesaCard mesa={ocupadaMesa} />)
    expect(screen.getByText('30min')).toBeInTheDocument()
    expect(screen.getByText('47.00€')).toBeInTheDocument()
  })

  it('shows receipt icon for cuenta state', () => {
    const cuentaMesa = { ...mockMesa, estado: 'cuenta' }
    render(<MesaCard mesa={cuentaMesa} />)
    expect(screen.getByText('🧾')).toBeInTheDocument()
  })

  it('calls onTap when clicked', () => {
    const onTap = vi.fn()
    render(<MesaCard mesa={mockMesa} onTap={onTap} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledWith(mockMesa)
  })

  it('calls onLongPress after long press', () => {
    vi.useFakeTimers()
    const onLongPress = vi.fn()
    render(<MesaCard mesa={mockMesa} onLongPress={onLongPress} />)
    const card = screen.getByRole('button')

    fireEvent.mouseDown(card)
    vi.advanceTimersByTime(800)

    expect(onLongPress).toHaveBeenCalledWith(mockMesa)
    vi.useRealTimers()
  })
})
