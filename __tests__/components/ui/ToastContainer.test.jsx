import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastContainer from '../../../src/components/ui/ToastContainer'
import { useUIStore } from '../../../src/store/useUIStore'

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    useUIStore.setState({ toasts: [] })
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders toast with correct message', () => {
    useUIStore.setState({
      toasts: [{ id: '1', message: 'Producto creado', type: 'success' }]
    })

    render(<ToastContainer />)

    expect(screen.getByText('Producto creado')).toBeInTheDocument()
  })

  it('applies correct color class for type', () => {
    useUIStore.setState({
      toasts: [{ id: '1', message: 'Error', type: 'error' }]
    })

    render(<ToastContainer />)

    const alert = screen.getByText('Error').closest('.alert')
    expect(alert).toHaveClass('alert-error')
  })

  it('removes toast on dismiss button click', () => {
    useUIStore.setState({
      toasts: [{ id: '1', message: 'Dismiss me', type: 'info' }]
    })

    render(<ToastContainer />)

    fireEvent.click(screen.getByText('✕'))

    const state = useUIStore.getState()
    expect(state.toasts).toHaveLength(0)
  })

  it('renders multiple toasts', () => {
    useUIStore.setState({
      toasts: [
        { id: '1', message: 'Toast 1', type: 'success' },
        { id: '2', message: 'Toast 2', type: 'info' }
      ]
    })

    render(<ToastContainer />)

    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
  })
})
