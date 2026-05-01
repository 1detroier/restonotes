import MesaCountSelector from '../components/config/MesaCountSelector'
import CategoryList from '../components/config/CategoryList'

export default function ConfigPage() {
  return (
    <div className="p-4 pb-20 space-y-4">
      <h2 className="text-2xl font-bold">Configuración</h2>

      <MesaCountSelector />
      <CategoryList />
    </div>
  )
}