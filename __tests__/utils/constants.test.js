import { describe, it, expect } from 'vitest'
import { MESA_COUNT, CATEGORIAS, ESTADOS_MESA, TABS } from '../../src/utils/constants'

describe('constants', () => {
  it('MESA_COUNT is 14', () => {
    expect(MESA_COUNT).toBe(14)
  })

  it('CATEGORIAS contains all 5 categories', () => {
    expect(CATEGORIAS).toHaveLength(5)
    expect(CATEGORIAS).toContain('primero')
    expect(CATEGORIAS).toContain('segundo')
    expect(CATEGORIAS).toContain('postre')
    expect(CATEGORIAS).toContain('bebida')
    expect(CATEGORIAS).toContain('cafeteria')
  })

  it('ESTADOS_MESA has all 3 states', () => {
    expect(ESTADOS_MESA.LIBRE).toBe('libre')
    expect(ESTADOS_MESA.OCUPADA).toBe('ocupada')
    expect(ESTADOS_MESA.CUENTA).toBe('cuenta')
    expect(Object.keys(ESTADOS_MESA)).toHaveLength(3)
  })

  it('TABS has all 3 tab identifiers', () => {
    expect(TABS.MESAS).toBe('mesas')
    expect(TABS.CARTA).toBe('carta')
    expect(TABS.MENU).toBe('menu')
    expect(Object.keys(TABS)).toHaveLength(3)
  })
})
