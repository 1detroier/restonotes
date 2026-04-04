import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterChips from '../../../src/components/carta/FilterChips'

describe('FilterChips', () => {
  it('renders all carta category chips', () => {
    render(<FilterChips activeCategory="" onCategoryChange={vi.fn()} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Con Arroz')).toBeInTheDocument()
    expect(screen.getByText('Sin Arroz')).toBeInTheDocument()
    expect(screen.getByText('Sopas / Caldos')).toBeInTheDocument()
    expect(screen.getByText('Entrantes')).toBeInTheDocument()
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
  })

  it('highlights active category', () => {
    render(<FilterChips activeCategory="con_arroz" onCategoryChange={vi.fn()} />)

    const todosBtn = screen.getByText('Todos')
    const conArrozBtn = screen.getByText('Con Arroz')

    expect(todosBtn).not.toHaveClass('btn-primary')
    expect(conArrozBtn).toHaveClass('btn-primary')
  })

  it('calls onCategoryChange when chip clicked', () => {
    const onCategoryChange = vi.fn()
    render(<FilterChips activeCategory="" onCategoryChange={onCategoryChange} />)

    fireEvent.click(screen.getByText('Con Arroz'))
    expect(onCategoryChange).toHaveBeenCalledWith('con_arroz')
  })

  it('calls onCategoryChange with empty string when Todos clicked', () => {
    const onCategoryChange = vi.fn()
    render(<FilterChips activeCategory="con_arroz" onCategoryChange={onCategoryChange} />)

    fireEvent.click(screen.getByText('Todos'))
    expect(onCategoryChange).toHaveBeenCalledWith('')
  })
})
