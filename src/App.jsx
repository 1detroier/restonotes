import { useEffect } from 'react'
import { useUIStore } from './store/useUIStore'
import { useAppStore } from './store/useAppStore'
import AppShell from './components/layout/AppShell'
import MesasPage from './pages/MesasPage'
import CartaPage from './pages/CartaPage'
import MenuPage from './pages/MenuPage'
import CocinaPage from './pages/CocinaPage'
import ParaLlevarPage from './pages/ParaLlevarPage'
import VentasPage from './pages/VentasPage'

const pages = {
  mesas: MesasPage,
  carta: CartaPage,
  menu: MenuPage,
  cocina: CocinaPage,
  para_llevar: ParaLlevarPage,
  ventas: VentasPage
}

export default function App() {
  const { activeTab } = useUIStore()
  const { initApp } = useAppStore()

  // Initialize app on mount (bootstrap + load data)
  useEffect(() => {
    initApp()
  }, [initApp])

  const Page = pages[activeTab] || MesasPage

  return (
    <AppShell>
      <Page />
    </AppShell>
  )
}
