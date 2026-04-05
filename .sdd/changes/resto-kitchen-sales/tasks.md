# Tasks: resto-kitchen-sales

> Change: Add kitchen queue, item cancellation, daily sales report with CSV export, and takeaway orders to RestoNotes PWA.
> Spec: `mem_get_observation(196)` | Design: `mem_get_observation(195)`
> Total tasks: 27 | Estimated phases: 9

---

## Phase 1: Schema Migration

### T1: Dexie v2 migration — add ventas, cocina, pedidosLlevar tables

**Dependencies:** none (first task)

**Files:**
- `src/db/schema.js` — modify

**Acceptance Criteria:**
- [ ] `db.version(2).stores()` added with three new tables:
  - `ventas: '++id, mesaId, fecha, timestamp, total'`
  - `cocina: '++id, mesaId, status, timestamp'`
  - `pedidosLlevar: '++id, customerName, status, total, createdAt'`
- [ ] Existing v1 tables (productos, menuDia, mesas) remain untouched
- [ ] No data transformation needed in upgrade hook (new tables start empty)
- [ ] App loads without errors after migration
- [ ] Existing tests still pass (192 tests)

**Notes:** Use Dexie's `.upgrade()` hook pattern. No data migration required since new tables are empty on first load.

---

## Phase 2: New Repositories

### T2: ventas.js — CRUD repository for sales snapshots

**Dependencies:** T1

**Files:**
- `src/db/repositories/ventas.js` — create

**Acceptance Criteria:**
- [ ] `create(venta)` — inserts a venta record, returns id
- [ ] `getByFecha(fecha)` — returns all ventas for a YYYY-MM-DD date, sorted by timestamp asc
- [ ] `getAll()` — returns all ventas sorted by timestamp desc
- [ ] `getTotalByDate(fecha)` — returns sum of all totals for a given date
- [ ] Follows existing repo pattern (object with async methods, imports `db` from schema)
- [ ] Exported as named `ventaRepo`

**Contract:**
```js
ventaRepo = {
  create: async (venta) => number,
  getByFecha: async (fecha) => Venta[],
  getAll: async () => Venta[],
  getTotalByDate: async (fecha) => number
}
```

---

### T3: cocina.js — CRUD repository for kitchen queue items

**Dependencies:** T1

**Files:**
- `src/db/repositories/cocina.js` — create

**Acceptance Criteria:**
- [ ] `create(item)` — inserts a cocina record, returns id
- [ ] `updateStatus(id, status)` — updates status field of a cocina item
- [ ] `getPending()` — returns all items where status is 'pendiente' or 'en_curso', sorted by timestamp asc
- [ ] `getAll()` — returns all cocina items sorted by timestamp desc
- [ ] `getByMesaId(mesaId)` — returns all cocina items for a specific mesa
- [ ] Follows existing repo pattern
- [ ] Exported as named `cocinaRepo`

**Contract:**
```js
cocinaRepo = {
  create: async (item) => number,
  updateStatus: async (id, status) => void,
  getPending: async () => CocinaItem[],
  getAll: async () => CocinaItem[],
  getByMesaId: async (mesaId) => CocinaItem[]
}
```

---

### T4: pedidosLlevar.js — CRUD repository for takeaway orders

**Dependencies:** T1

**Files:**
- `src/db/repositories/pedidosLlevar.js` — create

**Acceptance Criteria:**
- [ ] `create(order)` — inserts a takeaway order, returns id
- [ ] `update(id, data)` — updates fields of a takeaway order, sets updatedAt
- [ ] `delete(id)` — removes a takeaway order
- [ ] `getAll()` — returns all takeaway orders sorted by createdAt desc
- [ ] `getByStatus(status)` — returns all orders matching a status
- [ ] Follows existing repo pattern
- [ ] Exported as named `pedidosLlevarRepo`

**Contract:**
```js
pedidosLlevarRepo = {
  create: async (order) => number,
  update: async (id, data) => void,
  delete: async (id) => void,
  getAll: async () => PedidoLlevar[],
  getByStatus: async (status) => PedidoLlevar[]
}
```

---

## Phase 3: Utils & Helpers

### T5: csvExport.js — generate CSV from ventas data with UTF-8 BOM

**Dependencies:** T2 (for Venta record shape knowledge)

