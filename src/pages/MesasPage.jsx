import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useUIStore } from '../store/useUIStore'
import MesaGrid from '../components/mesa/MesaGrid'
import MesaDrawer from '../components/mesa/MesaDrawer'
import ContextMenu from '../components/mesa/ContextMenu'
import CerrarCuentaModal from '../components/mesa/CerrarCuentaModal'

export default function MesasPage() {
  const { mesas, loading, setMesaActiva, closeCuenta } = useAppStore()
  const { openModal } = useUIStore()
  const [contextMesa, setContextMesa] = useState(null)
  const [mesaToClose, setMesaToClose] = useState(null)

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

  const handleCloseCuentaFromMenu = (mesa) => {
    setContextMesa(null)
    setMesaToClose(mesa)
  }

  const handleConfirmCloseCuenta = async (paymentMethod) => {
    try {
      await closeCuenta(mesaToClose.id, paymentMethod)
      setMesaToClose(null)
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
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {mesas
            .filter((m) => m.estado === 'ocupada' && m.openedAt)
            .sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime())
            .map((mesa) => (
              <span
                key={mesa.id}
                className="badge badge-outline whitespace-nowrap"
              >
                #{mesa.numero} · {new Date(mesa.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ))}
        </div>
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

      {/* Close account confirmation from context menu */}
      {mesaToClose && (
        <CerrarCuentaModal
          mesa={mesaToClose}
          onConfirm={handleConfirmCloseCuenta}
          onCancel={() => setMesaToClose(null)}
        />
      )}
    </div>
  )
}
