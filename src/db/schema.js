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

export default db
