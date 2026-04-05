import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import CocinaQueue from '../components/cocina/CocinaQueue'

/**
 * Kitchen queue page — orchestrates loading and auto-refresh of cocina items.
 */
export default function CocinaPage() {
  const { cocina, syncCocina, completeMesaCocina } = useAppStore()

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <h1 className="text-xl font-bold">Cocina</h1>
        <p className="text-xs text-base-content/60">
          {cocina.length} pedido{cocina.length !== 1 ? 's' : ''} en cola
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {cocina.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-base-content/50 text-lg">No hay pedidos pendientes 🍳</p>
          </div>
        ) : (
          <CocinaQueue items={cocina} onCompleteMesa={completeMesaCocina} />
        )}
      </div>
    </div>
  )
}
