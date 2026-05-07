import { useState, useEffect, useMemo } from 'react'
import { CATEGORIA_LABELS } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'

/**
 * Modal to edit an existing menu item's components.
 * Parses the nota string to pre-fill selections.
 * Format: "Primero | Segundo | Postre | Bebida"
 */
export default function EditMenuItemModal({ item, menuDelDia, productos, onConfirm, onCancel }) {
  const [selected, setSelected] = useState({
    primero: null,
    segundo: null,
    postre: null,
    bebida: null
  })

  // Get available products for each slot
  // Use menu configured products, but fallback to all products in category
  const primeroIds = menuDelDia?.primeroIds || []
  const segundoIds = menuDelDia?.segundoIds || []
  const postreIds = menuDelDia?.postreIds || []
  const bebidaIds = menuDelDia?.bebidaIds || []
  const incluyeBebida = menuDelDia?.incluyeBebida || false

  // Get products - use menu config, but if empty show all in common categories
  const primeros = useMemo(() => primeroIds.length > 0
    ? productos.filter(p => primeroIds.includes(p.id) && p.activo)
    : productos.filter(p => ['entrantes', 'sopas', 'sin_arroz'].includes(p.categoria) && p.activo)
  , [productos, primeroIds])
  
  const segundos = useMemo(() => segundoIds.length > 0
    ? productos.filter(p => segundoIds.includes(p.id) && p.activo)
    : productos.filter(p => ['con_arroz', 'pescado', 'arroz_frijoles', 'bolon'].includes(p.categoria) && p.activo)
  , [productos, segundoIds])
  
  const postres = useMemo(() => postreIds.length > 0
    ? productos.filter(p => postreIds.includes(p.id) && p.activo)
    : productos.filter(p => p.categoria === 'postres' && p.activo)
  , [productos, postreIds])
  
  const bebidas = useMemo(() => bebidaIds.length > 0
    ? productos.filter(p => bebidaIds.includes(p.id) && p.activo)
    : productos.filter(p => p.categoria === 'bebidas' && p.activo)
  , [productos, bebidaIds])

  // Parse nota string to pre-fill selections
  useEffect(() => {
    if (!item?.nota) return

    const parts = item.nota.split(' | ').filter(Boolean)
    const newSelected = { primero: null, segundo: null, postre: null, bebida: null }

    // Helper function to find product by name (case-insensitive partial match)
    const findProductByName = (name, productList) => {
      if (!name || !productList) return null
      const searchName = name.toLowerCase().trim()
      // Exact match first
      let match = productList.find(p => p.nombre.toLowerCase() === searchName)
      if (match) return match
      // Partial match as fallback
      match = productList.find(p => p.nombre.toLowerCase().includes(searchName))
      return match || null
    }

    // Count parts to determine if bebida is included
    const hasBebida = parts.length === 4 && incluyeBebida

    // Map parts to slots based on whether bebida is included
    if (parts.length >= 1) {
      newSelected.primero = findProductByName(parts[0], primeros)
    }
    if (parts.length >= 2) {
      newSelected.segundo = findProductByName(parts[1], segundos)
    }
    if (parts.length >= 3) {
      // If we have 3 parts and bebida is included, it's primero/segundo/postre
      // If we have 3 parts and bebida is NOT included, it's primero/segundo/postre (bebida not in nota)
      newSelected.postre = findProductByName(parts[2], postres)
    }
    if (parts.length >= 4 && hasBebida) {
      newSelected.bebida = findProductByName(parts[3], bebidas)
    }

    setSelected(newSelected)
  }, [item, primeros, segundos, postres, bebidas, incluyeBebida])

  const handleSelect = (slot, producto) => {
    setSelected(prev => ({
      ...prev,
      [slot]: prev[slot]?.id === producto.id ? null : producto
    }))
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-base-100 rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-200 px-4 py-3 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">✏️ Editar Menú</h3>
            <button
              className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]"
              onClick={onCancel}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Selection sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Primero */}
          <SelectionSection
            title="Primero"
            products={primeros}
            selected={selected.primero}
            onSelect={(p) => handleSelect('primero', p)}
          />

          {/* Segundo */}
          <SelectionSection
            title="Segundo"
            products={segundos}
            selected={selected.segundo}
            onSelect={(p) => handleSelect('segundo', p)}
          />

          {/* Postre - OPTIONAL */}
          <SelectionSection
            title="Postre (opcional)"
            products={postres}
            selected={selected.postre}
            onSelect={(p) => handleSelect('postre', p)}
            optional
          />

          {/* Bebida - only if menu includes it */}
          {incluyeBebida && (
            <SelectionSection
              title="Bebida (incluida)"
              products={bebidas}
              selected={selected.bebida}
              onSelect={(p) => handleSelect('bebida', p)}
              optional
            />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-base-content/60">
              {selected.primero ? '✓' : '○'} Primero · {selected.segundo ? '✓' : '○'} Segundo{selected.postre ? ' · ✓ Postre' : ' · ○ Postre'}{incluyeBebida ? (selected.bebida ? ' · ✓ Bebida' : ' · ○ Bebida') : ''}
            </span>
            <span className="text-lg font-bold text-primary">{formatPrice(item.precio)}</span>
          </div>
          <button
            className="btn btn-primary w-full min-h-[44px]"
            onClick={() => onConfirm(selected.primero, selected.segundo, selected.postre, selected.bebida)}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectionSection({ title, products, selected, onSelect, optional }) {
  if (!products || products.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-bold text-base-content/70 mb-2">{title}</h4>
        <p className="text-xs text-base-content/40">No hay opciones disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-bold text-base-content/70">{title}</h4>
        {optional && <span className="badge badge-sm badge-ghost">opcional</span>}
      </div>
      <div className="space-y-1">
        {products.map((p) => {
          const isSelected = selected?.id === p.id
          return (
            <button
              key={p.id}
              className={`w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-base-200 hover:bg-base-300 border-2 border-transparent'
              }`}
              onClick={() => onSelect(p)}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="flex-1 text-sm font-medium">{p.nombre}</span>
              {isSelected && <span className="text-primary text-sm font-bold">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}