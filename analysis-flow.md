# Análisis del Flujo de Datos: Carta → MesaDrawer/TakeawayCard

## Flujo Actual de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              IndexedDB                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  productos   │    │  categorias  │    │    mesas     │                  │
│  │  - id        │    │  - id        │    │  - id        │                  │
│  │  - nombre    │    │  - key       │    │  - numero    │                  │
│  │  - categoria │────│  - label     │    │  - pedidos[] │                  │
│  │  - activo    │    │  - tipo      │    │  - total     │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           App (initApp)                                      │
│  - loadCategorias() → categoriaRepo.getAll() → set({ categorias })        │
│  - loadProductos() → productoRepo.getAll() → set({ productos })            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         useAppStore (Zustand)                                │
│  state: {                                                                          │
│    categorias: [...],  ←── useCategorias() hook extrae de aquí              │
│    productos: [...],   ←── productos para filtrar                           │
│    ...                                                                          │
│  }                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                                   ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────────┐
│         CartaPage               │   │          MesaDrawer                    │
│                                 │   │                                         │
│  useCategorias() → categorias   │   │  useCategorias() → categorias           │
│  productos from store            │   │  productos from store                   │
│                                 │   │                                         │
│  filtered by search              │   │  filtered by activeTab                   │
│  grouped by category            │   │    - Carta: exclude bebidas              │
│  → ProductoCard                 │   │    - Bebidas: only bebidas               │
│                                 │   │                                         │
│  ✅ FUNCIONA                    │   │  → ProductQuickAdd (filteredProductos)   │
│                                 │   │      ❌ NO FUNCIONA                      │
└─────────────────────────────────┘   └─────────────────────────────────────────┘
```

## Comparación: CartaPage vs MesaDrawer

### CartaPage (FUNCIONA)
```javascript
// Línea 24-29: get category keys from store
const categoryKeys = useMemo(() => {
  if (categorias && categorias.length > 0) {
    return categorias.map((c) => c.key)
  }
  return []
}, [categorias])

// Línea 37-43: groups products, uses categoryKeys
const cats = categoryKeys  // ← 直接用 store 的 keys

// Línea 195: muestra label desde categoryLabelMap
{categoryLabelMap[cat] || cat}
```

### MesaDrawer (NO FUNCIONA)
```javascript
// Línea 45: get categorias from hook
const categorias = useCategorias()

// Línea 48-50: derive from products as fallback
const categoriasFromProducts = productos 
  ? [...new Set(productos.filter(p => p.activo).map(p => p.categoria))]
  : []

// Línea 68-77: filter by activeTab
const filteredProductos = productos.filter((p) => {
  if (!p.activo) return false
  if (activeTab === 'carta') {
    return !beverageCategories.includes(p.categoria)  // ← Should work!
  }
  ...
})

// Línea 392: pass to ProductQuickAdd
<ProductQuickAdd
  productos={filteredProductos}
  categorias={[...categorias, ...derivedCategories]}  // ← Should have all
/>
```

### ProductQuickAdd
```javascript
// Línea 59-63: build allCategories
const allCategories = [...new Set([
  ...categorias.map(c => c.key),    // ← store categories
  ...CATEGORIAS_CARTA,               // ← hardcoded defaults
  ...categories                      // ← derived from products
])]

// Línea 68-70: filter to show only categories with products
allCategories.map((cat) => {
  const items = groupedProducts[cat]
  if (!items || items.length === 0) return null  // ← Solo muestra si hay items!
  ...
})
```

## Puntos de Investigación

### 1. ¿Por qué funciona en CartaPage pero no en MesaDrawer?

Ambas usan `useCategorias()` para obtener categorías del store.

**Diferencia**: 
- CartaPage agrupa manualmente con `categoryKeys`
- MesaDrawer usa `ProductQuickAdd` que tiene su propia lógica de grouping

### 2. Posible causa: productos filtered out antes de llegar a ProductQuickAdd

En MesaDrawer línea 68-77:
```javascript
const filteredProductos = productos.filter((p) => {
  if (!p.activo) return false
  if (activeTab === 'carta') {
    return !beverageCategories.includes(p.categoria)
  }
  ...
})
```

Esto debería mantener todos los productos EXCEPTO los de categoría "bebidas".

### 3. Posible causa: categoría del producto no coincide

Cuando el usuario crea un producto, ¿qué valor tiene el campo `categoria`?
- Debería ser el `key` de la categoría (ej: "tropical_frot")

Si el producto tiene una categoría que no existe en el store, debería aparecer porque `categoriasFromProducts` lo deriva.

## Hipótesis

1. **Los productos SÍ se filtran correctamente** en filteredProductos
2. **El problema está en ProductQuickAdd**: puede ser que no esté recibiendo las categorías correctamente o haya algún issue de renderizado

## Siguiente paso propuesto

Agregar logging para debuggear:
- Ver qué llega a MesaDrawer (categorias, productos)
- Ver qué llega a ProductQuickAdd
- Ver cómo se agrupan los productos