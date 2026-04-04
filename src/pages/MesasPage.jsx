import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useUIStore } from '../store/useUIStore'
import MesaGrid from '../components/mesa/MesaGrid'
import MesaDrawer from '../components/mesa/MesaDrawer'
import ContextMenu from '../components/mesa/ContextMenu'

export default function MesasPage() {
  const { mesas, loading, setMesaActiva, closeCuenta } = useAppStore()
  const { openModal } = useUIStore()
  const [contextMesa, setContextMesa] = useState(null)

  const handleMesaTap = (mesa) => {
    setMesaActiva(mesa.id)
    openModal({
      title: `Mesa #${mesa.numero}`,
      content: <MesaDrawer mesaId={mesa.id} />
    })
  }

  const handleMesaLongPress = (mesa) => {
    setContextMesa(mesa)
  }

  const handleCloseCuentaFromMenu = async (mesa) => {
    try {
      await closeCuenta(mesa.id)
    } catch (err) {
      console.error('Failed to close cuenta:', err)
    }
  }

  const handleVerTicket = (mesa) => {
    handleMesaTap(mesa)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <h1 className="text-xl font-bold">Mesas</h1>
        <p className="text-xs text-base-content/60">
          {mesas.filter((m) => m.estado === 'ocupada').length} de {mesas.length} ocupadas
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <MesaGrid
            mesas={mesas}
            onTap={handleMesaTap}
            onLongPress={handleMesaLongPress}
          />
        )}
      </div>

      {/* Context menu */}
      {contextMesa && (
        <ContextMenu
          mesa={contextMesa}
          onClose={() => setContextMesa(null)}
          onCloseCuenta={handleCloseCuentaFromMenu}
          onVerTicket={handleVerTicket}
        />
      )}
    </div>
  )
}
