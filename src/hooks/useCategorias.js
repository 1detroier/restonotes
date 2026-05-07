import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { CATEGORIA_LABELS, CATEGORIAS_CARTA } from '../utils/constants'

/**
 * Hook centralizado para acceder a categorías.
 * No usa arrays hardcodeados - derive todo del store.
 * Si el store está vacío, retorna array vacío (no hardcoded).
 */
export function useCategorias() {
  const categorias = useAppStore((state) => state.categorias)

  const result = useMemo(() => {
    if (!categorias || categorias.length === 0) {
      return []
    }
    return categorias
  }, [categorias])

  return result
}

/**
 * Obtiene las keys de todas las categorías del store.
 */
export function useCategoriaKeys() {
  const categorias = useCategorias()
  return useMemo(() => categorias.map((c) => c.key), [categorias])
}

/**
 * Obtiene el label para una categoría (del store, fallback a constants).
 */
export function useCategoriaLabel(categoriaKey) {
  const categorias = useCategorias()
  return useMemo(() => {
    const cat = categorias.find((c) => c.key === categoriaKey)
    if (cat) return cat.label
    // Fallback solo a constants (no a arrays hardcodeados de categorías)
    return CATEGORIA_LABELS[categoriaKey] || categoriaKey
  }, [categoriaKey, categorias])
}

/**
 * Obtiene el label para una categoría SIN hook (para useMemo en componentes).
 */
export function getCategoriaLabel(categoriaKey, categorias) {
  const cat = categorias?.find((c) => c.key === categoriaKey)
  if (cat) return cat.label
  return CATEGORIA_LABELS[categoriaKey] || categoriaKey
}

/**
 * Obtiene las keys de categorías filtradas por tipo.
 * @param {string} tipo - 'carta' | 'menu' | null para todas
 */
export function useCategoriasByTipo(tipo = null) {
  const categorias = useCategorias()
  return useMemo(() => {
    if (!tipo) return categorias
    return categorias.filter((c) => c.tipo === tipo)
  }, [categorias, tipo])
}

/**
 * Obtiene las keys de categorías tipo 'carta' (para filtros de carta).
 */
export function useCategoriasCarta() {
  return useCategoriasByTipo('carta')
}

/**
 * Obtiene las keys de las categorías que tienen productos activos.
 * Útil para determinar qué categorías mostrar.
 * @param {Array} productos - Array de productos del store
 */
export function useCategoriasConProductos(productos) {
  const categorias = useCategorias()
  return useMemo(() => {
    if (!productos || productos.length === 0) return []
    const categoriasConProductos = new Set(
      productos.filter((p) => p.activo).map((p) => p.categoria)
    )
    return categorias.filter((c) => categoriasConProductos.has(c.key))
  }, [categorias, productos])
}