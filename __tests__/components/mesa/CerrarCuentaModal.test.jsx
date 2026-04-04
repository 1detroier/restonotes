import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CerrarCuentaModal from '../../../src/components/mesa/CerrarCuentaModal'

describe('CerrarCuentaModal', () => {
  const mockMesa = {
    id: 5,
    numero: 5,
    estado: 'ocupada',
    pedidos: [
      { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 2, categoria: 'bebidas' },
      { id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, categoria: 'entrantes' }
    ],
    total: 11,
    openedAt: new Date().toISOString()
  }

  it('renders mesa number in header', () => {
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('🧾 Cerrar Mesa #5')).toBeInTheDocument()
  })

  it('displays order breakdown', () => {
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('2× Café')).toBeInTheDocument()
    expect(screen.getByText('1× Ensalada')).toBeInTheDocument()
  })

  it('shows correct total', () => {
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('11.00€')).toBeInTheDocument()
  })

  it('calls onConfirm when Cobrar is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('✓ Cobrar'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when Cancelar is clicked', () => {
    const onCancel = vi.fn()
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows category labels', () => {
    render(
      <CerrarCuentaModal
        mesa={mockMesa}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('Entrantes')).toBeInTheDocument()
  })
})