**Files:**
- `src/utils/csvExport.js` — create

**Acceptance Criteria:**
- [ ] `exportVentasToCSV(ventas, filename)` function exported
- [ ] Output begins with UTF-8 BOM (`\uFEFF`) for Excel compatibility with ñ and accents
- [ ] CSV columns: Fecha, Hora, Mesa, Items, Total, Método de pago
- [ ] Items column contains semicolon-separated item names with quantities (e.g. "2× Café; 1× Ensalada")
- [ ] Filename format: `ventas-YYYY-MM-DD.csv`
- [ ] Triggers download via `Blob` + `URL.createObjectURL` + temporary `<a>` element
- [ ] Handles empty ventas array gracefully (outputs header row only)
- [ ] No new npm dependencies

---

### T6: orderHelpers.js — add status field and cancelled-aware calcTotal

**Dependencies:** none (can be done in parallel with T1)

**Files:**
- `src/utils/orderHelpers.js` — modify

**Acceptance Criteria:**
- [ ] `createPedidoItem()` includes `status: 'activo'` field in returned object
- [ ] `calcTotal(pedidos)` excludes items where `status === 'cancelado'`
- [ ] New helper `isCancelled(item)` returns true if `item.status === 'cancelado'`
- [ ] New helper `getCancelledCount(pedidos)` returns count of cancelled items
- [ ] Existing tests still pass (backward compatible — items without status field treated as 'activo')
- [ ] `groupByCategory()` unchanged (still works with status field present)

**Notes:** The status field default of 'activo' ensures backward compatibility with existing PedidoItem records that don't have a status field. `calcTotal` should check `item.status !== 'cancelado'` rather than `item.status === 'activo'` to be safe.

---

### T7: constants.js — new tabs and status labels

**Dependencies:** none (can be done in parallel with T1)

**Files:**
- `src/utils/constants.js` — modify

**Acceptance Criteria:**
- [ ] `TABS` extended with: `COCINA: 'cocina'`, `PARA_LLEVAR: 'para_llevar'`, `VENTAS: 'ventas'`
- [ ] New constant `COCINA_STATUS` with: `PENDIENTE: 'pendiente'`, `EN_CURSO: 'en_curso'`, `LISTO: 'listo'`, `CANCELADO: 'cancelado'`
- [ ] New constant `TAKEAWAY_STATUS` with: `PENDIENTE: 'pendiente'`, `LISTO: 'listo'`, `ENTREGADO: 'entregado'`, `PAGADO: 'pagado'`
- [ ] New constant `PEDIDO_STATUS` with: `ACTIVO: 'activo'`, `CANCELADO: 'cancelado'`
- [ ] New constant `COCINA_STATUS_COLORS` mapping status to daisyUI badge colors:
  - `pendiente: 'warning'`, `en_curso: 'info'`, `listo: 'success'`, `cancelado: 'error'`
- [ ] New constant `TAKEAWAY_STATUS_COLORS` mapping status to daisyUI badge colors:
  - `pendiente: 'warning'`, `listo: 'success'`, `entregado: 'info'`, `pagado: 'ghost'`
- [ ] Existing constants unchanged

---

## Phase 4: Store Actions

### T8: useAppStore — cancelItem, saveVenta, loadVentas, loadCocina, takeaway CRUD actions

**Dependencies:** T2, T3, T4, T6, T7

**Files:**
- `src/store/useAppStore.js` — modify

**Acceptance Criteria:**
- [ ] `cancelItem(mesaId, itemId)` — sets item status to 'cancelado' in mesa.pedidos, recalculates total, persists via mesaRepo
- [ ] `saveVenta(mesaId, paymentMethod)` — creates venta snapshot from mesa's current pedidos/total, persists via ventaRepo
- [ ] `loadVentas(fecha?)` — loads ventas (optionally filtered by date) into store state `ventas`
- [ ] `loadCocina()` — loads pending cocina items into store state `cocina`
- [ ] `advanceCocinaStatus(cocinaId)` — advances status: pendiente→en_curso→listo
- [ ] `createTakeaway(customerName)` — creates new takeaway order with status 'pendiente', empty pedidos
- [ ] `updateTakeaway(id, data)` — updates takeaway order fields
- [ ] `deleteTakeaway(id)` — deletes takeaway order
- [ ] `loadTakeaways()` — loads all takeaway orders into store state `takeaways`
- [ ] `addTakeawayItem(takeawayId, producto, cantidad, tipo, nota)` — adds item to takeaway pedidos, recalculates total
- [ ] `payTakeaway(id, paymentMethod)` — saves venta from takeaway, marks as 'pagado'
- [ ] New state fields: `ventas: []`, `cocina: []`, `takeaways: []`, `takeawayActivaId: null`
- [ ] Imports new repos: `ventaRepo`, `cocinaRepo`, `pedidosLlevarRepo`

