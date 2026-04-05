import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useUIStore } from '../../store/useUIStore'
import { useMesaTimer } from '../../hooks/useMesaTimer'
import ProductQuickAdd from './ProductQuickAdd'
import TicketPreview from './TicketPreview'
import QuantityModal from './QuantityModal'
import CerrarCuentaModal from './CerrarCuentaModal'
import MenuSelectionModal from './MenuSelectionModal'
import { groupByCategory, calcTotal, getCancelledCount } from '../../utils/orderHelpers'
import { formatPrice, formatMinutes } from '../../utils/formatters'

/**
 * Bottom sheet drawer for order management.
 * Orchestrated via useUIStore modals.
 * @param {Object} props
 * @param {number} props.mesaId - Active mesa ID
 */
export default function MesaDrawer({ mesaId }) {
  const { mesas, productos, menuDelDia, takeaways, addItemToMesa, removeItemFromMesa, updateItemQuantity, closeCuenta, cancelItem, cancelMesaPedido, loadMesas } = useAppStore()
  const { closeModal } = useUIStore()
  const [activeTab, setActiveTab] = useState('carta')
  const [qtyProduct, setQtyProduct] = useState(null)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showMenuSelection, setShowMenuSelection] = useState(false)
  const [showCancelOrder, setShowCancelOrder] = useState(false)

  const mesa = mesas.find((m) => m.id === mesaId)
  const { minutes, colorState } = useMesaTimer(mesa?.openedAt)

  if (!mesa) return null

  const pedidos = mesa.pedidos || []
  const mesaTakeaways = (takeaways || []).filter((order) => order.mesaId === mesaId && order.status !== 'pagado')

  // Filter products by active tab
  const filteredProductos = productos.filter((p) => {
    if (!p.activo) return false
    if (activeTab === 'carta') {
      return p.categoria !== 'bebidas'
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

  const handleCloseCuenta = async (paymentMethod) => {
    try {
      await closeCuenta(mesaId, paymentMethod)
      setShowCloseConfirm(false)
      closeModal()
    } catch (err) {
      console.error('Failed to close cuenta:', err)
    }
  }

  const handleCancelOrder = async () => {
    try {
      await cancelMesaPedido(mesaId)
      setShowCancelOrder(false)
      closeModal()
    } catch (err) {
      console.error('Failed to cancel order:', err)
    }
  }

  const handleCancelItem = async (id, itemId) => {
    try {
      await cancelItem(id, itemId)
    } catch (err) {
      console.error('Failed to cancel item:', err)
    }
  }

  const handleMenuConfirm = async (primero, segundo, postre, bebida) => {
    try {
      const menuPrice = menuDelDia?.precio || 0
      // Build nota with all selected components
      const components = [primero?.nombre, segundo?.nombre, postre?.nombre, bebida?.nombre].filter(Boolean)
      const menuNota = components.join(' | ')

      await addItemToMesa(mesaId, {
        id: 'menu-dia',
        nombre: 'Menú Completo',
        precio: menuPrice,
        categoria: 'menu',
        emoji: '🍱'
      }, 1, 'menu', menuNota)
      setShowMenuSelection(false)
    } catch (err) {
      console.error('Failed to add menu:', err)
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
            {/* Menú Hoy tab - single card */}
            {activeTab === 'menu' ? (
              <div className="p-4">
                {menuDelDia && menuDelDia.activo ? (
                  <button
                    className="w-full card bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-colors min-h-[100px]"
                    onClick={() => setShowMenuSelection(true)}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🍱</span>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-lg">Menú del Día</h3>
                          <p className="text-sm text-base-content/60">
                            {menuDelDia.primeroIds?.length || 0} primeros · {menuDelDia.segundoIds?.length || 0} segundos · {menuDelDia.postreIds?.length || 0} postres
                          </p>
                        </div>
                        <span className="text-xl font-bold text-primary">{formatPrice(menuDelDia.precio)}</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="text-center py-8 text-base-content/50">
                    <p className="text-lg">🍱</p>
                    <p className="text-sm mt-2">No hay menú configurado para hoy</p>
                  </div>
                )}
              </div>
            ) : (
              /* Carta / Bebidas - product grid grouped by category */
              <ProductQuickAdd
                productos={filteredProductos}
                onAdd={handleAddProduct}
                onLongPressProduct={setQtyProduct}
              />
            )}

            {/* Ticket preview */}
            {pedidos.length > 0 && (
              <div className="border-t border-base-200 mt-2">
                <h3 className="text-sm font-semibold px-4 py-2 text-base-content/70 uppercase">
                  Ticket ({pedidos.length} artículo{pedidos.length !== 1 ? 's' : ''}{getCancelledCount(pedidos) > 0 ? `, ${getCancelledCount(pedidos)} cancelado${getCancelledCount(pedidos) !== 1 ? 's' : ''}` : ''})
                </h3>
                <TicketPreview pedidos={pedidos} onRemove={handleRemoveItem} onUpdateQty={handleUpdateQty} onCancel={handleCancelItem} mesaId={mesaId} />
              </div>
            )}

            {mesaTakeaways.length > 0 && (
              <div className="border-t border-base-200 mt-2">
                <h3 className="text-sm font-semibold px-4 py-2 text-base-content/70 uppercase">
                  Para llevar vinculados ({mesaTakeaways.length})
                </h3>
                <div className="px-4 pb-3 space-y-3">
                  {mesaTakeaways.map((order) => (
                    <div key={order.id} className="rounded-lg border border-base-300 p-3 bg-base-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">📦 {order.customerName}</p>
                          <p className="text-xs text-base-content/60">
                            {order.pedidos?.length || 0} artículo{(order.pedidos?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary">{formatPrice(order.total || 0)}</span>
                      </div>
                      {order.pedidos && order.pedidos.length > 0 && (
                        <ul className="text-xs mt-2 text-base-content/70 space-y-1">
                          {order.pedidos.map((item) => (
                            <li key={item.id}>
                              {item.cantidad} × {item.nombre}
                              {item.nota ? ` (${item.nota})` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {mesa.estado === 'ocupada' && (
            <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-3 flex gap-2">
              <button
                type="button"
                className="btn btn-error btn-outline flex-1 min-h-[44px]"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCancelOrder(true)
                }}
              >
                ✕ Cancelar Pedido
              </button>
              {pedidos.length > 0 && (
                <button
                  className="btn btn-primary flex-1 min-h-[44px]"
                  onClick={() => setShowCloseConfirm(true)}
                >
                  🧾 Cobrar
                </button>
              )}
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

      {/* Menu selection modal */}
      {showMenuSelection && menuDelDia && (
        <MenuSelectionModal
          menuDelDia={menuDelDia}
          productos={productos}
          onConfirm={handleMenuConfirm}
          onCancel={() => setShowMenuSelection(false)}
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

      {/* Cancel order confirmation */}
      {showCancelOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCancelOrder(false)}>
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">⚠️ Cancelar Pedido</h3>
            <p className="text-sm text-base-content/70 mb-4">
              ¿Estás seguro de cancelar el pedido de la <strong>Mesa #{mesa.numero}</strong>?
            </p>
            <p className="text-xs text-error mb-4">
              Esta acción no guardará la venta en el reporte del día.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost flex-1 min-h-[44px]"
                onClick={() => setShowCancelOrder(false)}
              >
                Volver
              </button>
              <button
                className="btn btn-error flex-1 min-h-[44px]"
                onClick={handleCancelOrder}
              >
                Cancelar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
