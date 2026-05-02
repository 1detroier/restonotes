import { useState, useCallback, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useUIStore } from '../store/useUIStore'
import ProductoCard from '../components/carta/ProductoCard'
import ProductoForm from '../components/carta/ProductoForm'
import FilterChips from '../components/carta/FilterChips'
import SearchBar from '../components/carta/SearchBar'
import ImportExportButtons from '../components/carta/ImportExportButtons'
import ConfigPage from '../pages/ConfigPage'
import { CATEGORIA_LABELS } from '../utils/constants'
import { Settings } from 'lucide-react'

export default function CartaPage() {
  const { productos, categorias, addProducto, updateProducto, toggleProducto, deleteProducto } = useAppStore()
  const { addToast, openModal, closeModal, modals } = useUIStore()
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleOpenConfig = () => {
    openModal({
      title: 'Configuración',
      content: <ConfigPage onClose={closeModal} />
    })
  }

  // Get category keys from stored categorias or fall back to defaults
  const categoryKeys = useMemo(() => {
    if (categorias && categorias.length > 0) {
      return categorias.map((c) => c.key)
    }
    return []
  }, [categorias])

  // Group products by category with alphabetical sorting within each group
  const groupedProductos = useMemo(() => {
    const activeProductos = productos.filter((p) => p.activo)
    const groups = {}

    // Initialize groups from stored categories or default categories
    const cats = categoryKeys.length > 0 ? categoryKeys : Object.keys(CATEGORIA_LABELS).filter(
      (k) => ['con_arroz', 'sin_arroz', 'pescado', 'sopas', 'entrantes', 'arroz_frijoles', 'bolon', 'postres', 'bebidas'].includes(k)
    )
    
    cats.forEach((cat) => {
      groups[cat] = []
    })

    // Filter by search query first
    let filtered = activeProductos
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = activeProductos.filter((p) => p.nombre.toLowerCase().includes(q))
    }

    // Group and sort products
    filtered.forEach((p) => {
      if (groups[p.categoria]) {
        groups[p.categoria].push(p)
      }
    })

    // Sort products alphabetically within each group
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    })

    return groups
  }, [productos, categoryKeys, searchQuery])

  // Get categories that have products (or all categories if no filter)
  const visibleCategories = useMemo(() => {
    const defaultCats = ['con_arroz', 'sin_arroz', 'pescado', 'sopas', 'entrantes', 'arroz_frijoles', 'bolon', 'postres', 'bebidas']
    const cats = categoryKeys.length > 0 ? categoryKeys : defaultCats
    // Filter to only show categories with products (or all if no search)
    return cats.filter((cat) => {
      const products = groupedProductos[cat] || []
      return !searchQuery.trim() || products.length > 0
    })
  }, [categoryKeys, searchQuery, groupedProductos])

  const handleSave = async (producto, data) => {
    try {
      if (producto) {
        await updateProducto(producto.id, data)
        addToast('Producto actualizado', 'success')
      } else {
        await addProducto(data)
        addToast('Producto creado', 'success')
      }
      closeModal()
    } catch (error) {
      addToast('Error al guardar el producto', 'error')
    }
  }

  const handleEdit = (producto) => {
    openModal({
      title: 'Editar Producto',
      content: (
        <ProductoForm
          producto={producto}
          onSave={(data) => handleSave(producto, data)}
          onCancel={closeModal}
        />
      )
    })
  }

  const handleNew = () => {
    openModal({
      title: 'Nuevo Producto',
      content: (
        <ProductoForm
          onSave={(data) => handleSave(null, data)}
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

  // Filter productos (for backwards compatibility when using FilterChips)
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

  // Check if we're in grouped mode (no active category filter)
  const isGroupedMode = !activeCategory

  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">La Carta</h2>
        <div className="flex gap-2">
          <button
            onClick={handleOpenConfig}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Configuración"
          >
            <Settings size={20} />
          </button>
          <ImportExportButtons onImport={handleImport} />
        </div>
      </div>

      <SearchBar onSearch={setSearchQuery} />
      <FilterChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Product list - grouped by category or flat */}
      <div className="space-y-2">
        {isGroupedMode ? (
          // Grouped view with section headers
          visibleCategories.map((cat) => {
            const products = groupedProductos[cat] || []
            if (products.length === 0) return null
            
            return (
              <div key={cat}>
                <h3 className="text-lg font-semibold text-base-content/70 px-2 py-1 sticky top-0 bg-base-200 -mx-4 px-4 pt-2">
                  {CATEGORIA_LABELS[cat] || cat}
                </h3>
                <div className="space-y-2 mt-2">
                  {products.map((p) => (
                    <ProductoCard
                      key={p.id}
                      producto={p}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          // Flat view (when category filter is active)
          filteredProductos.length === 0 ? (
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
          )
        )}
        
        {/* Show empty state when in grouped mode but no products */}
        {isGroupedMode && visibleCategories.every((cat) => !groupedProductos[cat]?.length) && (
          <div className="text-center py-8 text-base-content/50">
            <p className="text-lg">No hay productos</p>
            <p className="text-sm">Toca + para agregar uno nuevo</p>
          </div>
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