---

### T9: CerrarCuentaModal — save venta snapshot before closing

**Dependencies:** T8

**Files:**
- `src/components/mesa/CerrarCuentaModal.jsx` — modify
- `src/store/useAppStore.js` — modify (enhance closeCuenta)

**Acceptance Criteria:**
- [ ] CerrarCuentaModal adds payment method selector (radio buttons: efectivo / tarjeta)
- [ ] Payment method state managed locally in modal (default: 'efectivo')
- [ ] `closeCuenta` in store enhanced to: (1) save venta snapshot, (2) reset mesa — wrapped in Dexie transaction for atomicity
- [ ] Venta saved BEFORE mesa reset (order matters)
- [ ] Venta record includes: mesaId, items snapshot, total, fecha (YYYY-MM-DD), timestamp (ISO), paymentMethod
- [ ] On confirm: calls enhanced `closeCuenta(mesaId, paymentMethod)`
- [ ] Existing closeCuenta tests updated or new tests added for venta save

---

## Phase 5: Kitchen Components

### T10: CocinaPage.jsx — kitchen queue orchestrator

**Dependencies:** T3, T8

**Files:**
- `src/pages/CocinaPage.jsx` — create

**Acceptance Criteria:**
- [ ] Page component with header "Cocina"
- [ ] Loads cocina items on mount via `loadCocina()`
- [ ] Displays CocinaQueue component with pending items
- [ ] Shows empty state when no pending items: "No hay pedidos pendientes 🍳"
- [ ] Auto-refresh interval (every 5 seconds) to sync cocina state
- [ ] Cleanup interval on unmount
- [ ] Touch target minimum 44px for all interactive elements

---

### T11: CocinaQueue.jsx — list of pending items grouped by mesa

**Dependencies:** T10

**Files:**
- `src/components/cocina/CocinaQueue.jsx` — create

**Acceptance Criteria:**
- [ ] Receives `items` prop (array of CocinaItem)
- [ ] Groups items by mesaId
- [ ] Renders mesa sections with header "Mesa #N"
- [ ] Within each mesa, items sorted by timestamp ascending (oldest first)
- [ ] Each item rendered as CocinaItem component
- [ ] Mesa sections sorted by earliest item timestamp
- [ ] Responsive: single column on mobile

---

### T12: CocinaItem.jsx — individual item with status toggle

**Dependencies:** T7, T8

**Files:**
- `src/components/cocina/CocinaItem.jsx` — create

**Acceptance Criteria:**
- [ ] Displays: mesa number, product emoji, product name, quantity, status badge
- [ ] Status badge uses COCINA_STATUS_COLORS for daisyUI badge color
- [ ] Tap on item advances status: pendiente→en_curso→listo
- [ ] When status becomes 'listo', item auto-hides after 3 seconds (CSS animation)
- [ ] Manual dismiss button available before auto-hide timeout
- [ ] Badge text matches status label (pendiente/en_curso/listo)
- [ ] Touch target minimum 44px
- [ ] Smooth transition animation on status change

---

## Phase 6: Takeaway Components

### T13: ParaLlevarPage.jsx — takeaway orders orchestrator

**Dependencies:** T4, T8

**Files:**
- `src/pages/ParaLlevarPage.jsx` — create

**Acceptance Criteria:**
- [ ] Page component with header "Para Llevar"
- [ ] "Nuevo Pedido" button opens TakeawayForm modal
- [ ] Displays TakeawayList component with existing orders
- [ ] Loads takeaways on mount via `loadTakeaways()`
- [ ] Shows empty state when no orders: "No hay pedidos para llevar 📦"
- [ ] Touch target minimum 44px for all interactive elements

