import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatMinutes } from '../../src/utils/formatters'

describe('formatPrice', () => {
  it('formats a whole number price', () => {
    expect(formatPrice(10)).toBe('10.00€')
  })

  it('formats a decimal price', () => {
    expect(formatPrice(12.5)).toBe('12.50€')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0.00€')
  })

  it('handles NaN gracefully', () => {
    expect(formatPrice(NaN)).toBe('0.00€')
  })

  it('handles non-number input', () => {
    expect(formatPrice('abc')).toBe('0.00€')
    expect(formatPrice(null)).toBe('0.00€')
    expect(formatPrice(undefined)).toBe('0.00€')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2026-04-04')
    const result = formatDate(date)
    expect(result).toContain('2026')
  })

  it('formats a date string', () => {
    const result = formatDate('2026-04-04')
    expect(result).toContain('2026')
  })

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

describe('formatMinutes', () => {
  it('formats minutes under an hour', () => {
    expect(formatMinutes(32)).toBe('32min')
  })

  it('formats exactly one hour', () => {
    expect(formatMinutes(60)).toBe('1h 0min')
  })

  it('formats hours and minutes', () => {
    expect(formatMinutes(75)).toBe('1h 15min')
  })

  it('formats zero minutes', () => {
    expect(formatMinutes(0)).toBe('0min')
  })

  it('handles negative input gracefully', () => {
    expect(formatMinutes(-5)).toBe('0min')
  })

  it('handles non-number input gracefully', () => {
    expect(formatMinutes('abc')).toBe('0min')
  })
})
