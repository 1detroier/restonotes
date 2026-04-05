import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { TAKEAWAY_STATUS_COLORS } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import ProductQuickAdd from '../mesa/ProductQuickAdd'
import TicketPreview from '../mesa/TicketPreview'
import QuantityModal from '../mesa/QuantityModal'
import MenuSelectionModal from '../mesa/MenuSelectionModal'

/**
 * Single takeaway order card. Tap to open order detail and add items.
 */
export default function TakeawayCard({ order }) {
  const { productos, menuDelDia, mesas, updateTakeaway, payTakeaway, deleteTakeaway, addTakeawayItem, removeTakeawayItem, updateTakeawayItemQty } = useAppStore()
  const [showDetail, setShowDetail] = useState(false)
  const [qtyProduct, setQtyProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('carta')
  const [showMenuSelection, setShowMenuSelection] = useState(false)

  const statusLabels = {
    pendiente: 'Preparando',
    listo: 'Listo',
    entregado: 'Entregado',
    pagado: 'Pagado'
  }

  const badgeColor = TAKEAWAY_STATUS_COLORS[order.status] || 'ghost'
  const itemCount = order.pedidos ? order.pedidos.length : 0
  const isPagado = order.status === 'pagado'
  const mesaAsociada = order.mesaId ? mesas.find((m) => m.id === order.mesaId) : null
  const pickupLabel = order.pickupAt ? new Date(order.pickupAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
  const menuDisponible = Boolean(menuDelDia && menuDelDia.activo)

  const getRelativeTime = (createdAt) => {
    if (!createdAt) return ''
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `hace ${hours}h`
  }

  const handleAdvanceStatus = async () => {
    const flow = ['pendiente', 'listo', 'entregado', 'pagado']
    const currentIdx = flow.indexOf(order.status)
    if (currentIdx < 0 || currentIdx >= flow.length - 1) return
    const nextStatus = flow[currentIdx + 1]
    if (nextStatus === 'pagado') {
      await payTakeaway(order.id)
    } else {
      await updateTakeaway(order.id, { status: nextStatus })
    }
  }

  const handleAddItem = async (producto, cantidad = 1) => {
    await addTakeawayItem(order.id, producto, cantidad)
  }

  const handleRemoveItem = async (tempId) => {
    await removeTakeawayItem(order.id, tempId)
  }

  const handleUpdateQty = async (tempId, newQty) => {
    await updateTakeawayItemQty(order.id, tempId, newQty)
  }

  const handleQtyConfirm = async (producto, cantidad) => {
    setQtyProduct(null)
    await handleAddItem(producto, cantidad)
  }

  const handleMenuConfirm = async (primero, segundo, postre, bebida) => {
    if (!menuDelDia) return
    const menuPrice = menuDelDia.precio || 0
    const components = [primero?.nombre, segundo?.nombre, postre?.nombre, bebida?.nombre].filter(Boolean)
    const menuNota = components.join(' | ')

    await addTakeawayItem(
      order.id,
      {
        id: 'menu-dia',
        nombre: 'Menú Completo',
        precio: menuPrice,
        categoria: 'menu',
        emoji: '🍱'
      },
      1,
      'menu',
      menuNota
    )
    setShowMenuSelection(false)
  }

  const handleCancelOrder = async () => {
    if (window.confirm(`¿Cancelar el pedido de ${order.customerName}?`)) {
      await deleteTakeaway(order.id)
    }
  }

  // Filter products by tab
  const filteredProductos = productos.filter((p) => {
    if (!p.activo) return false
    if (activeTab === 'carta') return p.categoria !== 'bebidas'
    if (activeTab === 'bebidas') return p.categoria === 'bebidas'
    return true
  })

  const tabs = [
    { id: 'carta', label: 'Carta' },
    { id: 'bebidas', label: 'Bebidas' }
  ]
  if (menuDisponible) {
    tabs.push({ id: 'menu', label: 'Menú' })
  }

  return (
    <>
      <div
        className={`card bg-base-200 border border-base-300 min-h-[140px] transition-all cursor-pointer ${
          isPagado ? 'opacity-50' : 'hover:bg-base-300'
        }`}
        onClick={() => setShowDetail(true)}
      >
        <div className="card-body p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-bold text-base ${isPagado ? 'line-through' : ''}`}>
                {order.customerName}
              </h3>
              <p className="text-xs text-base-content/50">
                {getRelativeTime(order.createdAt)} · {itemCount} artículo{itemCount !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {pickupLabel && (
                  <span className="badge badge-outline badge-xs">Recoger {pickupLabel}</span>
                )}
                {mesaAsociada && (
                  <span className="badge badge-outline badge-xs">Mesa #{mesaAsociada.numero}</span>
                )}
              </div>
            </div>
            <span className={`badge badge-${badgeColor} badge-sm`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(order.total || 0)}
            </span>

            <div className="flex gap-1">
              {!isPagado && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline min-h-[44px] px-3"
                  onClick={(e) => { e.stopPropagation(); handleAdvanceStatus() }}
                >
                  {order.status === 'entregado' ? '💳 Cobrar' : 'Avanzar →'}
                </button>
              )}
              {!isPagado && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost btn-error min-h-[44px] px-3"
                  onClick={(e) => { e.stopPropagation(); handleCancelOrder() }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-xs btn-primary mt-3"
            onClick={(e) => { e.stopPropagation(); setShowDetail(true) }}
          >
            {isPagado ? 'Ver pedido' : 'Gestionar pedido'}
          </button>
        </div>
      </div>

      {/* Order detail drawer */}
      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowDetail(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl h-[90vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-base-100 z-10 border-b border-base-200 px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">📦 {order.customerName}</h2>
                  <span className="text-sm font-medium text-primary">{formatPrice(order.total || 0)}</span>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {pickupLabel && (
                      <span className="badge badge-outline badge-xs">Recoger {pickupLabel}</span>
                    )}
                    {mesaAsociada && (
                      <span className="badge badge-outline badge-xs">Mesa #{mesaAsociada.numero}</span>
                    )}
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]" onClick={() => setShowDetail(false)}>✕</button>
              </div>
              <div className="flex gap-1 mt-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                      activeTab === tab.id ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/70'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'menu' ? (
                <div className="p-4">
                  {menuDisponible ? (
                    <button
                      type="button"
                      className="w-full card bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-colors min-h-[100px]"
                      onClick={() => setShowMenuSelection(true)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🍱</span>
                          <div className="text-left flex-1">
                            <h3 className="font-bold text-lg">Menú del Día</h3>
                            <p className="text-sm text-base-content/60">
                              {menuDelDia?.primeroIds?.length || 0} primeros · {menuDelDia?.segundoIds?.length || 0} segundos · {menuDelDia?.postreIds?.length || 0} postres
                            </p>
                          </div>
                          <span className="text-xl font-bold text-primary">{formatPrice(menuDelDia?.precio || 0)}</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="text-center py-8 text-base-content/50">
                      <p className="text-lg">🍱</p>
                      <p className="text-sm mt-2">No hay menú configurado hoy</p>
                    </div>
                  )}
                </div>
              ) : (
                <ProductQuickAdd productos={filteredProductos} onAdd={handleAddItem} onLongPressProduct={setQtyProduct} />
              )}
              {order.pedidos && order.pedidos.length > 0 && (
                <div className="border-t border-base-200 mt-2">
                  <h3 className="text-sm font-semibold px-4 py-2 text-base-content/70 uppercase">
                    Ticket ({order.pedidos.length} artículo{order.pedidos.length !== 1 ? 's' : ''})
                  </h3>
                  <TicketPreview pedidos={order.pedidos} onRemove={handleRemoveItem} onUpdateQty={handleUpdateQty} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-3 flex gap-2">
              {!isPagado && (
                <button className="btn btn-error btn-outline flex-1 min-h-[44px]" onClick={handleCancelOrder}>
                  Cancelar Pedido
                </button>
              )}
              <button className="btn btn-outline flex-1 min-h-[44px]" onClick={() => setShowDetail(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity modal */}
      {qtyProduct && (
        <QuantityModal producto={qtyProduct} onConfirm={handleQtyConfirm} onCancel={() => setQtyProduct(null)} />
      )}

      {showMenuSelection && menuDelDia && (
        <MenuSelectionModal
          menuDelDia={menuDelDia}
          productos={productos}
          onConfirm={handleMenuConfirm}
          onCancel={() => setShowMenuSelection(false)}
        />
      )}
    </>
  )
}