---

### T14: TakeawayList.jsx — order cards grid

**Dependencies:** T13, T15

**Files:**
- `src/components/takeaway/TakeawayList.jsx` — create

**Acceptance Criteria:**
- [ ] Receives `orders` prop (array of PedidoLlevar)
- [ ] Renders TakeawayCard for each order
- [ ] Grid layout: 1 column on mobile, 2 columns on tablet+
- [ ] Orders sorted by createdAt descending (newest first)
- [ ] Empty state handled by parent (not this component)

---

### T15: TakeawayCard.jsx — single order card with status

**Dependencies:** T7, T8

**Files:**
- `src/components/takeaway/TakeawayCard.jsx` — create

**Acceptance Criteria:**
- [ ] Displays: customer name, order total, item count, status badge
- [ ] Status badge uses TAKEAWAY_STATUS_COLORS
- [ ] Tap opens order detail (reuses MesaDrawer-like interface — see notes)
- [ ] Status advance button: pendiente→listo→entregado→pagado
- [ ] When status is 'pagado', card shows as completed (dimmed/ghost style)
- [ ] Touch target minimum 44px
- [ ] Shows createdAt as relative time (e.g. "hace 5 min")

**Notes:** For the order detail interface, reuse existing ProductQuickAdd and TicketPreview components by adapting them to work with takeaway orders. The takeawayActivaId in store determines which takeaway is being edited.

---

### T16: TakeawayForm.jsx — customer name input modal

**Dependencies:** T8

**Files:**
- `src/components/takeaway/TakeawayForm.jsx` — create

**Acceptance Criteria:**
- [ ] Modal overlay with customer name text input
- [ ] Input validation: name required, min 2 characters, max 50 characters
- [ ] "Crear Pedido" button disabled until valid name entered
- [ ] On submit: calls `createTakeaway(customerName)`, closes modal
- [ ] Cancel button to dismiss modal
- [ ] Auto-focus on input field when modal opens
- [ ] Touch target minimum 44px for buttons
- [ ] Accessible: role="dialog", aria-modal="true", aria-label

---

## Phase 7: Sales Components

### T17: VentasPage.jsx — daily sales report + CSV export

**Dependencies:** T2, T5, T8

**Files:**
- `src/pages/VentasPage.jsx` — create

**Acceptance Criteria:**
- [ ] Page component with header "Ventas"
- [ ] Date picker to navigate between dates (defaults to today)
- [ ] Displays VentasSummary component for selected date
- [ ] CSV export button in header
- [ ] Loads ventas for selected date via `loadVentas(fecha)`
- [ ] Date picker uses native `<input type="date">` for simplicity
- [ ] Touch target minimum 44px for all interactive elements

---

### T18: VentasSummary.jsx — today's totals + sales list

**Dependencies:** T2, T5

**Files:**
- `src/components/ventas/VentasSummary.jsx` — create

**Acceptance Criteria:**
- [ ] Receives `ventas` prop (array of Venta) and `fecha` prop
- [ ] Displays summary card: total revenue, number of sales (mesas served)
- [ ] Lists individual sales with: time (HH:MM), mesa number, total, payment method
- [ ] Sales sorted by timestamp ascending
- [ ] Shows empty state: "No hay ventas para esta fecha 📊"
- [ ] Payment method displayed as human-readable label (Efectivo / Tarjeta)
- [ ] Responsive layout, single column

---

## Phase 8: UI Modifications

### T19: BottomNav.jsx — add Cocina, Para Llevar, Ventas tabs (horizontal scroll)

**Dependencies:** T7

**Files:**
- `src/components/layout/BottomNav.jsx` — modify

**Acceptance Criteria:**
- [ ] 6 tabs: Mesas, Carta, Menú, Cocina, Para Llevar, Ventas
- [ ] Horizontal scroll enabled via CSS `overflow-x: auto` with `scroll-snap-type: x mandatory`
- [ ] Each tab has `scroll-snap-align: center`
- [ ] On screens < 360px width, tabs show icons only (no labels)
- [ ] Minimum touch target 44px × 44px per tab
- [ ] Cocina tab shows count badge for pending items (from store.cocina length)
- [ ] Active tab styling preserved (text-primary, bolder icon stroke)
- [ ] New icons from lucide-react: Flame (Cocina), Package (Para Llevar), BarChart3 (Ventas)
- [ ] No wrapping to multiple rows

