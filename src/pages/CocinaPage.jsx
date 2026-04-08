import { useEffect, useCallback, useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import CocinaQueue from '../components/cocina/CocinaQueue'
import { COCINA_STATUS } from '../utils/constants'

/**
 * Simple modal component for history item details
 */
function HistoryModal({ isOpen, onClose, group }) {
  if (!isOpen || !group) return null

  // Calculate duration
  const preparingTime = group.items.find((i) => i.status === COCINA_STATUS.PREPARANDO)?.timestamp
  const finalTime = group.items.find((i) => i.status === COCINA_STATUS.LISTO || i.status === COCINA_STATUS.CANCELADO)?.timestamp
  
  let duration = '-'
  if (preparingTime && finalTime) {
    const diffMs = new Date(finalTime) - new Date(preparingTime)
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) {
      duration = `${diffMins}m`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      duration = `${hours}h ${mins}m`
    }
  }

  // Format time
  const formatTime = (ts) => {
    if (!ts) return '-'
    return new Date(ts).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-base-100 rounded-xl p-4 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Mesa #{group.mesaId}</h3>
            <p className="text-sm text-base-content/60">
              {group.type === 'completed' ? 'Completada' : 'Cancelada'} • {duration}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {group.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-base-200 rounded">
              <div>
                <span className="font-medium">{item.productoNombre}</span>
                <span className="text-sm text-base-content/60 ml-2">x{item.cantidad}</span>
                {item.nota && <span className="text-xs text-base-content/50 ml-1">({item.nota})</span>}
              </div>
              <span className={`badge badge-sm ${item.status === COCINA_STATUS.LISTO ? 'badge-ghost' : 'badge-error'}`}>
                {item.status === COCINA_STATUS.LISTO ? 'Listo' : 'Cancelado'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-base-content/50 text-center">
          {formatTime(group.items[0]?.timestamp)}
        </div>
      </div>
    </div>
  )
}

/**
 * Kitchen queue page — orchestrates loading and auto-refresh of cocina items.
 * Shows pending + preparing in active view, completed/cancelled in history.
 */
export default function CocinaPage() {
  const { cocina, syncCocina, completeMesaCocina, startPreparingMesa, cancelMesaCocina } = useAppStore()
  const [showHistory, setShowHistory] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10))
  const [selectedGroup, setSelectedGroup] = useState(null) // For modal

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
      // Skip old data that doesn't have new statuses
      if (item.status !== COCINA_STATUS.PENDIENTE && 
          item.status !== COCINA_STATUS.PREPARANDO && 
          item.status !== COCINA_STATUS.LISTO && 
          item.status !== COCINA_STATUS.CANCELADO) {
        continue
      }

      if (item.status === COCINA_STATUS.LISTO || item.status === COCINA_STATUS.CANCELADO) {
        const existingGroup = completed.find((g) => g.mesaId === item.mesaId) || cancelled.find((g) => g.mesaId === item.mesaId)
        if (item.status === COCINA_STATUS.LISTO) {
          if (!completed.find((g) => g.mesaId === item.mesaId)) {
            completed.push({ mesaId: item.mesaId, items: [], timestamp: item.timestamp })
          }
          const group = completed.find((g) => g.mesaId === item.mesaId)
          group.items.push(item)
        } else {
          if (!cancelled.find((g) => g.mesaId === item.mesaId)) {
            cancelled.push({ mesaId: item.mesaId, items: [], timestamp: item.timestamp })
          }
          const group = cancelled.find((g) => g.mesaId === item.mesaId)
          group.items.push(item)
        }
      } else {
        // Pendiente or Preparando - check if any in group
        if (!active.find((g) => g.mesaId === item.mesaId)) {
          active.push({ mesaId: item.mesaId, items: [], timestamp: item.timestamp })
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

  // Filter history by date
  const filteredStats = useMemo(() => {
    if (!showHistory) return stats
    
    const dateStr = selectedDate
    const filteredCompleted = stats.completed.filter((g) => {
      const itemDate = g.items[0]?.timestamp?.substring(0, 10)
      return itemDate === dateStr
    })
    const filteredCancelled = stats.cancelled.filter((g) => {
      const itemDate = g.items[0]?.timestamp?.substring(0, 10)
      return itemDate === dateStr
    })
    return { ...stats, completed: filteredCompleted, cancelled: filteredCancelled }
  }, [stats, showHistory, selectedDate])

  const pendingCount = stats.active.flatMap((g) => g.items).filter((i) => i.status === COCINA_STATUS.PENDIENTE).length
  const preparingCount = stats.active.flatMap((g) => g.items).filter((i) => i.status === COCINA_STATUS.PREPARANDO).length
  const completedCount = filteredStats.completed.flatMap((g) => g.items).length
  const cancelledCount = filteredStats.cancelled.flatMap((g) => g.items).length

  // Calculate duration between first 'preparando' and 'listo'/'cancelado'
  const calculateDuration = (group) => {
    const preparandoTime = group.items.find((i) => i.status === COCINA_STATUS.PREPARANDO)?.timestamp
    const finalTime = group.items.find((i) => i.status === COCINA_STATUS.LISTO || i.status === COCINA_STATUS.CANCELADO)?.timestamp
    
    if (!preparandoTime || !finalTime) return '-'
    
    const start = new Date(preparandoTime)
    const end = new Date(finalTime)
    const diffMs = end - start
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
  }

  // Handle group click for modal
  const handleGroupClick = (group, type) => {
    setSelectedGroup({ ...group, type })
  }

  const handleCloseModal = () => {
    setSelectedGroup(null)
  }

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

        {/* Date filter for history */}
        {showHistory && (
          <div className="mt-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-bordered input-sm w-full max-w-xs min-h-[44px]"
              aria-label="Seleccionar fecha"
            />
          </div>
        )}
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
            {filteredStats.completed.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-base-content/60 uppercase mb-2">Completadas ({completedCount})</h2>
                <div className="space-y-2">
                  {filteredStats.completed.map((group) => (
                    <button
                      key={`completed-${group.mesaId}`}
                      type="button"
                      className="w-full text-left bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition-colors"
                      onClick={() => handleGroupClick(group, 'completed')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold">Mesa #{group.mesaId}</span>
                          <span className="text-sm text-base-content/60 ml-2">
                            {formatDate(group.items[0]?.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-base-content/70">
                          {calculateDuration(group)}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/50 mt-1">
                        {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled section */}
            {filteredStats.cancelled.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-bold text-error/70 uppercase mb-2">Canceladas ({cancelledCount})</h2>
                <div className="space-y-2">
                  {filteredStats.cancelled.map((group) => (
                    <button
                      key={`cancelled-${group.mesaId}`}
                      type="button"
                      className="w-full text-left bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-colors"
                      onClick={() => handleGroupClick(group, 'cancelled')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold">Mesa #{group.mesaId}</span>
                          <span className="text-sm text-base-content/60 ml-2">
                            {formatDate(group.items[0]?.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-base-content/70">
                          {calculateDuration(group)}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/50 mt-1">
                        {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredStats.completed.length === 0 && filteredStats.cancelled.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <p className="text-base-content/50">Sin historial para esta fecha 📋</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for group details */}
      <HistoryModal 
        isOpen={!!selectedGroup} 
        onClose={handleCloseModal} 
        group={selectedGroup} 
      />
    </div>
  )
}
