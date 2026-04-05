import { useLongPress } from '../../hooks/useLongPress'
import { useMesaTimer } from '../../hooks/useMesaTimer'
import { formatPrice, formatMinutes } from '../../utils/formatters'

const STATE_STYLES = {
  libre: 'bg-green-100 border-green-500 text-green-800',
  ocupada: 'bg-red-100 border-red-500 text-red-800',
  cuenta: 'bg-gray-200 border-gray-500 text-gray-600'
}

/**
 * Single table card with state colors, timer, and tap/long-press handlers.
 * @param {Object} props
 * @param {Object} props.mesa - Mesa object from store
 * @param {Function} props.onTap - Tap handler
 * @param {Function} props.onLongPress - Long press handler
 */
export default function MesaCard({ mesa, onTap, onLongPress, takeawayTotal = 0, takeawayCount = 0 }) {
  const { minutes, colorState } = useMesaTimer(mesa.openedAt)
  const openedAtLabel = mesa.openedAt
    ? new Date(mesa.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
  const combinedTotal = (mesa.total || 0) + (takeawayTotal || 0)

  const longPressHandlers = useLongPress(() => {
    onLongPress?.(mesa)
  })

  // Destructure isLongPress out so it doesn't leak to DOM
  const { isLongPress, ...domHandlers } = longPressHandlers

  const handleClick = (e) => {
    // Only handle actual clicks, not long presses
    if (!isLongPress) {
      onTap?.(mesa)
    }
  }

  const stateStyle = STATE_STYLES[mesa.estado] || STATE_STYLES.libre

  return (
    <div
      className={`relative border-2 rounded-xl p-3 min-h-[100px] flex flex-col items-center justify-center cursor-pointer select-none transition-all active:scale-95 touch-manipulation ${stateStyle}`}
      onClick={handleClick}
      {...domHandlers}
      role="button"
      tabIndex={0}
      aria-label={`Mesa ${mesa.numero} - ${mesa.estado}`}
    >
      {/* Mesa number */}
      <span className="text-2xl font-bold">#{mesa.numero}</span>

      {/* Estado label */}
      <span className="text-xs uppercase tracking-wide mt-1">{mesa.estado}</span>

      {/* Timer and total for occupied mesas */}
      {mesa.estado === 'ocupada' && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <span
            className={`text-sm font-semibold ${
              colorState === 'red' ? 'text-red-600' : 'text-orange-500'
            }`}
          >
            {formatMinutes(minutes)}
          </span>
          <span className="text-xs font-medium">{formatPrice(combinedTotal)}</span>
          {takeawayCount > 0 && (
            <span className="badge badge-outline badge-xs">📦 {takeawayCount}</span>
          )}
          {openedAtLabel && (
            <span className="text-[11px] uppercase tracking-wide text-base-content/60">
              Tomado {openedAtLabel}
            </span>
          )}
        </div>
      )}

      {/* Receipt icon for cuenta state */}
      {mesa.estado === 'cuenta' && (
        <span className="text-xl mt-1">🧾</span>
      )}
    </div>
  )
}
