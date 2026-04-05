import { formatPrice } from '../../utils/formatters'

/**
 * Sales summary component — shows totals and individual sales list.
 * @param {Object} props
 * @param {Array} props.ventas - Array of Venta objects
 * @param {string} props.fecha - Selected date (YYYY-MM-DD)
 * @param {Function} props.onDelete - Delete handler (ventaId) => void
 */
export default function VentasSummary({ ventas, fecha, onDelete }) {
  if (!ventas || ventas.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-base-content/50 text-lg">No hay ventas para esta fecha 📊</p>
      </div>
    )
  }

  const totalRevenue = ventas.reduce((sum, v) => sum + (v.total || 0), 0)
  const mesaServed = new Set(ventas.map((v) => v.mesaId)).size

  const paymentLabels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta'
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="card bg-primary/10 border border-primary/30">
        <div className="card-body p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-base-content/60">Ingreso total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{ventas.length}</p>
              <p className="text-xs text-base-content/60">
                {mesaServed} mesa{mesaServed !== 1 ? 's' : ''} servida{mesaServed !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Detalle de ventas
        </h3>
        {ventas
          .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))
          .map((venta, idx) => {
            const hora = venta.timestamp ? venta.timestamp.substring(11, 16) : '--:--'
            const mesaLabel = venta.mesaId != null ? `Mesa #${venta.mesaId}` : 'Para Llevar'
            return (
              <div
                key={venta.id || idx}
                className="flex justify-between items-center p-3 bg-base-200 rounded-lg min-h-[44px]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{hora}</span>
                    <span className="text-xs text-base-content/50">{mesaLabel}</span>
                  </div>
                  <p className="text-xs text-base-content/50">
                    {venta.paymentMethod ? paymentLabels[venta.paymentMethod] || venta.paymentMethod : ''}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary mr-2">
                  {formatPrice(venta.total || 0)}
                </span>
                {onDelete && (
                  <button
                    className="btn btn-xs btn-ghost btn-error min-h-[32px]"
                    onClick={() => onDelete(venta.id)}
                  >
                    Cancelar venta
                  </button>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
