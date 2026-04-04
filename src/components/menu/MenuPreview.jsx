import { CATEGORIA_LABELS } from '../../utils/constants'

export default function MenuPreview({ menu, productos }) {
  if (!menu) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <p className="text-base-content/50 text-center">
            No hay menú configurado
          </p>
        </div>
      </div>
    )
  }

  const getProductosByIds = (ids) => {
    return (ids || []).map((id) => productos.find((p) => p.id === id)).filter(Boolean)
  }

  const primeros = getProductosByIds(menu.primeroIds)
  const segundos = getProductosByIds(menu.segundoIds)
  const postres = getProductosByIds(menu.postreIds)

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <h3 className="card-title text-base">
          Vista Previa del Menú
          {menu.activo && (
            <span className="badge badge-success badge-sm">Activo</span>
          )}
        </h3>

        <div className="space-y-3 mt-2">
          {primeros.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-base-content/70">
                {CATEGORIA_LABELS.primero}
              </h4>
              <ul className="text-sm space-y-1">
                {primeros.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span>{p.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {segundos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-base-content/70">
                {CATEGORIA_LABELS.segundo}
              </h4>
              <ul className="text-sm space-y-1">
                {segundos.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span>{p.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {postres.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-base-content/70">
                {CATEGORIA_LABELS.postre}
              </h4>
              <ul className="text-sm space-y-1">
                {postres.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span>{p.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center">
          <span className="font-semibold">Precio del menú</span>
          <span className="text-xl font-bold text-primary">
            ${parseFloat(menu.precio).toFixed(2)}
          </span>
        </div>

        {menu.incluyeBebida && (
          <div className="alert alert-info text-sm py-2 min-h-[44px]">
            <span>🍷 Incluye bebida</span>
          </div>
        )}
      </div>
    </div>
  )
}
