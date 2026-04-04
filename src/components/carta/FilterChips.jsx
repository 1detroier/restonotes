import { CATEGORIAS, CATEGORIA_LABELS } from '../../utils/constants'

export default function FilterChips({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange('')}
        className={`btn btn-sm whitespace-nowrap min-h-[44px] ${
          activeCategory === '' ? 'btn-primary' : 'btn-ghost'
        }`}
      >
        Todos
      </button>
      {CATEGORIAS.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`btn btn-sm whitespace-nowrap min-h-[44px] ${
            activeCategory === cat ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          {CATEGORIA_LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
