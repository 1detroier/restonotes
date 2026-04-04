import { LayoutGrid, BookOpen, UtensilsCrossed } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { TABS } from '../../utils/constants'

const tabs = [
  { id: TABS.MESAS, label: 'Mesas', icon: LayoutGrid },
  { id: TABS.CARTA, label: 'Carta', icon: BookOpen },
  { id: TABS.MENU, label: 'Menú', icon: UtensilsCrossed }
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <nav className="bg-base-100 border-t border-base-300 flex justify-around items-center h-16 safe-area-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] ${
              isActive
                ? 'text-primary'
                : 'text-base-content/60'
            }`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
