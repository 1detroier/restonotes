import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import VentasSummary from '../components/ventas/VentasSummary'
import { exportVentasToCSV } from '../utils/csvExport'

/**
 * Daily sales report page with date picker and CSV export.
 */
export default function VentasPage() {
  const { ventas, loadVentas } = useAppStore()
  const today = new Date().toISOString().substring(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)

  useEffect(() => {
    loadVentas(selectedDate)
  }, [selectedDate, loadVentas])

  const handleExportCSV = () => {
    exportVentasToCSV(ventas, `ventas-${selectedDate}.csv`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Ventas</h1>
            <p className="text-xs text-base-content/60">
              Reporte diario
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm min-h-[44px]"
            onClick={handleExportCSV}
            disabled={ventas.length === 0}
          >
            📥 Exportar CSV
          </button>
        </div>

        {/* Date picker */}
        <div className="mt-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs min-h-[44px]"
            aria-label="Seleccionar fecha"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <VentasSummary ventas={ventas} fecha={selectedDate} />
      </div>
    </div>
  )
}
