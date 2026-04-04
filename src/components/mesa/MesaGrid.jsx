import MesaCard from './MesaCard'

/**
 * Responsive grid of 14 table cards.
 * @param {Object} props
 * @param {Array} props.mesas - Array of Mesa objects
 * @param {Function} props.onTap - Tap handler (mesa) => void
 * @param {Function} props.onLongPress - Long press handler (mesa) => void
 */
export default function MesaGrid({ mesas, onTap, onLongPress }) {
  if (!mesas || mesas.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-base-content/50">Cargando mesas...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
      {mesas.map((mesa) => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          onTap={onTap}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  )
}
