import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'

/**
 * Modal for creating a new takeaway order.
 * Prompts for customer name with validation.
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (customerName) => void
 * @param {Function} props.onCancel - Cancel handler
 */
export default function TakeawayForm({ onSubmit, onCancel }) {
  const { createTakeaway } = useAppStore()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const isValid = name.trim().length >= 2 && name.trim().length <= 50

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    const trimmedName = name.trim()
    try {
      await createTakeaway(trimmedName)
      onSubmit(trimmedName)
    } catch (err) {
      console.error('Failed to create takeaway:', err)
      setError('Error al crear el pedido')
    }
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    if (error) setError('')
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo pedido para llevar"
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-4 w-full max-w-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4 text-center">
          📦 Nuevo Pedido Para Llevar
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="customerName" className="label">
              <span className="label-text font-medium">Nombre del cliente</span>
            </label>
            <input
              ref={inputRef}
              id="customerName"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Juan Pérez"
              maxLength={50}
              className={`input input-bordered w-full min-h-[44px] ${
                error ? 'input-error' : ''
              }`}
              aria-required="true"
              aria-invalid={!isValid && name.length > 0}
            />
            {error && (
              <p className="text-error text-xs mt-1">{error}</p>
            )}
            {name.length > 0 && name.trim().length < 2 && (
              <p className="text-base-content/50 text-xs mt-1">
                Mínimo 2 caracteres
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1 min-h-[44px]"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 min-h-[44px]"
              disabled={!isValid}
            >
              Crear Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
