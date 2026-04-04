```markdown
# PRD: RestoNotes - Sistema de Toma de Pedidos
**Versión:** 1.0  
**Fecha:** 04/04/2026  
**Plataforma:** PWA Mobile-First (iOS/Android)  
**Estado:** Draft  

---

## 1. Resumen Ejecutivo

RestoNotes es una aplicación PWA (Progressive Web App) para restaurantes que permite gestionar carta, menú del día y toma de pedidos en mesas. Diseñada específicamente para funcionar **offline** en dispositivos móviles sin costes de servidor ni base de datos externa.

**Características clave:**
- 14 mesas fijas (numeradas del 1 al 14)
- Base de datos local (IndexedDB) mediante Dexie.js
- Funcionamiento 100% offline tras carga inicial
- Instalable como app nativa en móviles
- Stack gratuito: React + Vite + Tailwind + Zustand

---

## 2. Alcance y Contexto

### Usuario objetivo
Camareros/Propietarios de restaurantes pequeños-medios que necesitan una herramienta rápida, táctil y sin complicaciones para tomar notas de pedidos.

### Restricciones técnicas
- **Offline-first:** Sin dependencia de conexión a internet
- **Storage:** Máximo 50MB (limitación IndexedDB móvil)
- **Performance:** < 3s tiempo de carga inicial en 4G
- **Accesibilidad:** Touch targets mínimo 44px, contraste alto para uso bajo luz solar (terrazas)

---

## 3. Arquitectura Técnica

### Stack
| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Framework** | React 18 + Vite | Rápido, moderno, HMR para desarrollo ágil |
| **Estado** | Zustand | Ligero, sin boilerplate, persistente en localStorage |
| **Base Datos** | Dexie.js (IndexedDB) | Offline nativo, queries rápidas, promesas nativas |
| **Styling** | Tailwind CSS + DaisyUI | Consistencia mobile-first, componentes pre-diseñados |
| **PWA** | vite-plugin-pwa | Service worker automático, manifest, iconos |
| **Iconos** | Lucide React | SVGs ligeros, estilo limpio |
| **Fechas** | date-fns | Manipulación fechas sin moment.js (pesado) |

### Esquema de Datos (IndexedDB)

#### Productos (Tabla: `productos`)
```typescript
interface Producto {
  id?: number;              // Auto-increment
  nombre: string;           // "Café con leche"
  precio: number;           // 1.50 (€)
  categoria: 'primero' | 'segundo' | 'postre' | 'bebida' | 'cafeteria';
  emoji: string;            // "☕"
  activo: boolean;          // true/false (soft delete)
  createdAt: Date;
  updatedAt: Date;
}
```

#### Menú del Día (Tabla: `menuDia`)
```typescript
interface MenuDia {
  id?: number;
  fecha: string;            // ISO Date YYYY-MM-DD
  primeroIds: number[];     // IDs productos disponibles
  segundoIds: number[];     
  postreIds: number[];      
  precio: number;           // Precio menú completo
  incluyeBebida: boolean;   // Si el precio incluye bebida
  activo: boolean;          // Disponible hoy
  createdAt: Date;
}
```

#### Mesas (Tabla: `mesas`)
**Nota:** Sistema de 14 mesas fijas, inicializadas en bootstrap.

```typescript
interface Mesa {
  id?: number;              // 1-14 fijos
  numero: number;           // 1-14 (display)
  estado: 'libre' | 'ocupada' | 'cuenta';
  pedidos: PedidoItem[];    // Array embebido
  total: number;            // Calculado, redundante para queries rápidas
  openedAt?: Date;          // Cuándo se ocupó (para timer)
  createdAt: Date;
  updatedAt: Date;
}

interface PedidoItem {
  tempId: string;           // UUID local para identificación única
  productoId?: number;      // null si es menú del día completo
  nombre: string;           // Denormalizado (snapshot precio/nombre)
  precioUnitario: number;   
  cantidad: number;
  subtotal: number;         // precio * cantidad
  tipo: 'carta' | 'menu' | 'bebida';
  categoria?: string;       // Para agrupación en ticket
  timestamp: Date;          // Cuándo se pidió
  nota?: string;            // Opcional: "sin cebolla", etc.
}
```

---

## 4. Funcionalidades Detalladas

### 4.1 Módulo: Gestión de Carta
**Pantalla:** `/carta`

**Requisitos:**
- CRUD completo de productos con validación en tiempo real
- Categorización fija: Primeros, Segundos, Postres, Bebidas, Cafetería
- Selector de emojis integrado (picker grid de emojis de comida comunes)
- Soft delete: Toggle "activo/inactivo" en lugar de borrado físico
- Import/Export JSON para backups manuales (compartir por WhatsApp/email)

**UI Specifications:**
```
Header: "La Carta" | [Import/Export icons]
Filter bar: [Buscar...] + Chips: Todos | Primeros | Segundos | Postres | Bebidas

