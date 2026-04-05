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
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [selectedMesaId, setSelectedMesaId] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const inputRef = useRef(null)
  const { mesas } = useAppStore()
  const mesasOcupadas = (mesas || []).filter((m) => m.estado === 'ocupada')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const isValid = name.trim().length >= 2 && name.trim().length <= 50

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return

    const trimmedName = name.trim()
    onSubmit({
      customerName: trimmedName,
      mesaId: selectedMesaId ? Number(selectedMesaId) : null,
      pickupAt: pickupTime ? buildPickupISO(pickupTime) : null
    })
  }

  const buildPickupISO = (timeValue) => {
    const today = new Date()
    const [hours, minutes] = timeValue.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    const pickupDate = new Date(today)
    pickupDate.setHours(hours, minutes, 0, 0)
    return pickupDate.toISOString()
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

          <div className="mb-4">
            <label htmlFor="mesaRelacionada" className="label">
              <span className="label-text font-medium">Asociar a mesa (opcional)</span>
            </label>
            <select
              id="mesaRelacionada"
              className="select select-bordered w-full min-h-[44px]"
              value={selectedMesaId}
              onChange={(e) => setSelectedMesaId(e.target.value)}
            >
              <option value="">Sin asociar</option>
              {mesasOcupadas.map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa #{mesa.numero}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="pickupTime" className="label">
              <span className="label-text font-medium">Hora de recogida (opcional)</span>
            </label>
            <input
              id="pickupTime"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="input input-bordered w-full min-h-[44px]"
            />
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
