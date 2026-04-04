import { useState, useCallback, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useUIStore } from '../store/useUIStore'
import ProductoCard from '../components/carta/ProductoCard'
import ProductoForm from '../components/carta/ProductoForm'
import FilterChips from '../components/carta/FilterChips'
import SearchBar from '../components/carta/SearchBar'
import ImportExportButtons from '../components/carta/ImportExportButtons'

export default function CartaPage() {
  const { productos, addProducto, updateProducto, toggleProducto, deleteProducto } = useAppStore()
  const { addToast, openModal, closeModal, modals } = useUIStore()
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProducto, setEditingProducto] = useState(null)

  // Filter productos
  const filteredProductos = useMemo(() => {
    let result = productos.filter((p) => p.activo)

    if (activeCategory) {
      result = result.filter((p) => p.categoria === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.nombre.toLowerCase().includes(q))
    }

    return result
  }, [productos, activeCategory, searchQuery])

  const handleSave = async (data) => {
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, data)
        addToast('Producto actualizado', 'success')
      } else {
        await addProducto(data)
        addToast('Producto creado', 'success')
      }
      closeModal()
      setEditingProducto(null)
    } catch (error) {
      addToast('Error al guardar el producto', 'error')
    }
  }

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    openModal({
      title: 'Editar Producto',
      content: (
        <ProductoForm
          producto={producto}
          onSave={handleSave}
          onCancel={closeModal}
        />
      )
    })
  }

  const handleNew = () => {
    setEditingProducto(null)
    openModal({
      title: 'Nuevo Producto',
      content: (
        <ProductoForm
          onSave={handleSave}
          onCancel={closeModal}
        />
      )
    })
  }

  const handleToggle = async (id) => {
    try {
      await toggleProducto(id)
    } catch (error) {
      addToast('Error al cambiar estado', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProducto(id)
      addToast('Producto eliminado', 'success')
    } catch (error) {
      addToast('Error al eliminar producto', 'error')
    }
  }

  const handleImport = useCallback(
    (count, errorMsg) => {
      if (errorMsg) {
        addToast(`Importación fallida: ${errorMsg}`, 'error')
      } else {
        addToast(`${count} productos importados`, 'success')
      }
    },
    [addToast]
  )

  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">La Carta</h2>
        <ImportExportButtons onImport={handleImport} />
      </div>

      <SearchBar onSearch={setSearchQuery} />
      <FilterChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Product list */}
      <div className="space-y-2">
        {filteredProductos.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <p className="text-lg">No hay productos</p>
            <p className="text-sm">Toca + para agregar uno nuevo</p>
          </div>
        ) : (
          filteredProductos.map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleNew}
        className="btn btn-primary btn-circle fixed bottom-24 right-4 shadow-lg z-40 min-h-[56px] min-w-[56px] text-2xl"
        aria-label="Nuevo producto"
      >
        +
      </button>
    </div>
  )
}
