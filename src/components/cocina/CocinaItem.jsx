import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { COCINA_STATUS_COLORS } from '../../utils/constants'

/**
 * Individual kitchen item with status toggle.
 * Tap advances status: pendiente → en_curso → listo.
 * When status becomes 'listo', item auto-hides after 3 seconds.
 * @param {Object} props
 * @param {Object} props.item - CocinaItem object
 */
export default function CocinaItem({ item }) {
  const { advanceCocinaStatus } = useAppStore()
  const [isHiding, setIsHiding] = useState(false)

  const statusLabels = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    listo: 'Listo',
    cancelado: 'Cancelado'
  }

  const badgeColor = COCINA_STATUS_COLORS[item.status] || 'ghost'

  // Auto-hide when status becomes 'listo'
  useEffect(() => {
    if (item.status === 'listo') {
      const timer = setTimeout(() => {
        setIsHiding(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [item.status])

  const handleTap = () => {
    if (item.status === 'listo' || item.status === 'cancelado') return
    advanceCocinaStatus(item.id)
  }

  const handleDismiss = (e) => {
    e.stopPropagation()
    setIsHiding(true)
  }

  if (isHiding) return null

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-base-100 rounded-lg cursor-pointer transition-all duration-300 min-h-[44px] ${
        item.status === 'listo' ? 'opacity-60' : ''
      }`}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTap()
      }}
      aria-label={`${item.productoNombre} x${item.cantidad} — ${statusLabels[item.status]}`}
    >
      {/* Product emoji + name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.emoji || '🍽️'}</span>
          <span className="text-sm font-medium truncate">{item.productoNombre}</span>
          <span className="text-sm font-bold text-primary">{item.cantidad}×</span>
        </div>
        {item.variantLabel && (
          <p className="text-xs text-base-content/60 ml-7">{item.variantLabel}</p>
        )}
        {item.nota && (
          <p className="text-xs text-base-content/50 ml-7 italic">({item.nota})</p>
        )}
      </div>

      {/* Status badge */}
      <span className={`badge badge-${badgeColor} badge-sm min-h-[28px]`}>
        {statusLabels[item.status] || item.status}
      </span>

      {/* Manual dismiss button for 'listo' items */}
      {item.status === 'listo' && (
        <button
          className="btn btn-xs btn-ghost min-h-[32px] min-w-[32px] p-1"
          onClick={handleDismiss}
          aria-label="Descartar"
        >
          ✕
        </button>
      )}
    </div>
  )
}
