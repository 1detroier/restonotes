import { CATEGORIAS_CARTA, CATEGORIA_LABELS } from '../../utils/constants'

/**
 * Product multi-select for menu configuration.
 * Shows ALL carta products grouped by carta categories.
 * User selects which products go into primero, segundo, and postre slots.
 */
export default function ProductMultiSelect({
  productos,
  values,
  errors,
  onToggle
}) {
  // Group ALL active carta products by their carta category
  const grouped = {}
  CATEGORIAS_CARTA.forEach((cat) => {
    grouped[cat] = productos.filter(
      (p) => p.activo && p.categoria === cat
    )
  })

  // Menu slots: primero, segundo, postre
  const menuSlots = [
    { key: 'primeroIds', label: 'Primeros' },
    { key: 'segundoIds', label: 'Segundos' },
    { key: 'postreIds', label: 'Postres' }
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">Asignar Platos al Menú</h3>
      <p className="text-xs text-base-content/60">
        Selecciona los platos de la carta que formarán parte del menú del día
      </p>

      {menuSlots.map((slot) => {
        const catError = errors[slot.key]
        return (
          <div key={slot.key} className="card bg-base-200">
            <div className="card-body p-3">
              <h4 className="text-sm font-bold text-base-content/80">
                {slot.label} ({values[slot.key]?.length || 0})
              </h4>

              {/* Show products grouped by their carta category */}
              {CATEGORIAS_CARTA.map((cat) => {
                const items = grouped[cat]
                if (!items || items.length === 0) return null

                return (
                  <div key={cat} className="mt-2">
                    <h5 className="text-xs font-semibold text-base-content/50 uppercase mb-1">
                      {CATEGORIA_LABELS[cat]}
                    </h5>
                    {items.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-2 min-h-[44px] rounded cursor-pointer transition-colors ${
                          values[slot.key]?.includes(p.id)
                            ? 'bg-primary/10'
                            : 'hover:bg-base-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={values[slot.key]?.includes(p.id) || false}
                          onChange={() => onToggle(slot.key, p.id)}
                        />
                        <span className="text-lg">{p.emoji}</span>
                        <span className="flex-1 text-sm">{p.nombre}</span>
                        <span className="text-xs text-base-content/50">{p.precio.toFixed(2)}€</span>
                      </label>
                    ))}
                  </div>
                )
              })}

              {catError && (
                <p className="text-error text-xs mt-1">{catError}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
