import { describe, it, expect } from 'vitest'
import { MESA_COUNT, CATEGORIAS, CATEGORIAS_CARTA, CATEGORIAS_MENU, ESTADOS_MESA, TABS } from '../../src/utils/constants'

describe('constants', () => {
  it('MESA_COUNT is 14', () => {
    expect(MESA_COUNT).toBe(14)
  })

  it('CATEGORIAS_CARTA contains all 9 carta categories', () => {
    expect(CATEGORIAS_CARTA).toHaveLength(9)
    expect(CATEGORIAS_CARTA).toContain('con_arroz')
    expect(CATEGORIAS_CARTA).toContain('sin_arroz')
    expect(CATEGORIAS_CARTA).toContain('pescado')
    expect(CATEGORIAS_CARTA).toContain('sopas')
    expect(CATEGORIAS_CARTA).toContain('entrantes')
    expect(CATEGORIAS_CARTA).toContain('arroz_frijoles')
    expect(CATEGORIAS_CARTA).toContain('bolon')
    expect(CATEGORIAS_CARTA).toContain('postres')
    expect(CATEGORIAS_CARTA).toContain('bebidas')
  })

  it('CATEGORIAS_MENU contains all 3 menu categories', () => {
    expect(CATEGORIAS_MENU).toHaveLength(3)
    expect(CATEGORIAS_MENU).toContain('primero')
    expect(CATEGORIAS_MENU).toContain('segundo')
    expect(CATEGORIAS_MENU).toContain('postre')
  })

  it('CATEGORIAS combines carta and menu categories', () => {
    expect(CATEGORIAS).toHaveLength(12)
    expect(CATEGORIAS).toEqual([...CATEGORIAS_CARTA, ...CATEGORIAS_MENU])
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
