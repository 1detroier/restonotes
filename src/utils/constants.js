/** Number of fixed tables in the restaurant */
export const MESA_COUNT = 14

/** Valid product categories for the carta (menu card) */
export const CATEGORIAS_CARTA = ['con_arroz', 'sin_arroz', 'sopas', 'entrantes', 'arroz_frijoles', 'bolon', 'postres', 'bebidas']

/** Valid selection categories for the menú del día (fixed-price daily menu) */
export const CATEGORIAS_MENU = ['primero', 'segundo', 'postre']

/** All product categories combined (for DB queries) */
export const CATEGORIAS = [...CATEGORIAS_CARTA, ...CATEGORIAS_MENU]

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
  // Carta categories
  con_arroz: 'Con Arroz',
  sin_arroz: 'Sin Arroz',
  sopas: 'Sopas / Caldos',
  entrantes: 'Entrantes',
  arroz_frijoles: 'Arroz con Frijoles',
  bolon: 'Bolón',
  postres: 'Postres',
  bebidas: 'Bebidas',
  // Menú del día categories
  primero: 'Primeros',
  segundo: 'Segundos',
  postre: 'Postres'
}

/** Timer color threshold in minutes (orange below, red at/above) */
export const TIMER_THRESHOLD = 30

/** Long press duration in milliseconds */
export const LONG_PRESS_DURATION = 800

/** Swipe gesture threshold in pixels */
export const SWIPE_THRESHOLD = 80

/** Timer update interval in milliseconds */
export const TIMER_INTERVAL = 10000
