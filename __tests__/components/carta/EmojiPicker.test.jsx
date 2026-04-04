import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EmojiPicker from '../../../src/components/carta/EmojiPicker'

describe('EmojiPicker', () => {
  it('renders 20 emojis in grid', () => {
    render(<EmojiPicker onSelect={vi.fn()} selected="" />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(20)
  })

  it('calls onSelect when emoji clicked', () => {
    const onSelect = vi.fn()
    render(<EmojiPicker onSelect={onSelect} selected="" />)

    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onSelect).toHaveBeenCalled()
  })

  it('highlights selected emoji', () => {
    render(<EmojiPicker onSelect={vi.fn()} selected="🍝" />)

    const buttons = screen.getAllByRole('button')
    const selectedBtn = buttons.find((btn) => btn.textContent === '🍝')
    expect(selectedBtn).toHaveClass('btn-primary')
  })
})
