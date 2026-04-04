import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterChips from '../../../src/components/carta/FilterChips'

describe('FilterChips', () => {
  it('renders all category chips', () => {
    render(<FilterChips activeCategory="" onCategoryChange={vi.fn()} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Primeros')).toBeInTheDocument()
    expect(screen.getByText('Segundos')).toBeInTheDocument()
    expect(screen.getByText('Postres')).toBeInTheDocument()
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('Cafetería')).toBeInTheDocument()
  })

  it('highlights active category', () => {
    render(<FilterChips activeCategory="primero" onCategoryChange={vi.fn()} />)

    const todosBtn = screen.getByText('Todos')
    const primerosBtn = screen.getByText('Primeros')

    expect(todosBtn).not.toHaveClass('btn-primary')
    expect(primerosBtn).toHaveClass('btn-primary')
  })

  it('calls onCategoryChange when chip clicked', () => {
    const onCategoryChange = vi.fn()
    render(<FilterChips activeCategory="" onCategoryChange={onCategoryChange} />)

    fireEvent.click(screen.getByText('Primeros'))
    expect(onCategoryChange).toHaveBeenCalledWith('primero')
  })

  it('calls onCategoryChange with empty string when Todos clicked', () => {
    const onCategoryChange = vi.fn()
    render(<FilterChips activeCategory="primero" onCategoryChange={onCategoryChange} />)

    fireEvent.click(screen.getByText('Todos'))
    expect(onCategoryChange).toHaveBeenCalledWith('')
  })
})
