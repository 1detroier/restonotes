import { useRef } from 'react'
import { productoRepo } from '../../db/repositories/productos'

export default function ImportExportButtons({ onImport }) {
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    try {
      const productos = await productoRepo.getAll()
      const data = {
        exportDate: new Date().toISOString(),
        count: productos.length,
        productos
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `carta-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[ImportExport] Export failed:', error)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.productos || !Array.isArray(data.productos)) {
        throw new Error('Formato inválido: se requiere un array de productos')
      }

      const count = await productoRepo.bulkAdd(data.productos)
      onImport?.(data.productos.length)
    } catch (error) {
      console.error('[ImportExport] Import failed:', error)
      onImport?.(null, error.message)
    }

    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="btn btn-sm btn-outline min-h-[44px]"
        aria-label="Exportar carta"
        title="Exportar carta"
      >
        📤 Exportar
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-sm btn-outline min-h-[44px]"
        aria-label="Importar carta"
        title="Importar carta"
      >
        📥 Importar
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