Lista (Virtual scroll si >30 items):
┌─────────────────────────────────────┐
│ ☕ Café con leche          1.50€   │ 
│ [P] Primero      [Toggle ON] [✏️][🗑️]│
└─────────────────────────────────────┘

FAB Bottom Right: [+] Añadir Producto
Modal Bottom Sheet (Add/Edit):
  - Input: Nombre (autofocus, max 30 chars)
  - Input: Precio (numérico, step 0.01, min 0)
  - Select: Categoría (dropdown nativo)
  - Grid: Emoji picker (5x4 grid emojis comidas)
  - Toggle: Disponible (default ON)
  - Primary Button: Guardar
```

### 4.2 Módulo: Menú del Día
**Pantalla:** `/menu`

**Requisitos:**
- Configuración diaria con persistencia histórica (ver menús pasados)
- Selector múltiple de plos desde carta existente (filtro por categoría)
- Validación: Mínimo 1 primero y 1 segundo para activar
- Precio editable con validación > 0
- Toggle "Incluye bebida" afecta a la lógica de pedidos

**UI Specifications:**
```
Header: "Menú del Día" | DatePicker (default hoy)

Card Estado:
┌─────────────────────────────────────┐
│ Hoy: 04/04/2026                     │
│ [Toggle iOS style] Activo           │
│ Precio: [12.00] €                   │
│ [✓] Incluye bebida                  │
└─────────────────────────────────────┘

Secciones colapsables (Accordion):

▼ Primeros disponibles (2 seleccionados)
  [+ Añadir Primero] → Abre modal multi-select
  Chips: [Ensalada mixta x] [Lentejas x]

▼ Segundos disponibles (3 seleccionados)
▼ Postres disponibles (2 seleccionados)

