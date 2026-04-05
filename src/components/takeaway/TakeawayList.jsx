import TakeawayCard from './TakeawayCard'

/**
 * Grid of takeaway order cards.
 * @param {Object} props
 * @param {Array} props.orders - Array of PedidoLlevar objects
 */
export default function TakeawayList({ orders }) {
  if (!orders || orders.length === 0) return null

  const activeOrders = orders.filter((order) => order.status !== 'pagado')
  if (activeOrders.length === 0) return null

  const sorted = [...activeOrders].sort((a, b) => {
    const pickupA = a.pickupAt ? new Date(a.pickupAt).getTime() : Infinity
    const pickupB = b.pickupAt ? new Date(b.pickupAt).getTime() : Infinity
    if (pickupA !== pickupB) return pickupA - pickupB
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((order) => (
        <TakeawayCard key={order.id} order={order} />
      ))}
    </div>
  )
}
