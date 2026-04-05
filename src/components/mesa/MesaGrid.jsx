import MesaCard from './MesaCard'

/**
 * Responsive grid of 14 table cards.
 * @param {Object} props
 * @param {Array} props.mesas - Array of Mesa objects
 * @param {Function} props.onTap - Tap handler (mesa) => void
 * @param {Function} props.onLongPress - Long press handler (mesa) => void
 */
export default function MesaGrid({ mesas, takeaways = [], onTap, onLongPress }) {
  if (!mesas || mesas.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-base-content/50">Cargando mesas...</p>
      </div>
    )
  }

  const takeawayMap = (takeaways || []).reduce((acc, order) => {
    if (order.status === 'pagado' || order.mesaId == null) return acc
    if (!acc[order.mesaId]) acc[order.mesaId] = { total: 0, count: 0 }
    acc[order.mesaId].total += order.total || 0
    acc[order.mesaId].count += 1
    return acc
  }, {})

  const sortedMesas = [...mesas].sort((a, b) => {
    const aOpen = a.openedAt ? new Date(a.openedAt).getTime() : Infinity
    const bOpen = b.openedAt ? new Date(b.openedAt).getTime() : Infinity
    if (a.estado === b.estado) {
      return aOpen - bOpen
    }
    if (a.estado === 'ocupada') return -1
    if (b.estado === 'ocupada') return 1
    if (a.estado === 'cuenta') return -1
    if (b.estado === 'cuenta') return 1
    return a.numero - b.numero
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
      {sortedMesas.map((mesa) => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          takeawayTotal={takeawayMap[mesa.id]?.total || 0}
          takeawayCount={takeawayMap[mesa.id]?.count || 0}
          onTap={onTap}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  )
}