Footer: Vista previa camarero (cómo se verá en toma de pedidos)
```

### 4.3 Módulo: Toma de Pedidos (Core)
**Pantalla:** `/mesas` (Home default)

#### 4.3.1 Grid de Mesas (14 fijas)
**Layout:** Grid responsive
- Mobile: 2 columnas (7 filas)
- Tablet: 3 columnas 
- Desktop: 4-5 columnas

**Especificaciones mesa:**
```typescript
// Visual por estado
interface MesaVisual {
  libre: { bg: 'bg-green-100', border: 'border-green-500', icon: null },
  ocupada: { 
    bg: 'bg-red-100', 
    border: 'border-red-500',
    timer: 'minutes since openedAt', // Color cambia: naranja <30min, rojo >30min
    total: 'suma actual'
  },
  cuenta: { bg: 'bg-gray-200', border: 'border-gray-500', icon: 'receipt' }
}
```

**Interacciones:**
- **Tap:** Abre drawer detalle mesa
- **Long press (800ms):** Menú contextual rápido (Cerrar cuenta / Ver ticket / Cancelar)
- **Pull to refresh:** No aplica (offline), pero shake-to-export podría ser útil

#### 4.3.2 Drawer Detalle Mesa (90% viewport height)
**Estructura:**
```
┌──────────────────────────────────────────────┐
│ Header Sticky (10%)                          │
│ Mesa 5                              Total    │
│ [Volver]                           47.00€    │
│ [Cerrar Cuenta]            [Timer: 32min]    │
├──────────────────────────────────────────────┤
│ Tabs Sticky (8%)                             │
│ [  CARTA  ] [ MENÚ HOY ] [ BEBIDAS ]         │
├──────────────────────────────────────────────┤
│ Product Grid (42%) - Scrollable              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │  ☕      │ │  🥤      │ │  🥗      │      │
│ │ Café     │ │ Refresco │ │ Ensalada │      │
│ │ 1.50€    │ │ 2.00€    │ │ 8.00€    │      │
│ └──────────┘ └──────────┘ └──────────┘      │
│ Touch targets: 80px mínimo                   │
│ Tap: +1 unidad instantáneo                   │
│ Long press: Modal cantidad personalizada     │
├──────────────────────────────────────────────┤
│ Ticket Preview (40%) - Sticky bottom         │
│ ▼ Bebidas                          4.50€    │
│   2× Café..........................3.00€    │
│   1× Agua..........................1.50€    │
│ ▼ Menú del Día                    12.00€    │
│   1× Menú Completo................12.00€    │
│ ─────────────────────────────────────────    │
│ TOTAL MESA:                       47.00€    │
│ [Imprimir/Compartir]  [Cobrar]              │
└──────────────────────────────────────────────┘
```

**Lógica de Pedidos:**
1. **Agregar item:** Inserta en array `pedidos` de la mesa, recalcula total
2. **Cantidad:** Default 1, modal permite 1-99. Si producto ya existe, suma cantidad
3. **Menú del día:** Al seleccionar 1 primero + 1 segundo + 1 postre, se condensa en línea única "Menú Completo" al precio fijado. Si faltan categorías, se añaden como ítems individuales de carta
4. **Eliminar:** Swipe izquierda en ticket revela botón eliminar. Confirmación si cantidad > 5 o subtotal > 50€
5. **Cerrar cuenta:** 
   - Alerta confirmación con desglose
   - Resetea mesa a estado libre
   - Opcional: Guarda en tabla `historial` (futuro feature analytics)
   - Animación "confetti" opcional al cobrar

---

## 5. Requisitos No Funcionales

### 5.1 Performance
- **First Contentful Paint:** < 1.5s en 3G
- **Time to Interactive:** < 3s
- **Bundle size:** < 200KB gzipped (sin imágenes)
- **Animaciones:** 60fps, duración 200-300ms (no lentas)
- **DB Queries:** < 50ms para escrituras IndexedDB

### 5.2 UX/UI Mobile
- **Viewport:** `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no` (evita zoom accidental)
- **Touch:** Targets mínimo 44x44px, espaciado 8px entre elementos táctiles
- **Feedback:** 
  - Haptic feedback en agregar item (si API disponible)
  - Visual: `active:scale-95` en todos los botones
  - Toast notifications para acciones (añadido/eliminado)
- **Dark Mode:** Soportar `prefers-color-scheme: dark` automático

### 5.3 Offline & PWA
- **Service Worker:** Estrategia Cache First, Network Fallback
- **Precache:** App shell + assets críticos
- **Runtime cache:** Google Fonts, Iconos externos (si aplica)
- **Manifest:**
  - Display: standalone
  - Orientation: portrait (preferible para restaurantes)
  - Theme color: #ff6b35 (primary)
  - Background color: #ffffff
- **Iconos:** 192x192, 512x512, maskable para Android adaptive icons

### 5.4 Seguridad & Datos
- **Sanitización:** Todo input de usuario sanitizado (XSS prevention)
- **Backup:** Export JSON cifrado opcional (password) para datos sensibles de precios
- **Validación:** Precios nunca negativos, cantidades máximo 99 por ítem

---

## 6. Plan de Implementación (Sprints)

### Sprint 1: Fundamentos (Días 1-2)
- [ ] Setup Vite + React + Tailwind + DaisyUI
- [ ] Configurar Dexie con schema v1
- [ ] Configurar Zustand con persistencia
- [ ] Crear layout base con navegación inferior (3 tabs)
- [ ] Bootstrap inicial: Crear 14 mesas fijas en DB al primer arranque
- [ ] Configurar PWA base (manifest, icons placeholder)

### Sprint 2: Gestión Carta (Días 3-4)
- [ ] CRUD Productos completo
- [ ] Emoji picker component
- [ ] Filtros por categoría
- [ ] Import/Export JSON
- [ ] Seed data inicial (10 productos de ejemplo)

### Sprint 3: Core Pedidos (Días 5-7)
- [ ] Grid 14 mesas con estados visuales
- [ ] Drawer detalle mesa (UI completa)
- [ ] Sistema tabs: Carta/Menú/Bebidas
- [ ] Grid productos táctil
- [ ] Ticket en tiempo real con cálculos
- [ ] Agregar/eliminar ítems

### Sprint 4: Menú del Día & Polish (Días 8-9)
- [ ] Configuración Menú del Día
- [ ] Lógica menú completo vs ítems sueltos
- [ ] Timer de mesas (tiempo transcurrido)
- [ ] Cerrar cuenta con confirmación
- [ ] Animaciones (Framer Motion)
- [ ] Dark mode

### Sprint 5: Testing & Deploy (Día 10)
- [ ] Testing en iOS Safari (PWA install)
- [ ] Testing en Android Chrome
- [ ] Lighthouse audit (>90 performance, >90 PWA)
- [ ] Optimización imágenes/assets
- [ ] Deploy en Netlify/Vercel
- [ ] Documentación usuario básica

---

## 7. Prompts para Desarrollo con IA

### Setup Inicial
```
Crea proyecto React con Vite "restonotes" con:
1. Dependencies: react, react-dom, zustand, dexie, lucide-react, date-fns, clsx, tailwind-merge
2. DevDependencies: tailwindcss, postcss, autoprefixer, @vitejs/plugin-react, vite-plugin-pwa
3. Configurar tailwind.config.js: content ["./index.html","./src/**/*.{js,ts,jsx,tsx}"], theme extend colors {primary: '#ff6b35', secondary: '#f7931e', dark: '#2d3436'}
4. Configurar vite.config.js con react() y VitePWA({registerType: 'autoUpdate', manifest: {name: 'RestoNotes', short_name: 'Resto', theme_color: '#ff6b35', icons: [...]}})
5. Crear src/db/schema.js exportando const db = new Dexie('RestoDB') con tablas: productos, menuDia, mesas. Usar versión 1.
6. Crear función bootstrapMesas() que inserte 14 mesas fijas (número 1-14, estado 'libre') si la tabla está vacía al iniciar.
7. Estructura carpetas: components/, store/, db/, hooks/, utils/
```

### Componente Grid Mesas (14 fijas)
```
Crea src/components/MesasGrid.jsx:
- Props: mesas (array 14 items), onMesaClick, onMesaLongPress
- Grid CSS: grid-cols-2 mobile, gap-3, p-4
- Cada mesa: aspect-square, rounded-2xl, shadow-md, flex flex-col items-center justify-center
- Estados visuales:
  * libre: bg-green-50 border-2 border-green-400 text-green-800
  * ocupada: bg-red-50 border-2 border-red-400, mostrar timer en minutos desde openedAt (useEffect intervalo 1min), mostrar total en € grande
  * cuenta: bg-gray-100 border-2 border-gray-400 text-gray-600
