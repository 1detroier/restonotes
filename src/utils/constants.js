/** Number of fixed tables in the restaurant */
export const MESA_COUNT = 14

/** Valid product categories */
export const CATEGORIAS = ['primero', 'segundo', 'postre', 'bebida', 'cafeteria']

/** Table states */
export const ESTADOS_MESA = {
  LIBRE: 'libre',
  OCUPADA: 'ocupada',
  CUENTA: 'cuenta'
}

/** Tab identifiers */
export const TABS = {
  MESAS: 'mesas',
  CARTA: 'carta',
  MENU: 'menu'
}

/** Food emojis for producto selection (5x4 grid) */
export const EMOJI_GRID = [
  '🍝', '🍲', '🥗', '🍕', '🍔',
  '🥩', '🐟', '🍗', '🥘', '🍜',
  '🍰', '🧁', '🍮', '☕', '🍺',
  '🍷', '🥤', '🧃', '💧', '🍞'
]

/** Human-readable category labels */
export const CATEGORIA_LABELS = {
  primero: 'Primeros',
  segundo: 'Segundos',
  postre: 'Postres',
  bebida: 'Bebidas',
  cafeteria: 'Cafetería'
}

/** Timer color threshold in minutes (orange below, red at/above) */
export const TIMER_THRESHOLD = 30

/** Long press duration in milliseconds */
export const LONG_PRESS_DURATION = 800

/** Swipe gesture threshold in pixels */
export const SWIPE_THRESHOLD = 80

/** Timer update interval in milliseconds */
export const TIMER_INTERVAL = 10000
