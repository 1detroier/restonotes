import { useState, useEffect } from 'react'
import { useProductoForm } from '../../hooks/useProductoForm'
import { CATEGORIAS_CARTA, CATEGORIA_LABELS } from '../../utils/constants'
import EmojiPicker from './EmojiPicker'
import { normalizeVariantGroups, createVariantOptionId } from '../../utils/variants'

const buildInitialVariants = (producto) => {
  if (!producto || !producto.variantGroups) return []
  return normalizeVariantGroups(producto.variantGroups)
}

export default function ProductoForm({ producto, onSave, onCancel }) {
  const isEdit = !!producto
  const { values, errors, isValid, setField, reset, validate } = useProductoForm(
    isEdit
      ? {
          nombre: producto.nombre,
          precio: String(producto.precio),
          categoria: producto.categoria,
          emoji: producto.emoji,
          hasVariants: !!producto.hasVariants,
          variantGroups: buildInitialVariants(producto)
        }
      : undefined
  )

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [variantInputs, setVariantInputs] = useState({})

  useEffect(() => {
    if (isEdit && producto) {
      reset({
        nombre: producto.nombre,
        precio: String(producto.precio),
        categoria: producto.categoria,
        emoji: producto.emoji,
        hasVariants: !!producto.hasVariants,
        variantGroups: buildInitialVariants(producto)
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
      emoji: values.emoji,
      hasVariants: values.hasVariants,
      variantGroups: values.hasVariants ? values.variantGroups : []
    })
  }

  const handleToggleVariants = (checked) => {
    setField('hasVariants', checked)
    if (!checked) {
      setField('variantGroups', [])
    }
  }

  const handleAddVariantGroup = () => {
    const next = [...(values.variantGroups || []), {
      id: createVariantOptionId(),
      name: '',
      required: true,
      options: []
    }]
    setField('variantGroups', next)
  }

  const handleUpdateGroup = (groupId, updates) => {
    const next = (values.variantGroups || []).map((group) =>
      group.id === groupId ? { ...group, ...updates } : group
    )
    setField('variantGroups', next)
  }

  const handleRemoveGroup = (groupId) => {
    const next = (values.variantGroups || []).filter((group) => group.id !== groupId)
    setField('variantGroups', next)
  }

  const handleAddOption = (groupId) => {
    const label = (variantInputs[groupId] || '').trim()
    if (!label) return
    const next = (values.variantGroups || []).map((group) => {
      if (group.id !== groupId) return group
      return {
        ...group,
        options: [...group.options, { id: createVariantOptionId(), label }]
      }
    })
    setField('variantGroups', next)
    setVariantInputs((prev) => ({ ...prev, [groupId]: '' }))
  }

  const handleRemoveOption = (groupId, optionId) => {
    const next = (values.variantGroups || []).map((group) => {
      if (group.id !== groupId) return group
      return {
        ...group,
        options: group.options.filter((opt) => opt.id !== optionId)
      }
    })
    setField('variantGroups', next)
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
          {CATEGORIAS_CARTA.map((cat) => (
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

      {/* Variants */}
      <div className="border border-base-200 rounded-lg p-4 space-y-3 bg-base-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Variantes</p>
            <p className="text-xs text-base-content/60">Configura sabores/tamaños desde acá.</p>
          </div>
          <label className="label cursor-pointer gap-2">
            <span className="label-text text-sm">Habilitar</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={values.hasVariants}
              onChange={(e) => handleToggleVariants(e.target.checked)}
            />
          </label>
        </div>

        {values.hasVariants && (
          <div className="space-y-3">
            {(values.variantGroups || []).map((group) => (
              <div key={group.id} className="border border-base-300 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleUpdateGroup(group.id, { name: e.target.value })}
                    placeholder="Nombre del grupo (ej: Sabor)"
                    className="input input-sm flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={group.required !== false}
                      onChange={(e) => handleUpdateGroup(group.id, { required: e.target.checked })}
                    />
                    Obligatorio
                  </label>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleRemoveGroup(group.id)}
                    aria-label="Eliminar grupo"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variantInputs[group.id] || ''}
                    onChange={(e) => setVariantInputs((prev) => ({ ...prev, [group.id]: e.target.value }))}
                    placeholder="Nueva opción (ej: Maracuyá)"
                    className="input input-sm flex-1"
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleAddOption(group.id)}
                  >
                    Añadir
                  </button>
                </div>
                {group.options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => (
                      <span key={option.id} className="badge badge-outline gap-2">
                        {option.label}
                        <button
                          type="button"
                          className="text-error"
                          onClick={() => handleRemoveOption(group.id, option.id)}
                          aria-label="Eliminar opción"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleAddVariantGroup}
            >
              + Grupo de variantes
            </button>

            {errors.variantGroups && (
              <p className="text-error text-xs">{errors.variantGroups}</p>
            )}
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
