import { create } from 'zustand'
import { bootstrapMesas, seedProductos } from '../db/bootstrap'
import { mesaRepo } from '../db/repositories/mesas'
import { productoRepo } from '../db/repositories/productos'
import { menuDiaRepo } from '../db/repositories/menuDia'
import { createPedidoItem, calcTotal } from '../utils/orderHelpers'

/**
 * App Store - reactive mirror of Dexie data.
 * All CRUD goes through Dexie repositories first, then this store syncs.
 */
export const useAppStore = create((set, get) => ({
  // State
  mesas: [],
  productos: [],
  menuDelDia: null,
  mesaActivaId: null,
  loading: false,

  // Actions
  initApp: async () => {
    set({ loading: true })
    try {
      // Bootstrap: create mesas and seed products if empty
      await bootstrapMesas()
      await seedProductos()

      // Load all data from Dexie
      await get().loadMesas()
      await get().loadProductos()
      await get().loadMenuDelDia()
    } catch (error) {
      console.error('[AppStore] initApp failed:', error)
    } finally {
      set({ loading: false })
    }
  },

  loadMesas: async () => {
    try {
      const mesas = await mesaRepo.getAll()
      set({ mesas })
    } catch (error) {
      console.error('[AppStore] loadMesas failed:', error)
    }
  },

  loadProductos: async () => {
    try {
      const productos = await productoRepo.getAll()
      set({ productos })
    } catch (error) {
      console.error('[AppStore] loadProductos failed:', error)
    }
  },

  loadMenuDelDia: async () => {
    try {
      const menus = await menuDiaRepo.getAll()
      // Get the most recent active menu
      const active = menus.find((m) => m.activo) || menus[menus.length - 1] || null
      set({ menuDelDia: active })
    } catch (error) {
      console.error('[AppStore] loadMenuDelDia failed:', error)
    }
  },

  setMesaActiva: (id) => {
    set({ mesaActivaId: id })
  },

  // T3: Producto CRUD actions
  addProducto: async (data) => {
    try {
      const now = new Date().toISOString()
      const producto = {
        ...data,
        activo: true,
        createdAt: now,
        updatedAt: now
      }
      await productoRepo.create(producto)
      await get().loadProductos()
    } catch (error) {
      console.error('[AppStore] addProducto failed:', error)
      throw error
    }
  },

  updateProducto: async (id, data) => {
    try {
      await productoRepo.update(id, {
        ...data,
        updatedAt: new Date().toISOString()
      })
      await get().loadProductos()
    } catch (error) {
      console.error('[AppStore] updateProducto failed:', error)
      throw error
    }
  },

  toggleProducto: async (id) => {
    try {
      const producto = await productoRepo.getById(id)
      if (producto) {
        await productoRepo.update(id, {
          activo: !producto.activo,
          updatedAt: new Date().toISOString()
        })
        await get().loadProductos()
      }
    } catch (error) {
      console.error('[AppStore] toggleProducto failed:', error)
      throw error
    }
  },

  deleteProducto: async (id) => {
    try {
      await productoRepo.delete(id)
      await get().loadProductos()
    } catch (error) {
      console.error('[AppStore] deleteProducto failed:', error)
      throw error
    }
  },

  // T4: Menu actions
  saveMenuDelDia: async (menuData) => {
    try {
      const now = new Date().toISOString()
      // Deactivate all existing menus first
      await menuDiaRepo.deactivateAll()
      // Create new menu
      const menu = {
        ...menuData,
        activo: true,
        createdAt: now,
        updatedAt: now
      }
      await menuDiaRepo.create(menu)
      await get().loadMenuDelDia()
    } catch (error) {
      console.error('[AppStore] saveMenuDelDia failed:', error)
      throw error
    }
  },

  loadMenuHistorial: async (limit = 10) => {
    try {
      return await menuDiaRepo.getHistorial(limit)
    } catch (error) {
      console.error('[AppStore] loadMenuHistorial failed:', error)
      return []
    }
  },

  // ============ Order Management Actions ============

  /**
   * Add a product to a mesa's order.
   * If mesa is 'libre', transitions to 'ocupada' and sets openedAt.
   * @param {number} mesaId - Mesa ID
   * @param {Object} producto - Producto object
   * @param {number} cantidad - Quantity (default 1)
   * @param {string} tipo - 'carta' | 'menu' (default 'carta')
   * @param {string} nota - Optional note
   */
  addItemToMesa: async (mesaId, producto, cantidad = 1, tipo = 'carta', nota = '') => {
    try {
      const { mesas } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const pedidos = mesa.pedidos || []
      const newItem = createPedidoItem(producto, cantidad, tipo, nota)

      // Check if same productoId already exists — sum quantities
      const existingIdx = pedidos.findIndex(
        (p) => p.productoId === producto.id && p.categoria === producto.categoria
      )

      if (existingIdx >= 0) {
        pedidos[existingIdx].cantidad += cantidad
        pedidos[existingIdx].subtotal = pedidos[existingIdx].precio * pedidos[existingIdx].cantidad
      } else {
        pedidos.push(newItem)
      }

      const total = calcTotal(pedidos)
      const updates = { pedidos, total }

      // Transition from libre to ocupada
      if (mesa.estado === 'libre') {
        updates.estado = 'ocupada'
        updates.openedAt = new Date().toISOString()
      }

      await mesaRepo.updatePedidos(mesaId, pedidos, total)
      if (updates.estado) {
        await mesaRepo.update(mesaId, { estado: updates.estado, openedAt: updates.openedAt })
      }
      await get().loadMesas()
    } catch (error) {
      console.error('[AppStore] addItemToMesa failed:', error)
      throw error
    }
  },

  /**
   * Remove an item from a mesa's order by tempId.
   * @param {number} mesaId - Mesa ID
   * @param {string} tempId - PedidoItem id to remove
   */
  removeItemFromMesa: async (mesaId, tempId) => {
    try {
      const { mesas } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const pedidos = (mesa.pedidos || []).filter((p) => p.id !== tempId)
      const total = calcTotal(pedidos)

      await mesaRepo.updatePedidos(mesaId, pedidos, total)
      await get().loadMesas()
    } catch (error) {
      console.error('[AppStore] removeItemFromMesa failed:', error)
      throw error
    }
  },

  /**
   * Update quantity of an existing item in a mesa's order.
   * @param {number} mesaId - Mesa ID
   * @param {string} tempId - PedidoItem id
   * @param {number} newQty - New quantity
   */
  updateItemQuantity: async (mesaId, tempId, newQty) => {
    try {
      const { mesas } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const pedidos = (mesa.pedidos || []).map((p) => {
        if (p.id === tempId) {
          return { ...p, cantidad: newQty, subtotal: p.precio * newQty }
        }
        return p
      })
      const total = calcTotal(pedidos)

      await mesaRepo.updatePedidos(mesaId, pedidos, total)
      await get().loadMesas()
    } catch (error) {
      console.error('[AppStore] updateItemQuantity failed:', error)
      throw error
    }
  },

  /**
   * Close a mesa's account — reset to libre state.
   * @param {number} mesaId - Mesa ID
   */
  closeCuenta: async (mesaId) => {
    try {
      await mesaRepo.closeCuenta(mesaId)
      await get().loadMesas()
    } catch (error) {
      console.error('[AppStore] closeCuenta failed:', error)
      throw error
    }
  }
}))
