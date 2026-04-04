import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input input-bordered w-full min-h-[44px] pr-10"
        placeholder="Buscar producto..."
        aria-label="Buscar producto"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle min-h-[44px] min-w-[44px]"
          aria-label="Limpiar búsqueda"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
