import { useState, useCallback } from 'react'

const defaultValues = {
  fecha: new Date().toISOString().split('T')[0],
  primeroIds: [],
  segundoIds: [],
  postreIds: [],
  bebidaIds: [],
  precio: '',
  incluyeBebida: false
}

function validate(values) {
  const errors = {}

  if (values.primeroIds.length < 1) {
    errors.primeroIds = 'Se requiere al menos 1 primero'
  }

  if (values.segundoIds.length < 1) {
    errors.segundoIds = 'Se requiere al menos 1 segundo'
  }

  const precio = parseFloat(values.precio)
  if (!values.precio || isNaN(precio) || precio <= 0) {
    errors.precio = 'El precio debe ser mayor a 0'
  }

  return errors
}

export function useMenuForm(initialValues) {
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

  const toggleProducto = useCallback((category, id) => {
    setValues((prev) => {
      const list = prev[category] || []
      const exists = list.includes(id)
      return {
        ...prev,
        [category]: exists ? list.filter((x) => x !== id) : [...list, id]
      }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setValues({ ...defaultValues })
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
    isValid: Object.keys(validate(values)).length === 0,
    setField,
    toggleProducto,
    reset,
    validate: validateAll
  }
}
