import CocinaItem from './CocinaItem'

/**
 * Kitchen queue list — groups pending items by mesa.
 * @param {Object} props
 * @param {Array} props.items - Array of CocinaItem objects
 */
export default function CocinaQueue({ items, onCompleteMesa }) {
  if (!items || items.length === 0) return null

  // Group items by mesaId
  const groupedByMesa = items.reduce((groups, item) => {
    const mesaId = item.mesaId
    if (!groups[mesaId]) groups[mesaId] = []
    groups[mesaId].push(item)
    return groups
  }, {})

  // Sort mesa sections by earliest item timestamp
  const mesaIds = Object.keys(groupedByMesa).sort((a, b) => {
    const aMin = groupedByMesa[a].map((i) => i.timestamp).sort()[0]
    const bMin = groupedByMesa[b].map((i) => i.timestamp).sort()[0]
    return aMin.localeCompare(bMin)
  })

  return (
    <div className="space-y-4">
      {mesaIds.map((mesaId) => {
        const mesaItems = groupedByMesa[mesaId].sort(
          (a, b) => a.timestamp.localeCompare(b.timestamp)
        )
        return (
          <div key={mesaId} className="bg-base-200 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wide">
                Mesa #{mesaId}
              </h3>
              {onCompleteMesa && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => onCompleteMesa(Number(mesaId))}
                >
                  Completar nota
                </button>
              )}
            </div>
            <div className="space-y-2">
              {mesaItems.map((item) => (
                <CocinaItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
