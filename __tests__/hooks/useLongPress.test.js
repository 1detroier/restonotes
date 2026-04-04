import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLongPress } from '../../src/hooks/useLongPress'

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('triggers callback after 800ms hold', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 800))

    act(() => {
      result.current.onMouseDown()
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(result.current.isLongPress).toBe(true)
  })

  it('cancels on early release (before duration)', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 800))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      vi.advanceTimersByTime(400)
      result.current.onMouseUp()
    })

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(callback).not.toHaveBeenCalled()
    expect(result.current.isLongPress).toBe(false)
  })

  it('works with touch events', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 800))

    const fakeEvent = { preventDefault: vi.fn() }

    act(() => {
      result.current.onTouchStart(fakeEvent)
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('cancels on touch end before duration', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 800))

    const fakeEvent = { preventDefault: vi.fn() }

    act(() => {
      result.current.onTouchStart(fakeEvent)
    })

    act(() => {
      vi.advanceTimersByTime(400)
      result.current.onTouchEnd()
    })

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('cancels on mouse leave', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 800))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      result.current.onMouseLeave()
    })

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(callback).not.toHaveBeenCalled()
  })
})
