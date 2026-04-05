import { LayoutGrid, BookOpen, UtensilsCrossed, Flame, Package, BarChart3 } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { useAppStore } from '../../store/useAppStore'
import { TABS } from '../../utils/constants'

const tabs = [
  { id: TABS.MESAS, label: 'Mesas', icon: LayoutGrid },
  { id: TABS.CARTA, label: 'Carta', icon: BookOpen },
  { id: TABS.MENU, label: 'Menú', icon: UtensilsCrossed },
  { id: TABS.COCINA, label: 'Cocina', icon: Flame },
  { id: TABS.PARA_LLEVAR, label: 'Para Llevar', icon: Package },
  { id: TABS.VENTAS, label: 'Ventas', icon: BarChart3 }
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useUIStore()
  const { cocina } = useAppStore()

  // Count pending cocina items (pendiente + en_curso)
  const pendingCocinaCount = cocina.filter(
    (c) => c.status === 'pendiente' || c.status === 'en_curso'
  ).length

  return (
    <nav
      className="bg-base-100 border-t border-base-300 h-16 safe-area-bottom overflow-x-auto"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      <div className="flex items-center h-full min-w-max px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 h-full min-h-[44px] min-w-[64px] scroll-snap-align-center transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-base-content/60'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {/* Pending count badge for Cocina tab */}
                {tab.id === TABS.COCINA && pendingCocinaCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-error text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {pendingCocinaCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
