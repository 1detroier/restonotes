import { useState, useEffect } from 'react'
import { TIMER_THRESHOLD, TIMER_INTERVAL } from '../utils/constants'

/**
 * Computes elapsed minutes from an openedAt ISO string.
 * Updates every 10 seconds.
 * @param {string|null} openedAt - ISO timestamp
 * @returns {{ minutes: number, colorState: string }}
 */
export function useMesaTimer(openedAt) {
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    if (!openedAt) {
      setMinutes(0)
      return
    }

    const update = () => {
      const opened = new Date(openedAt).getTime()
      const now = Date.now()
      const elapsedMs = now - opened
      const elapsedMin = Math.floor(elapsedMs / 60000)
      setMinutes(Math.max(0, elapsedMin))
    }

    update()
    const interval = setInterval(update, TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [openedAt])

  const colorState = minutes >= TIMER_THRESHOLD ? 'red' : 'orange'

  return { minutes, colorState }
}
