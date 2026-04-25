import { useState, useCallback, useRef } from 'react'
import { SWIPE_THRESHOLD } from '../utils/constants'

/**
 * Swipe-left gesture hook for touch and mouse.
 * @param {Function} onSwipeLeft - Callback when swipe threshold is exceeded
 * @param {number} threshold - Swipe distance in px (default 80)
 * @param {Function} onConfirm - Optional confirmation callback before executing onSwipeLeft
 * @returns {{ onTouchStart, onTouchMove, onTouchEnd, translateX: number, isSwiping: boolean }}
 */
export function useSwipe(onSwipeLeft, threshold = SWIPE_THRESHOLD, onConfirm) {
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isSwipingRef = useRef(false)

  const handleStart = useCallback((clientX) => {
    startX.current = clientX
    currentX.current = clientX
    isSwipingRef.current = true
    setIsSwiping(true)
    setTranslateX(0)
  }, [])

  const handleMove = useCallback((clientX) => {
    if (!isSwipingRef.current) return
    currentX.current = clientX
    const diff = currentX.current - startX.current
    // Only track left swipes (negative diff)
    if (diff < 0) {
      setTranslateX(diff)
    }
  }, [])

  const handleEnd = useCallback(() => {
    if (!isSwipingRef.current) return
    isSwipingRef.current = false
    setIsSwiping(false)

    // Use functional update to get latest translateX
    setTranslateX((prev) => {
      if (prev < -threshold) {
        // If confirmation callback provided, call it; otherwise execute directly
        if (onConfirm) {
          onConfirm(onSwipeLeft)
        } else {
          onSwipeLeft?.()
        }
      }
      return 0
    })
  }, [threshold, onSwipeLeft, onConfirm])

  return {
    onTouchStart: (e) => handleStart(e.touches[0].clientX),
    onTouchMove: (e) => handleMove(e.touches[0].clientX),
    onTouchEnd: handleEnd,
    onMouseDown: (e) => handleStart(e.clientX),
    onMouseMove: (e) => {
      if (isSwipingRef.current) handleMove(e.clientX)
    },
    onMouseUp: handleEnd,
    onMouseLeave: () => {
      isSwipingRef.current = false
      setIsSwiping(false)
      setTranslateX(0)
    },
    translateX,
    isSwiping
  }
}
