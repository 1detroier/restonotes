import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ImportExportButtons from '../../../src/components/carta/ImportExportButtons'

// Mock productoRepo
const mockGetAll = vi.fn().mockResolvedValue([
  { id: 1, nombre: 'Café', precio: 1.5, categoria: 'cafeteria', emoji: '☕', activo: true },
  { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗', activo: true }
])
const mockBulkAdd = vi.fn().mockResolvedValue(2)

vi.mock('../../../src/db/repositories/productos', () => ({
  productoRepo: {
    getAll: () => mockGetAll(),
    bulkAdd: (...args) => mockBulkAdd(...args)
  }
}))

// Mock URL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

// Mock Blob
global.Blob = class {
  constructor(content, options) {
    this.content = content
    this.options = options
  }
}

// Mock anchor element for download
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn()
}
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tag) => {
  if (tag === 'a') return mockAnchor
  return originalCreateElement(tag)
})

describe('ImportExportButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue([
      { id: 1, nombre: 'Café', precio: 1.5, categoria: 'cafeteria', emoji: '☕', activo: true },
      { id: 2, nombre: 'Ensalada', precio: 8, categoria: 'primero', emoji: '🥗', activo: true }
    ])
  })

  it('renders export and import buttons', () => {
    render(<ImportExportButtons />)
    expect(screen.getByText(/📤 Exportar/)).toBeTruthy()
    expect(screen.getByText(/📥 Importar/)).toBeTruthy()
  })

  it('exports JSON when export button is clicked', async () => {
    render(<ImportExportButtons />)
    
    await act(async () => {
      fireEvent.click(screen.getByText(/📤 Exportar/))
    })

    expect(mockGetAll).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockAnchor.download).toMatch(/carta-\d{4}-\d{2}-\d{2}\.json/)
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('calls bulkAdd when importing valid JSON', async () => {
    const onImport = vi.fn()
    render(<ImportExportButtons onImport={onImport} />)

    const fileInput = screen.getByRole('button', { name: /Importar carta/ })
    // Find the hidden input via the component's ref
    const hiddenInput = document.querySelector('input[type="file"]')
    
    const validJson = JSON.stringify({
      exportDate: new Date().toISOString(),
      productos: [
        { nombre: 'Test', precio: 5, categoria: 'primero', emoji: '🍲', activo: true }
      ]
    })
    const file = new File([validJson], 'test.json', { type: 'application/json' })
    // jsdom doesn't support file.text(), mock it
    file.text = () => Promise.resolve(validJson)

    await act(async () => {
      fireEvent.change(hiddenInput, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(mockBulkAdd).toHaveBeenCalled()
      expect(onImport).toHaveBeenCalledWith(1)
    })
  })

  it('calls onImport with error when importing invalid JSON', async () => {
    const onImport = vi.fn()
    render(<ImportExportButtons onImport={onImport} />)

    const hiddenInput = document.querySelector('input[type="file"]')
    const invalidJson = 'not valid json'
    const file = new File([invalidJson], 'test.json', { type: 'application/json' })
    file.text = () => Promise.resolve(invalidJson)

    await act(async () => {
      fireEvent.change(hiddenInput, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(null, expect.any(String))
    })
  })

  it('calls onImport with error when importing invalid structure', async () => {
    const onImport = vi.fn()
    render(<ImportExportButtons onImport={onImport} />)

    const hiddenInput = document.querySelector('input[type="file"]')
    const invalidStructure = JSON.stringify({ wrong: 'format' })
    const file = new File([invalidStructure], 'test.json', { type: 'application/json' })
    file.text = () => Promise.resolve(invalidStructure)

    await act(async () => {
      fireEvent.change(hiddenInput, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(null, expect.any(String))
    })
  })
})
