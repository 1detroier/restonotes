import { db } from './schema'
import { mesaRepo } from './repositories/mesas'
import { productoRepo } from './repositories/productos'
import { MESA_COUNT, CATEGORIAS, ESTADOS_MESA } from '../utils/constants'

/**
 * Creates 14 mesas (id 1-14, estado 'libre') if mesas table is empty.
 * Idempotent: safe to call multiple times.
 */
export async function bootstrapMesas() {
  const count = await db.mesas.count()

  if (count === 0) {
    const mesas = []
    const now = new Date()

    for (let i = 1; i <= MESA_COUNT; i++) {
      mesas.push({
        numero: i,
        estado: ESTADOS_MESA.LIBRE,
        pedidos: [],
        total: 0,
        openedAt: null,
        createdAt: now,
        updatedAt: now
      })
    }

    await db.mesas.bulkAdd(mesas)
    console.log(`[Bootstrap] Created ${MESA_COUNT} mesas`)
  } else {
    console.log(`[Bootstrap] Mesas already exist (${count} records), skipping`)
  }
}

/**
 * Creates ~10 sample products across categories if productos table is empty.
 * Idempotent: safe to call multiple times.
 */
export async function seedProductos() {
  const count = await db.productos.count()

  if (count === 0) {
    const now = new Date()
    const productos = [
      { nombre: 'Ensalada Mixta', precio: 6.50, categoria: 'primero', emoji: '🥗', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Lentejas Estofadas', precio: 7.00, categoria: 'primero', emoji: '🍲', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Salmón a la Plancha', precio: 12.00, categoria: 'segundo', emoji: '🐟', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Pollo Asado', precio: 9.50, categoria: 'segundo', emoji: '🍗', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Tarta de Queso', precio: 4.50, categoria: 'postre', emoji: '🍰', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Helado Artesanal', precio: 3.50, categoria: 'postre', emoji: '🍦', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Café con Leche', precio: 1.50, categoria: 'cafeteria', emoji: '☕', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Agua Mineral', precio: 1.20, categoria: 'bebida', emoji: '💧', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Cerveza Caña', precio: 2.00, categoria: 'bebida', emoji: '🍺', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Vino Tinto Copa', precio: 2.50, categoria: 'bebida', emoji: '🍷', activo: true, createdAt: now, updatedAt: now }
    ]

    await db.productos.bulkAdd(productos)
    console.log(`[Bootstrap] Seeded ${productos.length} sample products`)
  } else {
    console.log(`[Bootstrap] Productos already exist (${count} records), skipping`)
  }
}
