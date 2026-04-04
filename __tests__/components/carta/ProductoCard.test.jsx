import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductoCard from '../../../src/components/carta/ProductoCard'

describe('ProductoCard', () => {
  const mockProducto = {
    id: 1,
    nombre: 'Ensalada Mixta',
    precio: 8.5,
    categoria: 'entrantes',
    emoji: '🥗',
    activo: true
  }

  it('renders producto info correctly', () => {
    render(
      <ProductoCard
        producto={mockProducto}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />
    )

    expect(screen.getByText('Ensalada Mixta')).toBeInTheDocument()
    expect(screen.getByText('$8.50')).toBeInTheDocument()
    expect(screen.getByText('Entrantes')).toBeInTheDocument()
  })

  it('shows reduced opacity for inactive producto', () => {
    const inactiveProducto = { ...mockProducto, activo: false }
    const { container } = render(
      <ProductoCard
        producto={inactiveProducto}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />
    )

    expect(container.querySelector('.opacity-50')).toBeInTheDocument()
  })

  it('calls onToggle when toggle button clicked', () => {
    const onToggle = vi.fn()
    render(
      <ProductoCard
        producto={mockProducto}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={onToggle}
      />
    )

    fireEvent.click(screen.getByLabelText('Desactivar'))
    expect(onToggle).toHaveBeenCalledWith(1)
  })

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    render(
      <ProductoCard
        producto={mockProducto}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText('Editar'))
    expect(onEdit).toHaveBeenCalledWith(mockProducto)
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(
      <ProductoCard
        producto={mockProducto}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onToggle={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText('Eliminar'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
