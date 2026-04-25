import { useState } from 'react'

export default function VariantSelectionModal({ producto, initialQuantity = 1, onConfirm, onCancel }) {
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const selections = {}
    ;(producto.variantGroups || []).forEach((group) => {
      if (group.defaultOptionId) {
        selections[group.id] = group.defaultOptionId
      }
    })
    return selections
  })
  const [quantity, setQuantity] = useState(initialQuantity)
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')

  const handleSelect = (groupId, optionId) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }
    const variantGroups = producto.variantGroups || []
    for (const group of variantGroups) {
      if (group.required !== false && !selectedOptions[group.id]) {
        setError(`Seleccioná ${group.name}`)
        return
      }
    }
    const variantOptions = variantGroups.map((group) => {
      const optionId = selectedOptions[group.id]
      const option = group.options.find((opt) => opt.id === optionId)
      if (!option) return null
      return {
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionLabel: option.label
      }
    }).filter(Boolean)

    onConfirm?.({
      variantOptions,
      quantity,
      note: nota.trim()
    })
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-end justify-center">
      <form className="bg-base-100 rounded-t-2xl w-full max-w-md p-4 space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{producto.nombre}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
        </div>

        {(producto.variantGroups || []).map((group) => (
          <div key={group.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {group.name}
              {group.required !== false ? '' : ' (opcional)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`btn btn-xs ${selectedOptions[group.id] === option.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSelect(group.id, option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="label">
            <span className="label-text">Cantidad</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-circle btn-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <button
              type="button"
              className="btn btn-circle btn-sm"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Nota</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Sin azúcar, etc."
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button type="submit" className="btn btn-primary w-full">
          Añadir al pedido
        </button>
      </form>
    </div>
  )
}
