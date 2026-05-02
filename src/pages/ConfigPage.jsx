import { useUIStore } from '../store/useUIStore'
import { TABS } from '../utils/constants'
import MesaCountSelector from '../components/config/MesaCountSelector'
import CategoryList from '../components/config/CategoryList'

export default function ConfigPage() {
  const { setActiveTab } = useUIStore()

  const handleClose = () => {
    // Go back to Carta page
    setActiveTab(TABS.CARTA)
  }

  return (
    <div className="p-4 pb-20 space-y-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <button 
          onClick={handleClose} 
          className="btn btn-ghost btn-circle"
          aria-label="Cerrar y volver a Carta"
        >
          ✕
        </button>
      </div>

      <MesaCountSelector />
      <CategoryList />
    </div>
  )
}