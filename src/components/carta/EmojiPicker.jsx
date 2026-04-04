import { EMOJI_GRID } from '../../utils/constants'

export default function EmojiPicker({ onSelect, selected }) {
  return (
    <div className="grid grid-cols-5 gap-2 p-2" role="listbox" aria-label="Seleccionar emoji">
      {EMOJI_GRID.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`btn btn-lg min-h-[44px] min-w-[44px] text-2xl ${
            selected === emoji ? 'btn-primary' : 'btn-ghost'
          }`}
          aria-label={`Emoji ${emoji}`}
          aria-pressed={selected === emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
