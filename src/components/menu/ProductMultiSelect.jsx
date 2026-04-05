import { CATEGORIA_LABELS } from '../../utils/constants'

/**
 * Which carta categories are relevant for each menu slot.
 * Prevents showing postres when selecting primeros, etc.
 */
const SLOT_CATEGORIES = {
  primeroIds: ['entrantes', 'sopas', 'con_arroz', 'arroz_frijoles', 'bolon'],
  segundoIds: ['sin_arroz', 'pescado', 'con_arroz', 'arroz_frijoles', 'bolon'],
  postreIds: ['postres'],
  bebidaIds: ['bebidas']
}

/**
 * Product multi-select for menu configuration.
 * Each slot shows ONLY relevant carta categories.
 * User selects which products go into primero, segundo, postre, and bebida slots.
 */
export default function ProductMultiSelect({
  productos,
  values,
  errors,
  onToggle
}) {
  // Menu slots with their relevant categories
  const menuSlots = [
    { key: 'primeroIds', label: 'Primeros' },
    { key: 'segundoIds', label: 'Segundos' },
    { key: 'postreIds', label: 'Postres' },
    { key: 'bebidaIds', label: 'Bebidas' }
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">Asignar Platos al Menú</h3>
      <p className="text-xs text-base-content/60">
        Selecciona los platos de la carta para cada tipo de menú
      </p>

      {menuSlots.map((slot) => {
        const relevantCats = SLOT_CATEGORIES[slot.key]
        const catError = errors[slot.key]

        // Get products that belong to relevant categories for this slot
        const relevantProducts = productos.filter(
          (p) => p.activo && relevantCats.includes(p.categoria)
        )

        if (relevantProducts.length === 0) {
          return (
            <div key={slot.key} className="card bg-base-200">
              <div className="card-body p-3">
                <h4 className="text-sm font-bold text-base-content/80">
                  {slot.label} (0)
                </h4>
                <p className="text-xs text-base-content/40">
                  No hay productos de carta en las categorías relevantes
                </p>
                {catError && (
                  <p className="text-error text-xs mt-1">{catError}</p>
                )}
              </div>
            </div>
          )
        }

        // Group by their carta category
        const grouped = {}
        relevantProducts.forEach((p) => {
          if (!grouped[p.categoria]) grouped[p.categoria] = []
          grouped[p.categoria].push(p)
        })

        return (
          <div key={slot.key} className="card bg-base-200">
            <div className="card-body p-3">
              <h4 className="text-sm font-bold text-base-content/80">
                {slot.label} ({values[slot.key]?.length || 0})
              </h4>

              {/* Show products grouped by their carta category */}
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="mt-2">
                  <h5 className="text-xs font-semibold text-base-content/50 uppercase mb-1">
                    {CATEGORIA_LABELS[cat] || cat}
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
              ))}

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
