import MesaCountSelector from '../components/config/MesaCountSelector'
import CategoryList from '../components/config/CategoryList'

export default function ConfigPage({ onClose }) {
  return (
    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Configuración</h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            ✕
          </button>
        )}
      </div>

      <MesaCountSelector />
      <CategoryList />
    </div>
  )
}