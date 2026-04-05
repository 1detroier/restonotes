const randomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 10)
}

export const normalizeVariantGroups = (groups = []) => {
  if (!Array.isArray(groups)) return []
  return groups
    .map((group) => {
      if (!group) return null
      const optionsArray = Array.isArray(group.options) ? group.options : []
      const normalizedOptions = optionsArray
        .map((option) => {
          if (!option) return null
          if (typeof option === 'string') {
            const label = option.trim()
            if (!label) return null
            return { id: randomId(), label }
          }
          const label = (option.label || option.value || '').trim()
          if (!label) return null
          return {
            id: option.id || randomId(),
            label
          }
        })
        .filter(Boolean)

      const name = (group.name || group.label || '').trim()
      if (!name || normalizedOptions.length === 0) return null

      return {
        id: group.id || randomId(),
        name,
        required: group.required !== false,
        options: normalizedOptions
      }
    })
    .filter(Boolean)
}

export const isSameVariantOptions = (a = [], b = []) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b
  if (a.length !== b.length) return false
  return a.every((optA) => {
    const match = b.find((optB) => optB.groupId === optA.groupId)
    if (!match) return false
    return match.optionId === optA.optionId && match.optionLabel === optA.optionLabel
  })
}

export const ensureVariantOptions = (options = []) => {
  if (!Array.isArray(options)) return []
  return options
    .map((opt) => {
      if (!opt) return null
      const optionLabel = (opt.optionLabel || opt.label || '').trim()
      if (!optionLabel) return null
      const groupId = opt.groupId || opt.id || randomId()
      const groupName = opt.groupName || opt.name || ''
      return {
        groupId,
        groupName,
        optionId: opt.optionId || opt.value || randomId(),
        optionLabel
      }
    })
    .filter(Boolean)
}

export const buildVariantOptionsFromSelection = (producto) => {
  if (!producto || !producto.variantGroups) return []
  return normalizeVariantGroups(producto.variantGroups)
}

export const createVariantOptionId = randomId
