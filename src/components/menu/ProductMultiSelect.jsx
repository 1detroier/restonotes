import { CATEGORIAS, CATEGORIA_LABELS } from '../../utils/constants'

export default function ProductMultiSelect({
  productos,
  values,
  errors,
  onToggle
}) {
  // Group active products by category
  const grouped = {}
  CATEGORIAS.forEach((cat) => {
    grouped[cat] = productos.filter(
      (p) => p.activo && p.categoria === cat
    )
  })

  // Only show primero, segundo, postre categories for menu selection
  const menuCategories = ['primero', 'segundo', 'postre']

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-base">Seleccionar Productos</h3>
      {menuCategories.map((cat) => {
        const catKey = cat + 'Ids'
        const catError = errors[catKey]
        return (
          <div key={cat} className="space-y-1">
            <h4 className="text-sm font-medium text-base-content/70">
              {CATEGORIA_LABELS[cat]} ({values[catKey]?.length || 0})
            </h4>
            {grouped[cat].length === 0 ? (
              <p className="text-xs text-base-content/50 pl-2">
                No hay productos activos
              </p>
            ) : (
              grouped[cat].map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-2 min-h-[44px] rounded cursor-pointer transition-colors ${
                    values[catKey]?.includes(p.id)
                      ? 'bg-primary/10'
                      : 'hover:bg-base-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={values[catKey]?.includes(p.id) || false}
                    onChange={() => onToggle(catKey, p.id)}
                  />
                  <span className="text-lg">{p.emoji}</span>
                  <span className="flex-1 text-sm">{p.nombre}</span>
                </label>
              ))
            )}
            {catError && (
              <p className="text-error text-xs">{catError}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
