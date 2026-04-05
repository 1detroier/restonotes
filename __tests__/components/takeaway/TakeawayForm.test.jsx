import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TakeawayForm from '../../../src/components/takeaway/TakeawayForm'

vi.mock('../../../src/store/useAppStore', () => {
  return { useAppStore: () => ({ mesas: [] }) }
})

describe('TakeawayForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders customer name input', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Nombre del cliente')).toBeInTheDocument()
  })

  it('disables submit button when name is empty', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByText('Crear Pedido')).toBeDisabled()
  })

  it('disables submit button when name is too short', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const input = screen.getByLabelText('Nombre del cliente')
    fireEvent.change(input, { target: { value: 'A' } })
    expect(screen.getByText('Crear Pedido')).toBeDisabled()
  })

  it('enables submit button when name is valid', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const input = screen.getByLabelText('Nombre del cliente')
    fireEvent.change(input, { target: { value: 'Juan' } })
    expect(screen.getByText('Crear Pedido')).not.toBeDisabled()
  })

  it('calls onCancel when Cancelar is clicked', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('has dialog role and aria-modal', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('shows min characters hint when name is too short', () => {
    render(<TakeawayForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const input = screen.getByLabelText('Nombre del cliente')
    fireEvent.change(input, { target: { value: 'A' } })
    expect(screen.getByText('Mínimo 2 caracteres')).toBeInTheDocument()
  })
})
