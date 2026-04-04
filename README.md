# RestoNotes 🍽️

PWA de toma de pedidos para restaurantes. 100% offline, sin servidor, sin costos.

## Características

- **14 mesas** con estados visuales (libre, ocupada, cuenta) y timer en tiempo real
- **Carta** con CRUD completo, emojis, filtros por categoría e import/export JSON
- **Menú del Día** configurable con selección múltiple y vista previa
- **Pedidos** con ticket en vivo, agrupado por categoría y cierre de cuenta
- **Offline-first** — funciona sin internet tras la carga inicial
- **Instalable** como app nativa en móviles (PWA)

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | React 18 + Vite |
| Estado | Zustand |
| Base de datos | Dexie.js (IndexedDB) |
| Estilos | Tailwind CSS + DaisyUI |
| PWA | vite-plugin-pwa |
| Testing | Vitest + Testing Library |

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm test
npm test -- --run
```

## Estructura

```
src/
├── components/     # UI components
│   ├── carta/      # Gestión de carta
│   ├── menu/       # Menú del día
│   ├── mesa/       # Grid y drawer de mesas
│   ├── layout/     # App shell, navegación
│   └── ui/         # Componentes compartidos
├── store/          # Zustand stores
├── db/             # Dexie schema + repositories
├── hooks/          # Custom hooks
├── utils/          # Helpers y constantes
└── pages/          # Vistas principales
```

## Deploy

### Vercel

1. Subí el repo a GitHub
2. Importá el proyecto en [vercel.com](https://vercel.com)
3. Detecta Vite automáticamente — no hace falta config extra
4. Deploy automático en cada push

### Netlify

1. Conectá el repo de GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

## Licencia

MIT
