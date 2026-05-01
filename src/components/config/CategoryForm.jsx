import { useState, useEffect } from 'react'

export default function CategoryForm({ categoria, onSave, onCancel }) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [orden, setOrden] = useState(0)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (categoria) {
      setKey(categoria.key)
      setLabel(categoria.label)
      setOrden(categoria.orden || 0)
    }
  }, [categoria])

  const validate = () => {
    const newErrors = {}
    if (!key.trim()) {
      newErrors.key = 'La clave es requerida'
    } else if (!/^[a-z_]+$/.test(key)) {
      newErrors.key = 'Solo letras minúsculas y guiones bajos'
    }
    if (!label.trim()) {
      newErrors.label = 'La etiqueta es requerida'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      key: key.trim().toLowerCase(),
      label: label.trim(),
      tipo: 'carta',
      orden: parseInt(orden, 10) || 0
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Clave (key)</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g., sin_arroz"
          className={`input input-bordered w-full ${errors.key ? 'input-error' : ''}`}
          disabled={!!categoria} // Don't allow changing key on edit
        />
        {errors.key && (
          <p className="text-error text-sm mt-1">{errors.key}</p>
        )}
        <p className="text-xs text-base-content/50 mt-1">
          Identificador único (solo minúsculas y guiones)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Etiqueta (Label)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Sin Arroz"
          className={`input input-bordered w-full ${errors.label ? 'input-error' : ''}`}
        />
        {errors.label && (
          <p className="text-error text-sm mt-1">{errors.label}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Orden</label>
        <input
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          min="0"
          className="input input-bordered w-full"
        />
        <p className="text-xs text-base-content/50 mt-1">
          Orden de aparición en la carta
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost flex-1">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary flex-1">
          {categoria ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}