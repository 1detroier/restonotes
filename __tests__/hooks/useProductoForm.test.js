import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductoForm } from '../../src/hooks/useProductoForm'

describe('useProductoForm', () => {
  it('initializes with default empty values', () => {
    const { result } = renderHook(() => useProductoForm())

    expect(result.current.values).toEqual({
      nombre: '',
      precio: '',
      categoria: '',
      emoji: ''
    })
  })

  it('initializes with provided values', () => {
    const { result } = renderHook(() =>
      useProductoForm({ nombre: 'Paella', precio: '12', categoria: 'segundo', emoji: '🍝' })
    )

    expect(result.current.values.nombre).toBe('Paella')
    expect(result.current.values.precio).toBe('12')
  })

  it('validates empty nombre', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.validate()
    })

    expect(result.current.errors.nombre).toBe('El nombre es obligatorio')
  })

  it('validates nombre max length > 30', async () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'a'.repeat(31))
    })

    // Wait for state to settle
    await new Promise((r) => setTimeout(r, 0))

    act(() => {
      result.current.validate()
    })

    expect(result.current.errors.nombre).toBe('Máximo 30 caracteres')
  })

  it('validates precio must be > 0', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Test')
      result.current.setField('precio', '0')
      result.current.setField('categoria', 'primero')
      result.current.setField('emoji', '🍝')
      result.current.validate()
    })

    expect(result.current.errors.precio).toBe('El precio debe ser mayor a 0')
  })

  it('validates precio must be a number', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Test')
      result.current.setField('precio', 'abc')
      result.current.setField('categoria', 'primero')
      result.current.setField('emoji', '🍝')
      result.current.validate()
    })

    expect(result.current.errors.precio).toBe('El precio debe ser mayor a 0')
  })

  it('validates categoria is required', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Test')
      result.current.setField('precio', '10')
      result.current.validate()
    })

    expect(result.current.errors.categoria).toBe('Selecciona una categoría')
  })

  it('validates emoji is required', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Test')
      result.current.setField('precio', '10')
      result.current.setField('categoria', 'primero')
      result.current.validate()
    })

    expect(result.current.errors.emoji).toBe('Selecciona un emoji')
  })

  it('passes validation with all valid fields', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Paella')
      result.current.setField('precio', '12.50')
      result.current.setField('categoria', 'segundo')
      result.current.setField('emoji', '🍝')
    })

    let isValid
    act(() => {
      isValid = result.current.validate()
    })
    expect(isValid).toBe(true)
    expect(Object.keys(result.current.errors)).toHaveLength(0)
  })

  it('resets to default values', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.setField('nombre', 'Test')
      result.current.setField('precio', '10')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.values.nombre).toBe('')
    expect(result.current.values.precio).toBe('')
  })

  it('clears field error when field is updated', () => {
    const { result } = renderHook(() => useProductoForm())

    act(() => {
      result.current.validate()
    })

    expect(result.current.errors.nombre).toBeTruthy()

    act(() => {
      result.current.setField('nombre', 'Valid Name')
    })

    expect(result.current.errors.nombre).toBeUndefined()
  })
})
