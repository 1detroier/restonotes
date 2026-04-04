import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useUIStore } from '../store/useUIStore'
import { useMenuForm } from '../hooks/useMenuForm'
import MenuConfigCard from '../components/menu/MenuConfigCard'
import ProductMultiSelect from '../components/menu/ProductMultiSelect'
import MenuPreview from '../components/menu/MenuPreview'
import { menuDiaRepo } from '../db/repositories/menuDia'

export default function MenuPage() {
  const { productos, saveMenuDelDia, loadMenuDelDia, loadMenuHistorial } = useAppStore()
  const { addToast } = useUIStore()
  const [menuHistorial, setMenuHistorial] = useState([])
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [existingMenu, setExistingMenu] = useState(null)

  const {
    values,
    errors,
    isValid,
    setField,
    toggleProducto,
    reset,
    validate
  } = useMenuForm()

  // Load menu for selected date
  useEffect(() => {
    const loadMenu = async () => {
      const menu = await menuDiaRepo.getByFecha(selectedDate)
      setExistingMenu(menu)

      if (menu) {
        reset({
          fecha: menu.fecha,
          primeroIds: menu.primeroIds || [],
          segundoIds: menu.segundoIds || [],
          postreIds: menu.postreIds || [],
          precio: String(menu.precio),
          incluyeBebida: menu.incluyeBebida || false
        })
      } else {
        reset({
          fecha: selectedDate,
          primeroIds: [],
          segundoIds: [],
          postreIds: [],
          precio: '',
          incluyeBebida: false
        })
      }
    }
    loadMenu()
  }, [selectedDate, reset])

  // Load historial on mount
  useEffect(() => {
    loadMenuHistorial(10).then(setMenuHistorial)
  }, [loadMenuHistorial])

  const handleSave = async () => {
    if (!validate()) {
      addToast('Completa todos los campos requeridos', 'error')
      return
    }

    try {
      await saveMenuDelDia({
        fecha: values.fecha,
        primeroIds: values.primeroIds,
        segundoIds: values.segundoIds,
        postreIds: values.postreIds,
        precio: parseFloat(values.precio),
        incluyeBebida: values.incluyeBebida
      })
      addToast('Menú del día activado', 'success')
      const updated = await loadMenuHistorial(10)
      setMenuHistorial(updated)
    } catch (error) {
      addToast('Error al guardar el menú', 'error')
    }
  }

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date)
  }, [])

  const datesWithMenu = menuHistorial.map((m) => m.fecha)

  return (
    <div className="p-4 pb-20 space-y-4">
      <h2 className="text-2xl font-bold">Menú del Día</h2>

      {/* Date picker */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <label className="label py-1">
            <span className="label-text font-medium">Seleccionar Fecha</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="input input-bordered w-full min-h-[44px]"
          />
          {datesWithMenu.includes(selectedDate) && (
            <p className="text-xs text-success mt-1">
              ✓ Menú existente para esta fecha
            </p>
          )}
        </div>
      </div>

      {/* Menu config */}
      <MenuConfigCard
        fecha={values.fecha}
        precio={values.precio}
        incluyeBebida={values.incluyeBebida}
        onFechaChange={(v) => setField('fecha', v)}
        onPrecioChange={(v) => setField('precio', v)}
        onToggleBebida={(v) => setField('incluyeBebida', v)}
        onSave={handleSave}
        canSave={isValid}
        error={errors}
      />

      {/* Product multi-select */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <ProductMultiSelect
            productos={productos}
            values={values}
            errors={errors}
            onToggle={toggleProducto}
          />
        </div>
      </div>

      {/* Preview */}
      <MenuPreview
        menu={existingMenu || {
          fecha: values.fecha,
          primeroIds: values.primeroIds,
          segundoIds: values.segundoIds,
          postreIds: values.postreIds,
          precio: values.precio ? parseFloat(values.precio) : 0,
          incluyeBebida: values.incluyeBebida,
          activo: false
        }}
        productos={productos}
      />
    </div>
  )
}
