import { useState, useEffect } from 'react'
import { useProductoForm } from '../../hooks/useProductoForm'
import { CATEGORIAS, CATEGORIA_LABELS } from '../../utils/constants'
import EmojiPicker from './EmojiPicker'

export default function ProductoForm({ producto, onSave, onCancel }) {
  const isEdit = !!producto
  const { values, errors, isValid, setField, reset, validate } = useProductoForm(
    isEdit
      ? {
          nombre: producto.nombre,
          precio: String(producto.precio),
          categoria: producto.categoria,
          emoji: producto.emoji
        }
      : undefined
  )

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (isEdit && producto) {
      reset({
        nombre: producto.nombre,
        precio: String(producto.precio),
        categoria: producto.categoria,
        emoji: producto.emoji
      })
    }
  }, [isEdit, producto, reset])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      nombre: values.nombre.trim(),
      precio: parseFloat(values.precio),
      categoria: values.categoria,
      emoji: values.emoji
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="label">
          <span className="label-text font-medium">Nombre</span>
        </label>
        <input
          type="text"
          value={values.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          maxLength={30}
          className={`input input-bordered w-full min-h-[44px] ${
            errors.nombre ? 'input-error' : ''
          }`}
          placeholder="Ej: Paella Valenciana"
        />
        {errors.nombre && (
          <p className="text-error text-xs mt-1">{errors.nombre}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label className="label">
          <span className="label-text font-medium">Precio (€)</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={values.precio}
          onChange={(e) => setField('precio', e.target.value)}
          className={`input input-bordered w-full min-h-[44px] ${
            errors.precio ? 'input-error' : ''
          }`}
          placeholder="0.00"
        />
        {errors.precio && (
          <p className="text-error text-xs mt-1">{errors.precio}</p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label className="label">
          <span className="label-text font-medium">Categoría</span>
        </label>
        <select
          value={values.categoria}
          onChange={(e) => setField('categoria', e.target.value)}
          className={`select select-bordered w-full min-h-[44px] ${
            errors.categoria ? 'select-error' : ''
          }`}
        >
          <option value="">Seleccionar...</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_LABELS[cat]}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="text-error text-xs mt-1">{errors.categoria}</p>
        )}
      </div>

      {/* Emoji */}
      <div>
        <label className="label">
          <span className="label-text font-medium">Emoji</span>
        </label>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`btn w-full min-h-[44px] text-2xl ${
            errors.emoji ? 'btn-error btn-outline' : 'btn-ghost'
          }`}
        >
          {values.emoji || 'Seleccionar emoji...'}
        </button>
        {errors.emoji && (
          <p className="text-error text-xs mt-1">{errors.emoji}</p>
        )}
        {showEmojiPicker && (
          <div className="mt-2 bg-base-200 rounded-lg">
            <EmojiPicker
              onSelect={(emoji) => {
                setField('emoji', emoji)
                setShowEmojiPicker(false)
              }}
              selected={values.emoji}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost flex-1 min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1 min-h-[44px]"
        >
          {isEdit ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
