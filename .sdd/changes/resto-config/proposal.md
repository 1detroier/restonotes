# Proposal: resto-config

## Intent

Agregar dos features al sistema RestoNotes:
1. **Ordenar productos alfabéticamente por categoría** en la página de Carta - los productos se muestran agrupados por categoría con headers, y dentro de cada grupo se ordenan alfabéticamente.
2. **Página de configuración** con selector de número de mesas (persistente) y CRUD de categorías de la carta.

## Scope

### In Scope
- Modificar CartaPage para mostrar productos agrupados por categoría y ordenados alfabéticamente dentro de cada grupo
- Agregar nueva pestaña "Configuración" a la navegación
- Agregar selector de número de mesas en la página de configuración
- Agregar gestión de categorías (CRUD) en la página de configuración
- Persistir configuraciones en localStorage (para numero de mesas) y en IndexedDB (para categorías personalizadas)

### Out of Scope
- Modificación de la lógica de pedidos o cocina
- Export/import de categorías
- Themes o personalización visual adicional

## Capabilities

### New Capabilities
- `carta-agrupada`: Mostrar productos agrupados por categoría con headers de sección, ordenados alfabéticamente dentro de cada grupo
- `configuracion-mesas`: Selector persisted de número de mesas (localStorage)
- `configuracion-categorias`: CRUD de categorías personalizadas en IndexedDB

### Modified Capabilities
- None (son features completamente nuevos)

## Approach

**Para productos alfabéticos por categoría:**
- Agregar modo de visualización "grouped" en CartaPage
- Agrupar productos por categoría usando useMemo
- Ordenar alfabéticamente dentro de cada grupo con localeCompare
- Mostrar headers de sección con el nombre de la categoría

**Para página de configuración:**
- Agregar TABS.CONFIG a constants.js
- Crear ConfigPage.jsx con selector de número de mesas y lista de categorías
- Agregar botón de configuración en BottomNav.jsx
- Usar useUIStore persist para mesaCount
- Crear tabla 'categorias' en IndexedDB (Dexie) para almacenar categorías personalizadas

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/CartaPage.jsx` | Modified | Agregar grouping y ordenamiento alfabético |
| `src/utils/constants.js` | Modified | Agregar TABS.CONFIG |
| `src/store/useUIStore.js` | Modified | Agregar mesaCount al estado persistido |
| `src/db/schema.js` | Modified | Agregar versión 7 con tabla categorias |
| `src/db/repositories/categorias.js` | New | Repositorio CRUD para categorías |
| `src/components/layout/BottomNav.jsx` | Modified | Agregar tab Configuración |
| `src/pages/ConfigPage.jsx` | New | Nueva página de configuración |
| `src/components/config/` | New | Componentes UI para configuración |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Conflicto con categorías existentes en carta.json | Low | Las categorías personalizadas se fusionan con las default |
| Performance con muchos productos | Low | Usar useMemo para grouping |

## Rollback Plan

1. Revertir cambios en constants.js (quitar TABS.CONFIG)
2. Eliminar ConfigPage.jsx y componentes en src/components/config/
3. Quitar mesaCount de useUIStore partialize
4. Revertir schema.js (quitar versión 7)
5. Eliminar repositorio de categorias
6. Revertir BottomNav.jsx

## Dependencies

- Ninguno - feature self-contained

## Success Criteria

- [ ] CartaPage agrupa productos por categoría con headers
- [ ] Productos ordenados alfabéticamente dentro de cada categoría
- [ ] Nueva pestaña "Configuración" visible en navegación
- [ ] Selector de número de mesas persists al recargar página
- [ ] CRUD de categorías funcional (crear, editar, eliminar)
- [ ] Categorías persistidas en IndexedDB