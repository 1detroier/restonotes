# Decisiones Técnicas — RestoNotes

> Documento de referencia con todas las decisiones de arquitectura, patrones y tradeoffs tomados durante el desarrollo de RestoNotes.

---

## 1. Arquitectura General

### Dexie.js = Fuente de verdad, Zustand = Espejo reactivo

**Qué**: Todos los datos persistentes viven en IndexedDB (Dexie.js). Zustand actúa como un espejo reactivo que sincroniza después de cada operación.

**Por qué**: 
- IndexedDB es la única forma de persistencia offline en el navegador
- Zustand proporciona reactividad instantánea sin boilerplate
- Separar persistencia de estado UI permite testear cada capa independientemente

**Tradeoff**: Cada mutación requiere 2 pasos (escribir en Dexie + actualizar Zustand). Para 14 mesas esto es imperceptible.

```
User action → Dexie Repository → loadMesas() → Zustand sync → React re-render
```

### Patrón Repositorio

**Qué**: Cada tabla tiene su archivo repositorio (`db/repositories/*.js`) con funciones CRUD. Los componentes NUNCA llaman a Dexie directamente.

**Por qué**:
- Hace la capa de datos testeable con mocks
- Centraliza queries especializadas (getByCategoria, getByEstado, etc.)
- Si mañana cambiamos de Dexie a otro storage, solo tocamos los repos

### Sin Router

**Qué**: Navegación por tabs controlada por Zustand (`activeTab`), sin react-router.

**Por qué**: Solo 3 vistas. Un router sería overkill y añade bundle size innecesario.

---

## 2. Base de Datos

### Schema Dexie v1 — Pedidos embebidos en Mesa

**Qué**: El array `pedidos` vive DENTRO del registro de cada mesa, no en tabla separada.

**Por qué**:
- 14 mesas máximo → no hay problema de escalabilidad
- Lectura atómica: un `getById` trae mesa + pedidos completos
- Sin joins ni queries complejas

**Tradeoff**: Si en v2 queremos analytics de pedidos, habrá que migrar a tabla separada.

### Bootstrap Idempotente

**Qué**: `bootstrapMesas()` y `seedProductos()` verifican si hay datos antes de insertar.

**Por qué**: Se llama en cada arranque de la app. Si ya existen datos, no debe duplicar.

### Sin Tabla de Historial

**Qué**: Al cerrar cuenta, los pedidos se pierden. No hay tabla `historial`.

**Por qué**: El PRD lo marca como feature v2. Mantener el MVP simple.

---

## 3. Gestión de Estado

### Store Único con Acciones Síncronas

**Qué**: `useAppStore` maneja TODO el estado de negocio. `useUIStore` maneja estado transitorio (tabs, modals, toasts).

**Por qué**:
- App pequeña → un store es más simple que slices
- UI state separado permite persistir solo lo necesario (activeTab en localStorage)

### Modal Stack

**Qué**: `useUIStore.modals` es un array. El componente `Modal` renderiza `modals[0]`.

**Por qué**: Evita prop-drilling. Cualquier componente puede abrir un modal sin pasar callbacks.

**Limitación**: Solo 1 modal visible a la vez. Para esta app es suficiente.

---

## 4. UI/UX

### Tailwind + DaisyUI, Sin Component Library Extra

**Qué**: DaisyUI proporciona primitivas (btn, card, modal, tabs). No hay librería de componentes adicional.

**Por qué**:
- DaisyUI ya da consistencia visual
- Menos dependencias = bundle más pequeño
- Los componentes custom son simples y específicos del dominio

### Touch Targets ≥ 44px

**Qué**: Todos los elementos interactivos tienen `min-h-[44px] min-w-[44px]`.

**Por qué**: Requisito de accesibilidad para uso bajo luz solar (terrazas) y con manos ocupadas.

### Sin Framer Motion

**Qué**: Animaciones solo con CSS transitions (`animate-slide-up`, `transition-all`).

**Por qué**:
- Framer Motion añade ~30KB al bundle
- Las animaciones necesarias son simples (slide, fade, scale)
- CSS es suficiente para 60fps en móvil

### Emoji Picker Hardcodeado

**Qué**: Grid de 20 emojis de comida definidos en `constants.js`. Sin librería externa.

**Por qué**: 
- No necesita búsqueda ni categorías complejas
- 0 dependencias añadidas
- ~100 bytes vs ~50KB de un emoji picker library

---

## 5. Sistema de Pedidos

### Condensación de Menú del Día

**Qué**: Función pura `condenseMenuDia(pedidos, menuDelDia)` detecta 1 primero + 1 segundo + 1 postre y los condensa en una línea "Menú Completo".

**Por qué**:
- El camarero selecciona items individuales
- El ticket muestra el precio unificado del menú
- Función pura = fácil de testear

### Timer Computado, No Acumulado

**Qué**: `useMesaTimer(openedAt)` calcula minutos transcurridos en cada tick (cada 10s). No acumula ni escribe en DB.

**Por qué**:
- Basado en timestamp → no hay drift
- Si la app se cierra y reabre, el timer sigue correcto
- 0 escrituras a Dexie para el timer

### Swipe para Eliminar

