import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMenuForm } from '../../src/hooks/useMenuForm'

describe('useMenuForm', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useMenuForm())

    expect(result.current.values.fecha).toBeDefined()
    expect(result.current.values.primeroIds).toEqual([])
    expect(result.current.values.segundoIds).toEqual([])
    expect(result.current.values.postreIds).toEqual([])
    expect(result.current.values.precio).toBe('')
    expect(result.current.values.incluyeBebida).toBe(false)
  })

  it('validates missing primeroIds', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.setField('precio', '15')
      result.current.validate()
    })

    expect(result.current.errors.primeroIds).toBe('Se requiere al menos 1 primero')
  })

  it('validates missing segundoIds', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
      result.current.setField('precio', '15')
      result.current.validate()
    })

    expect(result.current.errors.segundoIds).toBe('Se requiere al menos 1 segundo')
  })

  it('validates precio must be > 0', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
      result.current.toggleProducto('segundoIds', 3)
      result.current.setField('precio', '0')
      result.current.validate()
    })

    expect(result.current.errors.precio).toBe('El precio debe ser mayor a 0')
  })

  it('passes validation with valid data', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
      result.current.toggleProducto('segundoIds', 3)
      result.current.setField('precio', '15')
    })

    const isValid = result.current.validate()
    expect(isValid).toBe(true)
    expect(Object.keys(result.current.errors)).toHaveLength(0)
  })

  it('toggles producto in category list', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
    })

    expect(result.current.values.primeroIds).toContain(1)

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
    })

    expect(result.current.values.primeroIds).not.toContain(1)
  })

  it('toggles multiple productos', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
      result.current.toggleProducto('primeroIds', 2)
    })

    expect(result.current.values.primeroIds).toEqual([1, 2])
  })

  it('clears error when field is corrected', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.validate()
    })

    expect(result.current.errors.primeroIds).toBeTruthy()

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
    })

    expect(result.current.errors.primeroIds).toBeUndefined()
  })

  it('resets to default values', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.toggleProducto('primeroIds', 1)
      result.current.setField('precio', '20')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.values.primeroIds).toEqual([])
    expect(result.current.values.precio).toBe('')
  })

  it('sets field value', () => {
    const { result } = renderHook(() => useMenuForm())

    act(() => {
      result.current.setField('incluyeBebida', true)
    })

    expect(result.current.values.incluyeBebida).toBe(true)
  })
})
