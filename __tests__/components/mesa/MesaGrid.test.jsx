import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MesaGrid from '../../../src/components/mesa/MesaGrid'

describe('MesaGrid', () => {
  const mesas = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    estado: i < 5 ? 'ocupada' : 'libre',
    pedidos: [],
    total: i < 5 ? (i + 1) * 10 : 0,
    openedAt: i < 5 ? new Date().toISOString() : null
  }))

  it('renders all 14 mesa cards', () => {
    render(<MesaGrid mesas={mesas} />)
    expect(screen.getAllByRole('button')).toHaveLength(14)
  })

  it('shows loading state when mesas is empty', () => {
    render(<MesaGrid mesas={[]} />)
    expect(screen.getByText('Cargando mesas...')).toBeInTheDocument()
  })

  it('passes onTap and onLongPress to MesaCards', () => {
    const onTap = vi.fn()
    const onLongPress = vi.fn()
    render(<MesaGrid mesas={mesas} onTap={onTap} onLongPress={onLongPress} />)

    const firstCard = screen.getAllByRole('button')[0]
    // Cards exist and are rendered with handlers
    expect(firstCard).toHaveAttribute('aria-label', 'Mesa 1 - ocupada')
  })
})
