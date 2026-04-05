import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportVentasToCSV } from '../../src/utils/csvExport'

describe('csvExport', () => {
  let mockLink
  let mockCreateObjectURL
  let mockRevokeObjectURL
  let appendedElements = []

  beforeEach(() => {
    // Mock DOM APIs
    mockLink = {
      href: '',
      download: '',
      style: {},
      click: vi.fn()
    }
    mockCreateObjectURL = vi.fn(() => 'blob:url')
    mockRevokeObjectURL = vi.fn()

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return mockLink
      }
      return { style: {} }
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      appendedElements.push(el)
      return el
    })
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    global.Blob = class {
      constructor(parts, opts) {
        this.content = parts[0]
        this.type = opts?.type
      }
    }
    appendedElements = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportVentasToCSV', () => {
    it('starts with UTF-8 BOM', () => {
      const ventas = [
        { mesaId: 3, fecha: '2026-04-05', timestamp: '2026-04-05T10:00:00Z', total: 25, items: [{ nombre: 'Café', cantidad: 2 }], paymentMethod: 'efectivo' }
      ]
      exportVentasToCSV(ventas, 'ventas-2026-04-05.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      expect(blob.content.startsWith('\uFEFF')).toBe(true)
    })

    it('has correct CSV column headers', () => {
      const ventas = []
      exportVentasToCSV(ventas, 'test.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      const lines = blob.content.split('\n')
      expect(lines[0]).toBe('\uFEFFFecha,Hora,Mesa,Items,Total,Método de pago')
    })

    it('formats date and time correctly', () => {
      const ventas = [
        { mesaId: 5, fecha: '2026-04-05', timestamp: '2026-04-05T14:30:00Z', total: 35, items: [], paymentMethod: 'tarjeta' }
      ]
      exportVentasToCSV(ventas, 'test.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      const lines = blob.content.split('\n')
      expect(lines[1]).toContain('2026-04-05')
      expect(lines[1]).toContain('14:30')
    })

    it('formats items with quantities', () => {
      const ventas = [
        { mesaId: 1, fecha: '2026-04-05', timestamp: '2026-04-05T10:00:00Z', total: 10, items: [
          { nombre: 'Café', cantidad: 2 },
          { nombre: 'Ensalada', cantidad: 1 }
        ], paymentMethod: 'efectivo' }
      ]
      exportVentasToCSV(ventas, 'test.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      const lines = blob.content.split('\n')
      expect(lines[1]).toContain('2× Café; 1× Ensalada')
    })

    it('handles empty ventas array (header row only)', () => {
      exportVentasToCSV([], 'test.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      const lines = blob.content.split('\n').filter((l) => l.trim())
      expect(lines).toHaveLength(1)
      expect(lines[0]).toContain('Fecha')
    })

    it('triggers download with correct filename', () => {
      const ventas = []
      exportVentasToCSV(ventas, 'ventas-2026-04-05.csv')

      expect(mockLink.download).toBe('ventas-2026-04-05.csv')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('formats payment method as human-readable label', () => {
      const ventas = [
        { mesaId: 2, fecha: '2026-04-05', timestamp: '2026-04-05T11:00:00Z', total: 20, items: [], paymentMethod: 'tarjeta' }
      ]
      exportVentasToCSV(ventas, 'test.csv')

      const blob = mockCreateObjectURL.mock.calls[0][0]
      const lines = blob.content.split('\n')
      expect(lines[1]).toContain('Tarjeta')
    })
  })
})
