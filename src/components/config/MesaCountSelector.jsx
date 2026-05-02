import { useState } from 'react'
import { useUIStore } from '../../store/useUIStore'
import { useAppStore } from '../../store/useAppStore'
import { db } from '../../db/schema'
import { ESTADOS_MESA } from '../../utils/constants'

export default function MesaCountSelector() {
  const { mesaCount, setMesaCount } = useUIStore()
  const { loadMesas } = useAppStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingCount, setPendingCount] = useState(null)
  const [inputValue, setInputValue] = useState(mesaCount)

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10)
    setInputValue(value)
    if (!isNaN(value) && value !== mesaCount && value > 0) {
      setPendingCount(value)
      setShowConfirm(true)
    }
  }

  const confirmChange = async () => {
    if (pendingCount !== null && pendingCount > 0) {
      // Recreate mesas with new count
      await recreateMesas(pendingCount)
      // Reload mesas in store
      await loadMesas()
      // Save the new count to localStorage
      setMesaCount(pendingCount)
      setInputValue(pendingCount)
      setPendingCount(null)
      setShowConfirm(false)
    }
  }

  const recreateMesas = async (count) => {
    // Delete all existing mesas
    await db.mesas.clear()
    // Create new mesas with specified count
    const now = new Date()
    const mesas = []
    for (let i = 1; i <= count; i++) {
      mesas.push({
        numero: i,
        estado: ESTADOS_MESA.LIBRE,
        pedidos: [],
        total: 0,
        openedAt: null,
        createdAt: now,
        updatedAt: now
      })
    }
    await db.mesas.bulkAdd(mesas)
    console.log(`[MesaCountSelector] Recreated ${count} mesas`)
  }

  const cancelChange = () => {
    setInputValue(mesaCount)
    setPendingCount(null)
    setShowConfirm(false)
  }

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-3">Número de Mesas</h3>
      <input
        type="number"
        min="1"
        max="50"
        value={inputValue}
        onChange={handleChange}
        className="input input-bordered w-full"
        placeholder="Número de mesas"
      />

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 p-6 rounded-lg max-w-sm w-full mx-4">
            <h4 className="font-bold text-lg mb-4">Confirmar cambio</h4>
            <p className="text-base-content/70 mb-6">
              ¿Cambiar el número de mesas de <strong>{mesaCount}</strong> a <strong>{pendingCount}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelChange}
                className="btn btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmChange}
                className="btn btn-primary flex-1"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}