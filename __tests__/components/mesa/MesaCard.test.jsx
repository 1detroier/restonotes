import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
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

  const renderMesaCard = async (props) => {
    let renderResult
    await act(async () => {
      renderResult = render(<MesaCard {...props} />)
    })
    return renderResult
  }

  it('renders mesa number and estado', async () => {
    await renderMesaCard({ mesa: mockMesa })
    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('libre')).toBeInTheDocument()
  })

  it('applies green styles for libre state', async () => {
    const { container } = await renderMesaCard({ mesa: mockMesa })
    const card = container.firstChild
    expect(card).toHaveClass('bg-green-100')
    expect(card).toHaveClass('border-green-500')
  })

  it('applies red styles for ocupada state', async () => {
    const ocupadaMesa = { ...mockMesa, estado: 'ocupada', total: 25.50, openedAt: new Date().toISOString() }
    const { container } = await renderMesaCard({ mesa: ocupadaMesa })
    const card = container.firstChild
    expect(card).toHaveClass('bg-red-100')
    expect(card).toHaveClass('border-red-500')
  })

  it('applies gray styles for cuenta state', async () => {
    const cuentaMesa = { ...mockMesa, estado: 'cuenta' }
    const { container } = await renderMesaCard({ mesa: cuentaMesa })
    const card = container.firstChild
    expect(card).toHaveClass('bg-gray-200')
    expect(card).toHaveClass('border-gray-500')
  })

  it('shows timer and total for occupied mesas', async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const ocupadaMesa = { ...mockMesa, estado: 'ocupada', total: 47, openedAt: thirtyMinAgo }
    await renderMesaCard({ mesa: ocupadaMesa })
    expect(screen.getByText('30min')).toBeInTheDocument()
    expect(screen.getByText('47.00€')).toBeInTheDocument()
  })

  it('shows receipt icon for cuenta state', async () => {
    const cuentaMesa = { ...mockMesa, estado: 'cuenta' }
    await renderMesaCard({ mesa: cuentaMesa })
    expect(screen.getByText('🧾')).toBeInTheDocument()
  })

  it('calls onTap when clicked', async () => {
    const onTap = vi.fn()
    await renderMesaCard({ mesa: mockMesa, onTap })
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(onTap).toHaveBeenCalledWith(mockMesa)
  })

  it('calls onLongPress after long press', async () => {
    vi.useFakeTimers()
    const onLongPress = vi.fn()
    await renderMesaCard({ mesa: mockMesa, onLongPress })
    const card = screen.getByRole('button')

    await act(async () => {
      fireEvent.mouseDown(card)
      vi.advanceTimersByTime(800)
    })

    expect(onLongPress).toHaveBeenCalledWith(mockMesa)
    vi.useRealTimers()
  })
})
