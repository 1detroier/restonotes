import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useUIStore } from '../../store/useUIStore'
import { useMesaTimer } from '../../hooks/useMesaTimer'
import ProductQuickAdd from './ProductQuickAdd'
import TicketPreview from './TicketPreview'
import QuantityModal from './QuantityModal'
import CerrarCuentaModal from './CerrarCuentaModal'
import { formatPrice, formatMinutes } from '../../utils/formatters'

/**
 * Bottom sheet drawer for order management.
 * Orchestrated via useUIStore modals.
 * @param {Object} props
 * @param {number} props.mesaId - Active mesa ID
 */
export default function MesaDrawer({ mesaId }) {
  const { mesas, productos, menuDelDia, addItemToMesa, removeItemFromMesa, updateItemQuantity, closeCuenta } = useAppStore()
  const { closeModal } = useUIStore()
  const [activeTab, setActiveTab] = useState('carta')
  const [qtyProduct, setQtyProduct] = useState(null)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const mesa = mesas.find((m) => m.id === mesaId)
  const { minutes, colorState } = useMesaTimer(mesa?.openedAt)

  if (!mesa) return null

  const pedidos = mesa.pedidos || []

  // Filter products by active tab
  const filteredProductos = productos.filter((p) => {
    if (!p.activo) return false
    if (activeTab === 'carta') {
      return p.categoria !== 'bebidas'
    }
    if (activeTab === 'menu') {
      return p.categoria === 'primero' || p.categoria === 'segundo' || p.categoria === 'postre'
    }
    if (activeTab === 'bebidas') {
      return p.categoria === 'bebidas'
    }
    return true
  })

  const handleAddProduct = async (producto, cantidad = 1) => {
    try {
      await addItemToMesa(mesaId, producto, cantidad)
    } catch (err) {
      console.error('Failed to add item:', err)
    }
  }

  const handleRemoveItem = async (tempId) => {
    try {
      await removeItemFromMesa(mesaId, tempId)
    } catch (err) {
      console.error('Failed to remove item:', err)
    }
  }

  const handleUpdateQty = async (tempId, newQty) => {
    try {
      await updateItemQuantity(mesaId, tempId, newQty)
    } catch (err) {
      console.error('Failed to update quantity:', err)
    }
  }

  const handleQtyConfirm = async (producto, cantidad) => {
    setQtyProduct(null)
    await handleAddProduct(producto, cantidad)
  }

  const handleCloseCuenta = async () => {
    try {
      await closeCuenta(mesaId)
      setShowCloseConfirm(false)
      closeModal()
    } catch (err) {
      console.error('Failed to close cuenta:', err)
    }
  }

  const tabs = [
    { id: 'carta', label: 'Carta' },
    { id: 'menu', label: 'Menú Hoy' },
    { id: 'bebidas', label: 'Bebidas' }
  ]

  return (
    <>
      {/* Drawer overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeModal}
      >
        {/* Bottom sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl h-[90vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-base-100 z-10 border-b border-base-200 px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Mesa #{mesa.numero}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-primary">{formatPrice(mesa.total || 0)}</span>
                  {mesa.estado === 'ocupada' && (
                    <span
                      className={`font-medium ${
                        colorState === 'red' ? 'text-red-600' : 'text-orange-500'
                      }`}
                    >
                      {formatMinutes(minutes)}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]"
                onClick={closeModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Product grid */}
            <ProductQuickAdd
              productos={filteredProductos}
              onAdd={handleAddProduct}
              onLongPressProduct={setQtyProduct}
            />

            {/* Ticket preview */}
            {pedidos.length > 0 && (
              <div className="border-t border-base-200 mt-2">
                <h3 className="text-sm font-semibold px-4 py-2 text-base-content/70 uppercase">
                  Ticket ({pedidos.length} artículos)
                </h3>
                <TicketPreview pedidos={pedidos} onRemove={handleRemoveItem} onUpdateQty={handleUpdateQty} />
              </div>
            )}
          </div>

          {/* Action buttons */}
          {pedidos.length > 0 && (
            <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-3 flex gap-2">
              <button
                className="btn btn-outline flex-1 min-h-[44px]"
                onClick={() => setShowCloseConfirm(true)}
              >
                🧾 Cobrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quantity modal */}
      {qtyProduct && (
        <QuantityModal
          producto={qtyProduct}
          onConfirm={handleQtyConfirm}
          onCancel={() => setQtyProduct(null)}
        />
      )}

      {/* Close account confirmation */}
      {showCloseConfirm && (
        <CerrarCuentaModal
          mesa={mesa}
          onConfirm={handleCloseCuenta}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </>
  )
}
