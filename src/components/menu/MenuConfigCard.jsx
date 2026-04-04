export default function MenuConfigCard({
  fecha,
  precio,
  incluyeBebida,
  onFechaChange,
  onPrecioChange,
  onToggleBebida,
  onSave,
  canSave,
  error
}) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4 space-y-3">
        <h3 className="card-title text-base">Configuración del Menú</h3>

        {/* Date */}
        <div>
          <label className="label py-1">
            <span className="label-text font-medium">Fecha</span>
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            className="input input-bordered w-full min-h-[44px]"
          />
        </div>

        {/* Price */}
        <div>
          <label className="label py-1">
            <span className="label-text font-medium">Precio (€)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => onPrecioChange(e.target.value)}
            className={`input input-bordered w-full min-h-[44px] ${
              error?.precio ? 'input-error' : ''
            }`}
            placeholder="0.00"
          />
          {error?.precio && (
            <p className="text-error text-xs mt-1">{error.precio}</p>
          )}
        </div>

        {/* Incluye bebida toggle */}
        <div className="flex items-center justify-between min-h-[44px]">
          <span className="label-text font-medium">Incluye bebida</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={incluyeBebida}
            onChange={(e) => onToggleBebida(e.target.checked)}
          />
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!canSave}
          className="btn btn-primary w-full min-h-[44px]"
        >
          Activar Menú
        </button>
      </div>
    </div>
  )
}
