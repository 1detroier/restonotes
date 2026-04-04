import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwipe } from '../../src/hooks/useSwipe'

describe('useSwipe', () => {
  it('returns initial state', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    expect(result.current.translateX).toBe(0)
    expect(result.current.isSwiping).toBe(false)
  })

  it('tracks touch movement for left swipe', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 200 }] })
    })

    expect(result.current.isSwiping).toBe(true)

    act(() => {
      result.current.onTouchMove({ touches: [{ clientX: 100 }] })
    })

    expect(result.current.translateX).toBe(-100)
  })

  it('triggers onSwipeLeft when threshold exceeded', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 200 }] })
      result.current.onTouchMove({ touches: [{ clientX: 100 }] })
    })

    expect(result.current.translateX).toBe(-100)

    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(result.current.translateX).toBe(0)
  })

  it('does NOT trigger onSwipeLeft when threshold not exceeded', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 200 }] })
      result.current.onTouchMove({ touches: [{ clientX: 160 }] })
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('resets on mouse leave', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    act(() => {
      result.current.onMouseDown({ clientX: 200 })
      result.current.onMouseLeave()
    })

    expect(result.current.isSwiping).toBe(false)
    expect(result.current.translateX).toBe(0)
  })

  it('ignores right swipes (positive diff)', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe(onSwipeLeft, 80))

    act(() => {
      result.current.onTouchStart({ touches: [{ clientX: 100 }] })
      result.current.onTouchMove({ touches: [{ clientX: 200 }] })
    })

    expect(result.current.translateX).toBe(0)
  })
})
