import Dexie from 'dexie'

export const db = new Dexie('RestoDB')

db.version(1).stores({
  productos: '++id, nombre, categoria, activo, createdAt, updatedAt',
  menuDia: '++id, fecha, activo, createdAt',
  mesas: '++id, numero, estado, openedAt, createdAt, updatedAt'
})

export default db
