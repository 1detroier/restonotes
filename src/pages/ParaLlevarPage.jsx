import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import TakeawayList from '../components/takeaway/TakeawayList'
import TakeawayForm from '../components/takeaway/TakeawayForm'

/**
 * Takeaway orders page — orchestrates loading and creation of pedidos para llevar.
 */
export default function ParaLlevarPage() {
  const { takeaways, loadTakeaways, createTakeaway, loadMesas } = useAppStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTakeaways()
    loadMesas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNewOrder = () => {
    setShowForm(true)
  }

  const handleCreateOrder = async ({ customerName, mesaId, pickupAt }) => {
    await createTakeaway(customerName, { mesaId, pickupAt })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Para Llevar</h1>
            <p className="text-xs text-base-content/60">
              {takeaways.length} pedido{takeaways.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm min-h-[44px]"
            onClick={handleNewOrder}
          >
            + Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {takeaways.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-base-content/50 text-lg">No hay pedidos para llevar 📦</p>
          </div>
        ) : (
          <TakeawayList orders={takeaways} />
        )}
      </div>

      {/* New order form modal */}
      {showForm && (
        <TakeawayForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
