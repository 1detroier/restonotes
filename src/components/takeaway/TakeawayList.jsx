import TakeawayCard from './TakeawayCard'

/**
 * Grid of takeaway order cards.
 * @param {Object} props
 * @param {Array} props.orders - Array of PedidoLlevar objects
 */
export default function TakeawayList({ orders }) {
  if (!orders || orders.length === 0) return null

  // Sort by createdAt descending (newest first)
  const sorted = [...orders].sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((order) => (
        <TakeawayCard key={order.id} order={order} />
      ))}
    </div>
  )
}