---

### T20: App.jsx — add page mappings

**Dependencies:** T10, T13, T17

**Files:**
- `src/App.jsx` — modify

**Acceptance Criteria:**
- [ ] Imports CocinaPage, ParaLlevarPage, VentasPage
- [ ] Pages map includes: `cocina: CocinaPage`, `para_llevar: ParaLlevarPage`, `ventas: VentasPage`
- [ ] Existing pages (mesas, carta, menu) unchanged
- [ ] No other changes to App.jsx logic

---

### T21: TicketPreview.jsx — cancel button, strikethrough for cancelled items

**Dependencies:** T6, T8

**Files:**
- `src/components/mesa/TicketPreview.jsx` — modify

**Acceptance Criteria:**
- [ ] Each item shows a cancel button (🚫 icon or "Cancelar" text)
- [ ] On cancel: confirmation dialog "¿Cancelar {item_name}?"
- [ ] On confirm: calls `cancelItem(mesaId, itemId)` from store
- [ ] Cancelled items display with strikethrough text (`line-through`) and reduced opacity (`opacity-50`)
- [ ] Cancelled items still visible in ticket (not removed)
- [ ] `calcTotal` excludes cancelled items (handled by T6)
- [ ] Ticket header shows cancelled count if any: "X artículos (Y cancelados)"
- [ ] Cancel button hidden for already-cancelled items
- [ ] Touch target minimum 44px for cancel button

---

## Phase 9: Testing

### T22: Tests for new repositories

**Dependencies:** T2, T3, T4

**Files:**
- `__tests__/db/repositories.ventas.test.js` — create
- `__tests__/db/repositories.cocina.test.js` — create
- `__tests__/db/repositories.pedidosLlevar.test.js` — create

**Acceptance Criteria:**
- [ ] ventas tests: create, getByFecha (filters correctly), getAll, getTotalByDate
- [ ] cocina tests: create, updateStatus (pendiente→en_curso→listo), getPending (excludes 'listo'), getByMesaId
- [ ] pedidosLlevar tests: create, update (sets updatedAt), delete, getAll, getByStatus
- [ ] All tests use fake-indexeddb via existing setup
- [ ] Seed data in beforeEach, cleanup in afterEach
- [ ] Follow existing test patterns (describe/it structure, assertions)

---

### T23: Tests for csvExport and orderHelpers

**Dependencies:** T5, T6

**Files:**
- `__tests__/utils/csvExport.test.js` — create
- `__tests__/utils/orderHelpers.test.js` — modify (extend existing)

**Acceptance Criteria:**
- [ ] csvExport tests: UTF-8 BOM prefix present, correct column headers, date/time formatting, empty array handling
- [ ] orderHelpers extensions: calcTotal excludes cancelled items, createPedidoItem includes status='activo', isCancelled helper, getCancelledCount helper
- [ ] Existing orderHelpers tests still pass (backward compatibility)
- [ ] All tests use fake-indexeddb via existing setup

---

### T24: Tests for kitchen components

**Dependencies:** T11, T12

**Files:**
- `__tests__/components/cocina/CocinaQueue.test.jsx` — create
- `__tests__/components/cocina/CocinaItem.test.jsx` — create

**Acceptance Criteria:**
- [ ] CocinaQueue: renders mesa groups, items sorted by timestamp, empty state
- [ ] CocinaItem: displays all fields (mesa, emoji, name, qty, badge), tap advances status, status badge colors correct
- [ ] Uses @testing-library/react patterns consistent with existing component tests
- [ ] Mock store actions where needed

---

### T25: Tests for takeaway components

**Dependencies:** T14, T15, T16

**Files:**
- `__tests__/components/takeaway/TakeawayList.test.jsx` — create
- `__tests__/components/takeaway/TakeawayCard.test.jsx` — create
- `__tests__/components/takeaway/TakeawayForm.test.jsx` — create

**Acceptance Criteria:**
- [ ] TakeawayList: renders order cards, grid layout, sorted by createdAt
- [ ] TakeawayCard: displays customer name, total, status badge, status advance button
- [ ] TakeawayForm: validates name input (required, min 2 chars), submit creates order, cancel dismisses
- [ ] Uses @testing-library/react patterns
- [ ] Mock store actions where needed

