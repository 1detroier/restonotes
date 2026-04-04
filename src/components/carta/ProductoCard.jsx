import { CATEGORIA_LABELS } from '../../utils/constants'

export default function ProductoCard({ producto, onEdit, onDelete, onToggle }) {
  return (
    <div
      className={`card card-side bg-base-100 shadow-sm min-h-[44px] ${
        !producto.activo ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 p-3 flex-1">
        <span className="text-2xl" role="img" aria-label={producto.nombre}>
          {producto.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{producto.nombre}</h3>
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <span className="badge badge-sm badge-ghost">
              {CATEGORIA_LABELS[producto.categoria] || producto.categoria}
            </span>
            <span className="font-medium text-base-content">
              ${parseFloat(producto.precio).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 pr-2">
        <button
          onClick={() => onToggle(producto.id)}
          className={`btn btn-xs btn-ghost min-h-[44px] min-w-[44px] ${
            producto.activo ? 'text-success' : 'text-error'
          }`}
          aria-label={producto.activo ? 'Desactivar' : 'Activar'}
          title={producto.activo ? 'Desactivar' : 'Activar'}
        >
          {producto.activo ? '✓' : '✕'}
        </button>
        <button
          onClick={() => onEdit(producto)}
          className="btn btn-xs btn-ghost min-h-[44px] min-w-[44px]"
          aria-label="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(producto.id)}
          className="btn btn-xs btn-ghost text-error min-h-[44px] min-w-[44px]"
          aria-label="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
