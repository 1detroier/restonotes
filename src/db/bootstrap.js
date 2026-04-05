import { db } from './schema'
import { mesaRepo } from './repositories/mesas'
import { productoRepo } from './repositories/productos'
import { MESA_COUNT, CATEGORIAS_CARTA, ESTADOS_MESA } from '../utils/constants'

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
      { nombre: 'Arroz a la Cubana', precio: 8.50, categoria: 'con_arroz', emoji: '🍚' },
      { nombre: 'Paella Valenciana', precio: 12.00, categoria: 'con_arroz', emoji: '🥘' },
      { nombre: 'Salmón a la Plancha', precio: 12.00, categoria: 'sin_arroz', emoji: '🐟' },
      { nombre: 'Pollo Asado', precio: 9.50, categoria: 'sin_arroz', emoji: '🍗' },
      { nombre: 'Sopa de Ajo', precio: 5.50, categoria: 'sopas', emoji: '🍲' },
      { nombre: 'Caldo Gallego', precio: 6.00, categoria: 'sopas', emoji: '🥣' },
      { nombre: 'Ensalada Mixta', precio: 6.50, categoria: 'entrantes', emoji: '🥗' },
      { nombre: 'Tortilla Española', precio: 7.00, categoria: 'entrantes', emoji: '🍳' },
      { nombre: 'Flan de Huevo', precio: 3.50, categoria: 'postres', emoji: '🍮' },
      { nombre: 'Tres Leches', precio: 4.00, categoria: 'postres', emoji: '🍰' },
      { nombre: 'Agua Mineral', precio: 1.20, categoria: 'bebidas', emoji: '💧' },
      { nombre: 'Cerveza Caña', precio: 2.00, categoria: 'bebidas', emoji: '🍺' },
      { nombre: 'Vino Tinto Copa', precio: 2.50, categoria: 'bebidas', emoji: '🍷' },
      { nombre: 'Café con Leche', precio: 1.50, categoria: 'bebidas', emoji: '☕' }
    ].map((producto) => ({
      ...producto,
      activo: true,
      createdAt: now,
      updatedAt: now,
      hasVariants: false,
      variantGroups: []
    }))

    await db.productos.bulkAdd(productos)
    console.log(`[Bootstrap] Seeded ${productos.length} sample products`)
  } else {
    console.log(`[Bootstrap] Productos already exist (${count} records), skipping`)
  }
}
