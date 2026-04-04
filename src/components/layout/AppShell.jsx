import Header from './Header'
import BottomNav from './BottomNav'
import Modal from '../ui/Modal'
import ToastContainer from '../ui/ToastContainer'

export default function AppShell({ children }) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 overflow-y-auto bg-base-200">
        {children}
      </main>
      <BottomNav />
      <Modal />
      <ToastContainer />
    </div>
  )
}
