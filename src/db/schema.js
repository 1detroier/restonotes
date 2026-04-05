import Dexie from 'dexie'

export const db = new Dexie('RestoDB')

db.version(1).stores({
  productos: '++id, nombre, categoria, activo, createdAt, updatedAt',
  menuDia: '++id, fecha, activo, createdAt',
  mesas: '++id, numero, estado, openedAt, createdAt, updatedAt'
})

// T1: Dexie v2 migration — add ventas, cocina, pedidosLlevar tables
db.version(2).stores({
  ventas: '++id, mesaId, fecha, timestamp, total',
  cocina: '++id, mesaId, status, timestamp',
  pedidosLlevar: '++id, customerName, status, total, createdAt'
}).upgrade(async (tx) => {
  // New tables start empty — no data transformation needed
  // Existing v1 tables (productos, menuDia, mesas) are untouched
})

// v3: track mesa association and pickup time for takeaway orders
db.version(3).stores({
  pedidosLlevar: '++id, customerName, status, total, createdAt, pickupAt, mesaId'
}).upgrade(async (tx) => {
  const table = tx.table('pedidosLlevar')
  await table.toCollection().modify((pedido) => {
    if (pedido.pickupAt === undefined) pedido.pickupAt = null
    if (pedido.mesaId === undefined) pedido.mesaId = null
  })
})

// v4: enable product variants metadata
db.version(4).stores({
  productos: '++id, nombre, categoria, activo, createdAt, updatedAt'
}).upgrade(async (tx) => {
  const table = tx.table('productos')
  await table.toCollection().modify((producto) => {
    if (producto.hasVariants === undefined) producto.hasVariants = false
    if (!producto.variantGroups) producto.variantGroups = []
  })
})

export default db
