import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VentasSummary from '../../../src/components/ventas/VentasSummary'

describe('VentasSummary', () => {
  const mockVentas = [
    {
      id: 1,
      mesaId: 3,
      fecha: '2026-04-05',
      timestamp: '2026-04-05T10:00:00Z',
      total: 25,
      paymentMethod: 'efectivo',
      items: [
        { id: 'cafe', nombre: 'Café', cantidad: 2, precio: 1.5 },
        { id: 'ensalada', nombre: 'Ensalada', cantidad: 1, precio: 8 }
      ]
    },
    {
      id: 2,
      mesaId: 7,
      fecha: '2026-04-05',
      timestamp: '2026-04-05T11:30:00Z',
      total: 40,
      paymentMethod: 'tarjeta',
      items: [
        { id: 'merluza', nombre: 'Merluza', cantidad: 2, precio: 12 }
      ]
    },
    {
      id: 3,
      mesaId: 3,
      fecha: '2026-04-05',
      timestamp: '2026-04-05T12:00:00Z',
      total: 15,
      paymentMethod: 'efectivo',
      items: []
    }
  ]

  it('renders summary card with total revenue', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    expect(screen.getByText('80.00€')).toBeInTheDocument()
  })

  it('displays number of ventas', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays mesas served count', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    expect(screen.getByText('2 mesas servidas')).toBeInTheDocument()
  })

  it('lists individual sales with time and mesa', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    expect(screen.getByText('10:00')).toBeInTheDocument()
    // Mesa #3 appears multiple times (2 ventas), use getAllByText
    expect(screen.getAllByText('Mesa #3')).toHaveLength(2)
    expect(screen.getByText('Mesa #7')).toBeInTheDocument()
  })

  it('displays payment method labels', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    // "Efectivo" appears twice (2 ventas with efectivo)
    expect(screen.getAllByText('Efectivo')).toHaveLength(2)
    expect(screen.getByText('Tarjeta')).toBeInTheDocument()
  })

  it('shows empty state for no ventas', () => {
    render(<VentasSummary ventas={[]} fecha="2026-04-05" />)
    expect(screen.getByText('No hay ventas para esta fecha 📊')).toBeInTheDocument()
  })

  it('shows empty state for null ventas', () => {
    render(<VentasSummary ventas={null} fecha="2026-04-05" />)
    expect(screen.getByText('No hay ventas para esta fecha 📊')).toBeInTheDocument()
  })

  it('sorts sales by timestamp ascending', () => {
    const { container } = render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    const saleRows = container.querySelectorAll('.bg-base-200')
    expect(saleRows[0]).toHaveTextContent('10:00')
    expect(saleRows[1]).toHaveTextContent('11:30')
    expect(saleRows[2]).toHaveTextContent('12:00')
  })

  it('shows item breakdown for each venta', () => {
    render(<VentasSummary ventas={mockVentas} fecha="2026-04-05" />)
    expect(screen.getByText('2× Café')).toBeInTheDocument()
    expect(screen.getByText(/Ensalada/)).toBeInTheDocument()
    expect(screen.getByText(/Merluza/)).toBeInTheDocument()
    expect(screen.getByText('3.00€')).toBeInTheDocument()
  })
})
