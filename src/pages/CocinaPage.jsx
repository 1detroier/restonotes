import { useEffect, useCallback, useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import CocinaQueue from '../components/cocina/CocinaQueue'
import { COCINA_STATUS } from '../utils/constants'

/**
 * Kitchen queue page — orchestrates loading and auto-refresh of cocina items.
 * Shows pending + preparing in active view, completed/cancelled in history.
 */
export default function CocinaPage() {
  const { cocina, syncCocina, completeMesaCocina, startPreparingMesa, cancelMesaCocina } = useAppStore()
  const [showHistory, setShowHistory] = useState(false)

  const refresh = useCallback(async () => {
    await syncCocina()
  }, [syncCocina])

  // Initial load + sync
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  // Split cocina items by status
  const stats = useMemo(() => {
    const active = []
    const completed = []
    const cancelled = []

    for (const item of cocina) {
      if (item.status === COCINA_STATUS.LISTO || item.status === COCINA_STATUS.CANCELADO) {
        // Items are grouped by mesaId in the list - check if any item in the group is listo/cancelado
        const existingGroup = completed.find((g) => g.mesaId === item.mesaId) || cancelled.find((g) => g.mesaId === item.mesaId)
        if (item.status === COCINA_STATUS.LISTO) {
          if (!completed.find((g) => g.mesaId === item.mesaId)) {
            completed.push({ mesaId: item.mesaId, items: [] })
          }
          const group = completed.find((g) => g.mesaId === item.mesaId)
          group.items.push(item)
        } else {
          if (!cancelled.find((g) => g.mesaId === item.mesaId)) {
            cancelled.push({ mesaId: item.mesaId, items: [] })
          }
          const group = cancelled.find((g) => g.mesaId === item.mesaId)
          group.items.push(item)
        }
      } else {
        // Pendiente or Preparando - check if any in group
        if (!active.find((g) => g.mesaId === item.mesaId)) {
          active.push({ mesaId: item.mesaId, items: [] })
        }
        const group = active.find((g) => g.mesaId === item.mesaId)
        group.items.push(item)
      }
    }

    // Sort active group by timestamp (oldest first)
    active.sort((a, b) => {
      const aTime = a.items[0]?.timestamp || ''
      const bTime = b.items[0]?.timestamp || ''
      return aTime.localeCompare(bTime)
    })

    return { active, completed: completed.sort((a, b) => b.mesaId - a.mesaId), cancelled: cancelled.sort((a, b) => b.mesaId - a.mesaId) }
  }, [cocina])

  const pendingCount = stats.active.flatMap((g) => g.items).filter((i) => i.status === COCINA_STATUS.PENDIENTE).length
  const preparingCount = stats.active.flatMap((g) => g.items).filter((i) => i.status === COCINA_STATUS.PREPARANDO).length
  const completedCount = stats.completed.flatMap((g) => g.items).length
  const cancelledCount = stats.cancelled.flatMap((g) => g.items).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <h1 className="text-xl font-bold">Cocina</h1>
        <p className="text-xs text-base-content/60">
          {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} • {preparingCount} preparando
        </p>

        {/* Tab pills */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className={`btn btn-sm ${!showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(false)}
          >
            Activos
          </button>
          <button
            type="button"
            className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(true)}
          >
            Historial ({completedCount + cancelledCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!showHistory ? (
          // Active view: pendientes + preparando items
          stats.active.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-base-content/50 text-lg">No hay pedidos activos 🍳</p>
            </div>
          ) : (
            <>
              {stats.active.map((group) => (
                <CocinaQueue
                  key={group.mesaId}
                  items={group.items}
                  onCompleteMesa={completeMesaCocina}
                  onStartPreparing={startPreparingMesa}
                  onCancelMesa={cancelMesaCocina}
                />
              ))}
            </>
          )
        ) : (
          // History view: completed + cancelled items
          <div className="space-y-4">
            {/* Completed section */}
            {stats.completed.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-base-content/60 uppercase mb-2">Completadas ({completedCount})</h2>
                <div className="space-y-2 opacity-60 grayscale">
                  {stats.completed.map((group) => (
                    <CocinaQueue key={`completed-${group.mesaId}`} items={group.items} />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled section */}
            {stats.cancelled.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-bold text-error/70 uppercase mb-2">Canceladas ({cancelledCount})</h2>
                <div className="space-y-2">
                  {stats.cancelled.map((group) => (
                    <CocinaQueue key={`cancelled-${group.mesaId}`} items={group.items} />
                  ))}
                </div>
              </div>
            )}

            {stats.completed.length === 0 && stats.cancelled.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <p className="text-base-content/50">Sin historial aún 📋</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
