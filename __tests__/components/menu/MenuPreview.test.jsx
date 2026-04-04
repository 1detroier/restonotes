import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MenuPreview from '../../../src/components/menu/MenuPreview'

describe('MenuPreview', () => {
  const mockProductos = [
    { id: 1, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗', activo: true },
    { id: 2, nombre: 'Sopa', precio: 7, categoria: 'primero', emoji: '🍲', activo: true },
    { id: 3, nombre: 'Merluza', precio: 14, categoria: 'segundo', emoji: '🐟', activo: true },
    { id: 4, nombre: 'Tarta', precio: 6, categoria: 'postre', emoji: '🍰', activo: true }
  ]

  it('shows empty state when no menu', () => {
    render(<MenuPreview menu={null} productos={mockProductos} />)

    expect(screen.getByText('No hay menú configurado')).toBeInTheDocument()
  })

  it('renders menu with selected productos', () => {
    const menu = {
      fecha: '2026-04-04',
      primeroIds: [1],
      segundoIds: [3],
      postreIds: [4],
      precio: 15,
      incluyeBebida: false,
      activo: true
    }

    render(<MenuPreview menu={menu} productos={mockProductos} />)

    expect(screen.getByText('Ensalada')).toBeInTheDocument()
    expect(screen.getByText('Merluza')).toBeInTheDocument()
    expect(screen.getByText('Tarta')).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
  })

  it('shows active badge when menu is active', () => {
    const menu = {
      fecha: '2026-04-04',
      primeroIds: [1],
      segundoIds: [3],
      postreIds: [],
      precio: 12,
      incluyeBebida: false,
      activo: true
    }

    render(<MenuPreview menu={menu} productos={mockProductos} />)

    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('shows incluye bebida indicator', () => {
    const menu = {
      fecha: '2026-04-04',
      primeroIds: [1],
      segundoIds: [3],
      postreIds: [],
      precio: 12,
      incluyeBebida: true,
      activo: true
    }

    render(<MenuPreview menu={menu} productos={mockProductos} />)

    expect(screen.getByText('🍷 Incluye bebida')).toBeInTheDocument()
  })

  it('does not show bebida indicator when disabled', () => {
    const menu = {
      fecha: '2026-04-04',
      primeroIds: [1],
      segundoIds: [3],
      postreIds: [],
      precio: 12,
      incluyeBebida: false,
      activo: true
    }

    render(<MenuPreview menu={menu} productos={mockProductos} />)

    expect(screen.queryByText('🍷 Incluye bebida')).not.toBeInTheDocument()
  })
})
