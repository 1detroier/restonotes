import { useState, useCallback } from 'react'
import { EMOJI_GRID } from '../utils/constants'

const defaultValues = {
  nombre: '',
  precio: '',
  categoria: '',
  emoji: '',
  hasVariants: false,
  variantGroups: []
}

function validate(values) {
  const errors = {}

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
  } else if (values.nombre.trim().length > 30) {
    errors.nombre = 'Máximo 30 caracteres'
  }

  const precio = parseFloat(values.precio)
  if (!values.precio || isNaN(precio) || precio <= 0) {
    errors.precio = 'El precio debe ser mayor a 0'
  }

  if (!values.categoria) {
    errors.categoria = 'Selecciona una categoría'
  }

  if (!values.emoji) {
    errors.emoji = 'Selecciona un emoji'
  }

  if (values.hasVariants) {
    if (!Array.isArray(values.variantGroups) || values.variantGroups.length === 0) {
      errors.variantGroups = 'Añade al menos un grupo'
    } else {
      values.variantGroups.forEach((group, index) => {
        if (!group || !group.name || group.name.trim().length < 2) {
          errors.variantGroups = 'Completa el nombre de cada grupo'
        }
        if (!Array.isArray(group.options) || group.options.length === 0) {
          errors.variantGroups = 'Cada grupo debe tener opciones'
        }
      })
    }
  }

  return errors
}

export function useProductoForm(initialValues) {
  const [values, setValues] = useState({
    ...defaultValues,
    ...initialValues
  })
  const [errors, setErrors] = useState({})

  const setField = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const reset = useCallback((newValues) => {
    setValues(newValues ? { ...defaultValues, ...newValues } : { ...defaultValues })
    setErrors({})
  }, [])

  const validateAll = useCallback(() => {
    const errs = validate(values)
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [values])

  return {
    values,
    errors,
    isValid: Object.keys(validate(values)).length === 0 && values.nombre !== '',
    setField,
    reset,
    validate: validateAll,
    emojis: EMOJI_GRID
  }
}
