import { useState, useRef, useCallback } from 'react'
import { LONG_PRESS_DURATION } from '../utils/constants'

/**
 * Reusable long-press gesture hook.
 * @param {Function} callback - Function to call on long press
 * @param {number} duration - Duration in ms (default 800)
 * @returns {{ onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, isLongPress: boolean }}
 */
export function useLongPress(callback, duration = LONG_PRESS_DURATION) {
  const [isLongPress, setIsLongPress] = useState(false)
  const timerRef = useRef(null)

  const start = useCallback(() => {
    setIsLongPress(false)
    timerRef.current = setTimeout(() => {
      setIsLongPress(true)
      callback()
    }, duration)
  }, [callback, duration])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e) => {
      // Prevent default to avoid scroll during long press
      e.preventDefault()
      start()
    },
    onTouchEnd: stop,
    isLongPress
  }
}