**Qué**: Hook `useSwipe` detecta swipe-left con threshold de 80px. Sin librería de gestos.

**Por qué**:
- ~66 líneas de código vs ~15KB de librería
- Control total del comportamiento
- Funciona con touch events nativos

---

## 6. Testing

### Vitest + jsdom + fake-indexeddb

**Qué**: Vitest como runner, jsdom como DOM environment, fake-indexeddb como polyfill de IndexedDB para tests.

**Por qué**:
- Vitest es nativo de Vite → 0 config extra
- jsdom permite tests de componentes sin navegador real
- fake-indexeddb es necesario porque jsdom NO incluye IndexedDB API

**Descubrimiento clave**: Sin fake-indexeddb, los tests de repositorios fallan silenciosamente.

### Pirámide de Tests

| Capa | Qué se testea | Herramienta |
|------|--------------|-------------|
| Utils | Funciones puras (formatters, orderHelpers) | Vitest directo |
| Repos | CRUD + queries especializadas | Vitest + fake-indexeddb |
| Hooks | Lógica de estado (forms, timer, gestos) | renderHook |
| Componentes | Renderizado + interacciones | @testing-library/react |
| Integración | Flujos completos de página | @testing-library/react + userEvent |

### Mock de Stores en Tests de Componentes

**Qué**: Los tests de componentes mockean `useAppStore` y `useUIStore` con `vi.mock()`.

**Por qué**:
- Aísla el componente del estado global
- Tests más rápidos y deterministas
- Los tests de integración prueban el flujo completo

---

## 7. PWA

### Service Worker: Cache First

**Qué**: `vite-plugin-pwa` con `registerType: 'autoUpdate'`. Precache del app shell.

**Por qué**:
- La app debe funcionar 100% offline tras la primera carga
- autoUpdate asegura que nuevas versiones se instalen sin intervención
- Cache First es la estrategia correcta para una app que no depende de servidor

### Iconos SVG (no PNG)

**Qué**: Manifest referencia iconos `.svg` en lugar de `.png`.

**Por qué**:
- No se pueden generar PNG programáticamente sin herramientas externas
- SVG escala infinitamente y pesa menos
- Fix: se corrigió en el warning de verificación del cambio 1

### Viewport Restringido

**Qué**: `maximum-scale=1, user-scalable=no` en el viewport meta.

**Por qué**: Evita zoom accidental al tocar rápidamente en móvil durante el servicio.

---

## 8. Estructura de Archivos

### Organización por Tipo, No por Feature

**Qué**: `components/carta/`, `components/mesa/`, `components/menu/`, `components/ui/`, `components/layout/`.

**Por qué**:
- App pequeña → no necesita feature-sliced design
- Cada tipo de componente tiene su carpeta
- Fácil de navegar: sabés qué buscás → sabés dónde está

### Pages como Orquestadores

**Qué**: `CartaPage.jsx`, `MenuPage.jsx`, `MesasPage.jsx` solo componen componentes. No tienen lógica de negocio.

**Por qué**:
- Separación clara: pages = qué se muestra, components = cómo se muestra, store = datos
- Pages testeables como integración, components testeables como unidad

---

## 9. Division de Cambios SDD

### 3 Cambios Secuenciales

| Cambio | Scope | Tasks | Tests |
|--------|-------|-------|-------|
| `resto-foundation` | Setup, DB, stores, layout shell, PWA base | 30 | 25 |
| `resto-carta-menu` | CRUD productos, emoji picker, menú del día config | 25 | 108 |
| `resto-ordering` | Grid mesas, drawer, pedidos, ticket, timer | 36 | 190 |

**Por qué**:
- Cada cambio es verificable independientemente
- Foundation establece patrones que los demás siguen
- Reduce riesgo de cambios grandes e inmanejables

---

## 10. Números Finales

| Métrica | Valor |
|---------|-------|
| **Total de archivos** | ~60 archivos fuente + 29 archivos de test |
| **Total de tests** | 190 passing |
| **Bundle JS** | 294KB (93.84KB gzip) |
| **Bundle CSS** | 87KB (13.49KB gzip) |
| **Dependencias npm** | 0 añadidas beyond las del PRD |
| **Cambios SDD** | 3 (91 tasks totales) |

---

## 11. Deuda Técnica Conocida

1. **ContextMenu sin test unitario** — Cubierto por tests de integración pero no aislado
2. **Grid desktop: 4 columnas** — El PRD menciona 4-5 para pantallas grandes
3. **Long-press en ProductQuickAdd usa onContextMenu** — Funciona en desktop, no replica exactamente touch long-press
4. **Sin tabla historial** — Feature v2 según PRD
5. **Sin sync entre dispositivos** — Requeriría backend (Supabase) en v2

---

## 12. Lecciones Aprendidas

1. **fake-indexeddb es obligatorio** para tests de repositorios en jsdom
2. **vitest.config.js necesita `react()` plugin** para JSX en tests
3. **Mockear `document.createElement` globalmente rompe React** — hay que ser específico
4. **`file.text()` no existe en jsdom** — hay que mockearlo manualmente en tests
5. **Bootstrap duplicado** — se detectó en verificación y se eliminó de main.jsx
6. **Formato de iconos** — vite.config.js y manifest deben coincidir (SVG vs PNG)
