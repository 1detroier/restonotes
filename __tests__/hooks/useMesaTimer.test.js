import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMesaTimer } from '../../src/hooks/useMesaTimer'

describe('useMesaTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 minutes for null openedAt', () => {
    const { result } = renderHook(() => useMesaTimer(null))
    expect(result.current.minutes).toBe(0)
    expect(result.current.colorState).toBe('orange')
  })

  it('calculates elapsed minutes from openedAt', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useMesaTimer(tenMinAgo))
    expect(result.current.minutes).toBe(10)
    expect(result.current.colorState).toBe('orange')
  })

  it('returns red colorState when minutes >= 30', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useMesaTimer(thirtyMinAgo))
    expect(result.current.minutes).toBe(30)
    expect(result.current.colorState).toBe('red')
  })

  it('updates minutes after interval passes', async () => {
    const openedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useMesaTimer(openedAt))
    expect(result.current.minutes).toBe(5)

    // Advance 10 seconds (TIMER_INTERVAL) — triggers interval callback
    await act(async () => {
      vi.advanceTimersByTime(10000)
    })
    // Only 10s passed, still 5 minutes
    expect(result.current.minutes).toBe(5)

    // Advance 5 more minutes worth of intervals (5 * 60s = 300s = 30 intervals of 10s)
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })
    expect(result.current.minutes).toBe(10)
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const openedAt = new Date().toISOString()
    const { unmount } = renderHook(() => useMesaTimer(openedAt))
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