---

### T26: Tests for ventas components

**Dependencies:** T18

**Files:**
- `__tests__/components/ventas/VentasSummary.test.jsx` — create

**Acceptance Criteria:**
- [ ] Renders summary card with total revenue and sales count
- [ ] Lists individual sales with time, mesa, total, payment method
- [ ] Empty state displayed for no ventas
- [ ] Payment method labels human-readable
- [ ] Uses @testing-library/react patterns

---

### T27: Integration tests for closeCuenta atomicity and cancel flow

**Dependencies:** T8, T9, T21

**Files:**
- `__tests__/integration/closeCuenta.test.js` — create
- `__tests__/integration/cancelItem.test.js` — create

**Acceptance Criteria:**
- [ ] closeCuenta integration: venta saved to DB before mesa reset, venta record contains correct snapshot (items, total, mesaId, fecha, paymentMethod), mesa transitions to libre state
- [ ] cancelItem integration: item status changes to 'cancelado', total recalculated excluding cancelled, item visible with strikethrough in TicketPreview
- [ ] Tests use fake-indexeddb + @testing-library/react for component integration
- [ ] Atomicity test: if venta save fails, mesa should NOT be reset

---

## Task Dependency Graph

```
T1 (schema)
├── T2 (ventas repo) ──┬── T5 (csvExport) ──┬── T17 (VentasPage) ── T18 (VentasSummary) ── T26
│                      │                    └── T9 (CerrarCuenta) ── T8 (store) ──┬── T21 (TicketPreview)
│                      └── T8 (store) ──────┘                                    ├── T27 (integration)
│                                                                                └── T22 (repo tests)
├── T3 (cocina repo) ──┬── T8 (store) ──┬── T10 (CocinaPage) ── T11 (CocinaQueue) ── T12 (CocinaItem) ── T24
│                      └── T27          │                                        └── T24
│                                        └── T19 (BottomNav) ── T20 (App.jsx)
├── T4 (pedidosLlevar) ──┬── T8 (store) ──┬── T13 (ParaLlevarPage) ── T14 (TakeawayList) ── T15 (TakeawayCard) ── T25
│                        └── T27          │                                       └── T16 (TakeawayForm) ── T25
│                                          └── T19 (BottomNav)
├── T6 (orderHelpers) ────────────────────── T8 (store) ──┬── T21 (TicketPreview)
│                                                         └── T23 (helpers tests)
├── T7 (constants) ───────────────────────── T8 (store) ──┬── T12 (CocinaItem)
│                                                         ├── T15 (TakeawayCard)
│                                                         └── T19 (BottomNav)
└── T5 (csvExport) ──┬── T17 (VentasPage)
                     └── T23 (csvExport tests)

Parallel groups:
  Group A: T1 (schema migration) — must be first
  Group B: T2, T3, T4, T6, T7 (repos + utils + constants) — can run in parallel after T1
  Group C: T5 (csvExport) — after T2
  Group D: T8, T9 (store + modal) — after T2, T3, T4, T6, T7
  Group E: T10-T12 (kitchen) — after T3, T8
  Group F: T13-T16 (takeaway) — after T4, T8
  Group G: T17-T18 (ventas) — after T2, T5, T8
  Group H: T19-T21 (UI modifications) — after T7, T8, T6
  Group I: T22-T27 (testing) — after respective implementation tasks
```

## Implementation Order (Recommended)

1. **T1** → Schema migration (foundation)
2. **T6, T7** → Utils & constants (no dependencies, needed by many)
3. **T2, T3, T4** → Repositories (parallel, depend only on T1)
4. **T5** → CSV export (depends on T2)
5. **T8, T9** → Store actions + CerrarCuenta modal (depends on T2-T4, T6, T7)
6. **T10-T12** → Kitchen components (depends on T3, T8)
7. **T13-T16** → Takeaway components (depends on T4, T8)
8. **T17-T18** → Sales components (depends on T2, T5, T8)
9. **T19-T21** → UI modifications (depends on T6, T7, T8)
10. **T22-T27** → Tests (depends on respective implementations)
