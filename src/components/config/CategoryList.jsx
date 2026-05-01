import { useAppStore } from '../../store/useAppStore'
import { useUIStore } from '../../store/useUIStore'
import { categoriaRepo } from '../../db/repositories/categorias'
import CategoryForm from './CategoryForm'

export default function CategoryList() {
  const { categorias, loadCategorias } = useAppStore()
  const { addToast, openModal, closeModal } = useUIStore()

  const handleEdit = (categoria) => {
    openModal({
      title: 'Editar Categoría',
      content: (
        <CategoryForm
          categoria={categoria}
          onSave={async (data) => {
            try {
              await categoriaRepo.update(categoria.id, data)
              await loadCategorias()
              addToast('Categoría actualizada', 'success')
              closeModal()
            } catch (error) {
              addToast('Error al actualizar categoría', 'error')
            }
          }}
          onCancel={closeModal}
        />
      )
    })
  }

  const handleDelete = async (categoria) => {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${categoria.label}"? Esta acción no se puede deshacer.`
    )
    
    if (confirmed) {
      try {
        await categoriaRepo.delete(categoria.id)
        await loadCategorias()
        addToast('Categoría eliminada', 'success')
      } catch (error) {
        addToast('Error al eliminar categoría', 'error')
      }
    }
  }

  const handleAdd = () => {
    openModal({
      title: 'Nueva Categoría',
      content: (
        <CategoryForm
          onSave={async (data) => {
            try {
              await categoriaRepo.create(data)
              await loadCategorias()
              addToast('Categoría creada', 'success')
              closeModal()
            } catch (error) {
              addToast('Error al crear categoría', 'error')
            }
          }}
          onCancel={closeModal}
        />
      )
    })
  }

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Categorías de la Carta</h3>
        <button onClick={handleAdd} className="btn btn-sm btn-primary">
          + Nueva
        </button>
      </div>

      {categorias && categorias.length > 0 ? (
        <div className="space-y-2">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
            >
              <div>
                <span className="font-medium">{cat.label}</span>
                <span className="text-xs text-base-content/50 ml-2">
                  ({cat.key})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="btn btn-sm btn-ghost"
                  aria-label="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="btn btn-sm btn-ghost"
                  aria-label="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base-content/50 text-center py-4">
          No hay categorías. Crea una para empezar.
        </p>
      )}
    </div>
  )
}