- Número mesa: text-2xl font-bold
- Timer ocupada: text-sm (rojo oscuro >30min, naranja <30min)
- Total: text-xl font-bold mt-1
- Interacciones: onClick llama onMesaClick(mesa.id), onContextMenu/preventDefault para long press simulado o usar onMouseDown/onMouseUp con timer 800ms para onMesaLongPress
- Animación: whileHover={{scale: 1.05}} si usas framer-motion
```

### Store Zustand
```
Crea src/store/useAppStore.js:
- Estado: mesas[], productos[], menuDelDia (null | object), mesaActivaId (null | number), loading (boolean)
- Acciones:
  * initApp(): carga productos y mesas desde Dexie, si mesas vacías ejecuta bootstrapMesas()
  * addProducto(producto): guarda en Dexie y actualiza estado
  * toggleProducto(id): cambia activo true/false
  * updateMenuDelDia(menuData): valida que tenga al menos 1 primero y 1 segundo, guarda en DB
  * abrirMesa(mesaId): cambia estado 'ocupada', setea openedAt new Date()
  * addItemToMesa(mesaId, item): item={productoId, cantidad, tipo}. Busca mesa, si ya existe producto en pedidos suma cantidad, si no push nuevo. Recalcula total mesa. Guarda en Dexie.
  * removeItemFromMesa(mesaId, tempId): filtra array pedidos, recalcula total
  * cerrarCuenta(mesaId): resetea pedidos [], estado 'libre', openedAt null, total 0. Opcional: guardar snapshot en tabla 'historial'
  * setMesaActiva(id): solo UI state
- Persistencia: solo mesaActivaId en localStorage, datos reales en IndexedDB
```

---

## 8. Notas de Mantenimiento

### Límites conocidos
- **Máximo histórico:** Sin feature de historial, los pedidos se pierden al cerrar cuenta. Considerar tabla `historial` para analytics futuros.
- **Sincronización:** No hay sync entre dispositivos. Para múltiples móviles, necesitaría backend (Supabase) en versión 2.0.
- **Imágenes:** No soporta fotos de platos (ocuparía mucho storage IndexedDB). Usar emojis únicamente.

### Escalabilidad futura (v2.0)
- Sync con Supabase Realtime para múltiples dispositivos
- Impresión térmica Bluetooth de tickets
- Soporte para 14+ mesas (configurable)
- Categorías personalizables
- Fotos de platos con compresión lazy-load
- Split bill (dividir cuenta)
```