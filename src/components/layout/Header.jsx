import { useOfflineStatus } from '../../hooks/useOfflineStatus'

export default function Header() {
  const { isOnline } = useOfflineStatus()

  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold">RestoNotes</h1>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-400' : 'bg-red-400 animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs opacity-90">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </header>
  )
}
