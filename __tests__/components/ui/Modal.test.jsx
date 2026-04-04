import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../../src/components/ui/Modal'
import { useUIStore } from '../../../src/store/useUIStore'

describe('Modal', () => {
  it('renders nothing when modals array is empty', () => {
    useUIStore.setState({ modals: [] })
    const { container } = render(<Modal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal with title and content', () => {
    useUIStore.setState({
      modals: [{ title: 'Test Modal', content: <div data-testid="modal-content">Hello</div> }]
    })

    render(<Modal />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
  })

  it('closes modal on backdrop click', () => {
    const closeModal = vi.fn()
    useUIStore.setState({
      modals: [{ title: 'Test', content: <div>Content</div> }],
      closeModal
    })

    render(<Modal />)

    fireEvent.click(screen.getByRole('dialog'))

    // The modal uses setModals internally
    const state = useUIStore.getState()
    expect(state.modals).toHaveLength(0)
  })

  it('does not close when clicking modal content', () => {
    useUIStore.setState({
      modals: [{ title: 'Test', content: <div data-testid="content">Content</div> }]
    })

    render(<Modal />)

    fireEvent.click(screen.getByTestId('content'))

    const state = useUIStore.getState()
    expect(state.modals).toHaveLength(1)
  })
})
