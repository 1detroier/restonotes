import { create } from 'zustand'
import { bootstrapMesas, seedProductos } from '../db/bootstrap'
import { mesaRepo } from '../db/repositories/mesas'
import { productoRepo } from '../db/repositories/productos'
import { menuDiaRepo } from '../db/repositories/menuDia'
import { ventaRepo } from '../db/repositories/ventas'
import { cocinaRepo } from '../db/repositories/cocina'
import { pedidosLlevarRepo } from '../db/repositories/pedidosLlevar'
import { createPedidoItem, calcTotal, isCancelled, formatVariantLabel } from '../utils/orderHelpers'
import { normalizeVariantGroups, isSameVariantOptions } from '../utils/variants'
import { COCINA_STATUS } from '../utils/constants'

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
  // Kitchen & sales state
  ventas: [],
  cocina: [],
  // Takeaway state
  takeaways: [],
  takeawayActivaId: null,

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
      await get().loadTakeaways()
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
      const normalizedVariants = data.hasVariants ? normalizeVariantGroups(data.variantGroups) : []
      const producto = {
        ...data,
        hasVariants: data.hasVariants && normalizedVariants.length > 0,
        variantGroups: data.hasVariants ? normalizedVariants : [],
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
      const normalizedVariants = data.hasVariants ? normalizeVariantGroups(data.variantGroups) : []
      await productoRepo.update(id, {
        ...data,
        hasVariants: data.hasVariants && normalizedVariants.length > 0,
        variantGroups: data.hasVariants ? normalizedVariants : [],
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
  addItemToMesa: async (mesaId, producto, cantidad = 1, tipo = 'carta', nota = '', variantOptions = []) => {
    try {
      const { mesas } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const pedidos = mesa.pedidos || []
      const normalizedVariants = Array.isArray(variantOptions) ? variantOptions : []
      const newItem = createPedidoItem(producto, cantidad, tipo, nota, normalizedVariants)

      // Menus always create a new item since each combination is unique
      if (tipo === 'menu') {
        pedidos.push(newItem)
      } else {
        // Check if same productoId already exists — sum quantities
        const existingIdx = pedidos.findIndex(
          (p) =>
            p.productoId === producto.id &&
            p.categoria === producto.categoria &&
            isSameVariantOptions(p.variantOptions, normalizedVariants)
        )

        if (existingIdx >= 0) {
          pedidos[existingIdx].cantidad += cantidad
          pedidos[existingIdx].subtotal = pedidos[existingIdx].precio * pedidos[existingIdx].cantidad
        } else {
          pedidos.push(newItem)
        }
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
   * Close a mesa's account — save venta snapshot then reset to libre state.
   * Wrapped in atomic operation: venta saved BEFORE mesa reset.
   * @param {number} mesaId - Mesa ID
   * @param {string} paymentMethod - 'efectivo' | 'tarjeta'
   */
  closeCuenta: async (mesaId, paymentMethod = 'efectivo') => {
    try {
      const { mesas, takeaways } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const linkedTakeaways = (takeaways || []).filter(
        (order) => order.mesaId === mesaId && order.status !== 'pagado'
      )

      const mesaItems = JSON.parse(JSON.stringify(mesa.pedidos || []))
      const takeawayItems = linkedTakeaways.flatMap((order) => JSON.parse(JSON.stringify(order.pedidos || [])))
      const combinedItems = [...mesaItems, ...takeawayItems]
      const takeawayTotal = linkedTakeaways.reduce((sum, order) => sum + (order.total || 0), 0)

      const now = new Date()
      const venta = {
        mesaId: mesa.numero,
        fecha: now.toISOString().substring(0, 10),
        timestamp: now.toISOString(),
        total: (mesa.total || 0) + takeawayTotal,
        items: combinedItems,
        paymentMethod
      }
      await ventaRepo.create(venta)

      if (linkedTakeaways.length > 0) {
        for (const order of linkedTakeaways) {
          await pedidosLlevarRepo.delete(order.id)
        }
      }

      await mesaRepo.closeCuenta(mesaId)
      await get().loadMesas()
      if (linkedTakeaways.length > 0) {
        await get().loadTakeaways()
      }
    } catch (error) {
      console.error('[AppStore] closeCuenta failed:', error)
      throw error
    }
  },

  cancelMesaPedido: async (mesaId) => {
    try {
      await mesaRepo.closeCuenta(mesaId)
      await get().loadMesas()
    } catch (error) {
      console.error('[AppStore] cancelMesaPedido failed:', error)
      throw error
    }
  },

  // ============ Item Cancellation ============

  /**
   * Cancel an individual order item (mark as 'cancelado').
   * @param {number} mesaId - Mesa ID
   * @param {string} itemId - PedidoItem id
   */
  cancelItem: async (mesaId, itemId) => {
    try {
      const { mesas } = get()
      const mesa = mesas.find((m) => m.id === mesaId)
      if (!mesa) throw new Error(`Mesa ${mesaId} not found`)

      const pedidos = (mesa.pedidos || []).map((p) => {
        if (p.id === itemId) {
          return { ...p, status: 'cancelado' }
        }
        return p
      })
      const total = calcTotal(pedidos)

      await mesaRepo.updatePedidos(mesaId, pedidos, total)

      // Update local state directly
      set((state) => ({
        mesas: state.mesas.map((m) =>
          m.id === mesaId ? { ...m, pedidos, total } : m
        )
      }))
    } catch (error) {
      console.error('[AppStore] cancelItem failed:', error)
      throw error
    }
  },

  // ============ Ventas (Sales) ============

  /**
   * Save a venta snapshot (used by closeCuenta and takeaway pay).
   * @param {Object} ventaData - Venta record
   * @returns {Promise<number>} Venta ID
   */
  saveVenta: async (ventaData) => {
    try {
      return await ventaRepo.create(ventaData)
    } catch (error) {
      console.error('[AppStore] saveVenta failed:', error)
      throw error
    }
  },

  /**
   * Load ventas, optionally filtered by date.
   * @param {string} fecha - YYYY-MM-DD (optional, defaults to today)
   */
  loadVentas: async (fecha) => {
    try {
      const date = fecha || new Date().toISOString().substring(0, 10)
      const ventas = await ventaRepo.getByFecha(date)
      set({ ventas })
    } catch (error) {
      console.error('[AppStore] loadVentas failed:', error)
    }
  },

  /**
   * Delete a venta record (for error correction).
   * @param {number} id - Venta ID
   */
  deleteVenta: async (id) => {
    try {
      await ventaRepo.delete(id)
    } catch (error) {
      console.error('[AppStore] deleteVenta failed:', error)
      throw error
    }
  },

  // ============ Cocina (Kitchen) ============

/**
    * Load ALL cocina items into store (including completed and cancelled).
    */
   loadCocina: async () => {
     try {
       const cocina = await cocinaRepo.getAll()
       set({ cocina })
     } catch (error) {
       console.error('[AppStore] loadCocina failed:', error)
     }
   },

/**
    * Advance a cocina item's status: pendiente → preparando → listo.
    * Items marked as 'listo' stay in the list (moved to completed section).
    * @param {number} cocinaId - Cocina item ID
    */
   advanceCocinaStatus: async (cocinaId) => {
     try {
       const { cocina } = get()
       const item = cocina.find((c) => c.id === cocinaId)
       if (!item) return

       const statusFlow = [COCINA_STATUS.PENDIENTE, COCINA_STATUS.PREPARANDO, COCINA_STATUS.LISTO]
       const currentIdx = statusFlow.indexOf(item.status)
       if (currentIdx < statusFlow.length - 1) {
         const newStatus = statusFlow[currentIdx + 1]
         await cocinaRepo.updateStatus(cocinaId, newStatus)
         // Reload all cocina items (including completed ones stay visible)
         await get().loadCocina()
       }
     } catch (error) {
       console.error('[AppStore] advanceCocinaStatus failed:', error)
     }
   },

   /**
    * Mark all items from a mesa as 'preparando'.
    * @param {number} mesaId - Mesa ID
    */
   startPreparingMesa: async (mesaId) => {
     try {
       const targetId = typeof mesaId === 'string' ? Number(mesaId) : mesaId
       const mesaItems = await cocinaRepo.getByMesaId(targetId)
       await Promise.all(
         mesaItems
           .filter((item) => item.status === COCINA_STATUS.PENDIENTE)
           .map((item) => cocinaRepo.updateStatus(item.id, COCINA_STATUS.PREPARANDO))
       )
       await get().loadCocina()
     } catch (error) {
       console.error('[AppStore] startPreparingMesa failed:', error)
       throw error
     }
   },

   completeMesaCocina: async (mesaId) => {
     try {
       const targetId = typeof mesaId === 'string' ? Number(mesaId) : mesaId
       const mesaItems = await cocinaRepo.getByMesaId(targetId)
       // Only mark NOT-canceled items as 'listo'
       await Promise.all(
         mesaItems
           .filter((item) => item.status !== COCINA_STATUS.CANCELADO)
           .map((item) => cocinaRepo.updateStatus(item.id, COCINA_STATUS.LISTO))
       )
       // Reload all (completed stay visible in history)
       await get().loadCocina()
     } catch (error) {
       console.error('[AppStore] completeMesaCocina failed:', error)
       throw error
     }
   },

   cancelMesaCocina: async (mesaId) => {
     try {
       const targetId = typeof mesaId === 'string' ? Number(mesaId) : mesaId
       const mesaItems = await cocinaRepo.getByMesaId(targetId)
       await Promise.all(
         mesaItems
           .filter((item) => item.status !== COCINA_STATUS.LISTO)
           .map((item) => cocinaRepo.updateStatus(item.id, COCINA_STATUS.CANCELADO))
       )
       await get().loadCocina()
     } catch (error) {
       console.error('[AppStore] cancelMesaCocina failed:', error)
       throw error
     }
   },

  /**
   * Sync cocina table with current occupied mesas' pedidos.
   * Adds new items that aren't in cocina yet.
   */
  syncCocina: async () => {
    try {
      const { mesas, takeaways } = get()
      const occupiedMesas = mesas.filter((m) => m.estado === 'ocupada' && m.pedidos && m.pedidos.length > 0)

      for (const mesa of occupiedMesas) {
        const existingItems = await cocinaRepo.getByMesaId(mesa.id)
        const existingPedidoIds = new Set(existingItems.map((c) => c.pedidoId))

        for (const pedido of mesa.pedidos) {
          if (!existingPedidoIds.has(pedido.id) && !isCancelled(pedido)) {
            await cocinaRepo.create({
              mesaId: mesa.id,
              pedidoId: pedido.id,
              productoNombre: pedido.nombre,
              cantidad: pedido.cantidad,
              precio: pedido.precio,
              status: COCINA_STATUS.PENDIENTE,
              timestamp: new Date().toISOString(),
              nota: pedido.nota || '',
              variantLabel: formatVariantLabel(pedido.variantOptions),
              emoji: pedido.emoji || ''
            })
          }
        }
      }
      const activeTakeaways = (takeaways || []).filter(
        (order) => order.pedidos && order.pedidos.length > 0 && order.status !== 'pagado'
      )

      for (const order of activeTakeaways) {
        const mesaKey = order.mesaId != null ? order.mesaId : -order.id
        const existingItems = await cocinaRepo.getByMesaId(mesaKey)
        const existingPedidoIds = new Set(existingItems.map((c) => c.pedidoId))

        for (const pedido of order.pedidos) {
          if (!existingPedidoIds.has(pedido.id) && !isCancelled(pedido)) {
            await cocinaRepo.create({
              mesaId: mesaKey,
              pedidoId: pedido.id,
              productoNombre: pedido.nombre,
              cantidad: pedido.cantidad,
              precio: pedido.precio,
              status: COCINA_STATUS.PENDIENTE,
              timestamp: new Date().toISOString(),
              nota: pedido.nota || '',
              variantLabel: formatVariantLabel(pedido.variantOptions),
              emoji: pedido.emoji || ''
            })
          }
        }
      }

      await get().loadCocina()
    } catch (error) {
      console.error('[AppStore] syncCocina failed:', error)
    }
  },

  // ============ Takeaway Orders ============

  /**
   * Create a new takeaway order.
   * @param {string} customerName - Customer name
   * @returns {Promise<number>} Order ID
   */
  createTakeaway: async (customerName, options = {}) => {
    try {
      const now = new Date().toISOString()
      const mesaId = options.mesaId != null ? Number(options.mesaId) : null
      const pickupAt = options.pickupAt || null
      const order = {
        customerName,
        pedidos: [],
        status: 'pendiente',
        total: 0,
        createdAt: now,
        updatedAt: now,
        mesaId,
        pickupAt
      }
      const id = await pedidosLlevarRepo.create(order)
      await get().loadTakeaways()
      return id
    } catch (error) {
      console.error('[AppStore] createTakeaway failed:', error)
      throw error
    }
  },

  /**
   * Update a takeaway order's fields.
   * @param {number} id - Order ID
   * @param {Object} data - Fields to update
   */
  updateTakeaway: async (id, data) => {
    try {
      await pedidosLlevarRepo.update(id, data)
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] updateTakeaway failed:', error)
      throw error
    }
  },

  /**
   * Delete a takeaway order.
   * @param {number} id - Order ID
   */
  deleteTakeaway: async (id) => {
    try {
      await pedidosLlevarRepo.delete(id)
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] deleteTakeaway failed:', error)
      throw error
    }
  },

  /**
   * Load all takeaway orders into store.
   */
  loadTakeaways: async () => {
    try {
      const takeaways = await pedidosLlevarRepo.getAll()
      set({ takeaways })
    } catch (error) {
      console.error('[AppStore] loadTakeaways failed:', error)
    }
  },

  /**
   * Add an item to a takeaway order.
   * @param {number} takeawayId - Order ID
   * @param {Object} producto - Producto object
   * @param {number} cantidad - Quantity
   * @param {string} tipo - 'carta' | 'menu'
   * @param {string} nota - Optional note
   */
  addTakeawayItem: async (takeawayId, producto, cantidad = 1, tipo = 'carta', nota = '', variantOptions = []) => {
    try {
      const { takeaways } = get()
      const order = takeaways.find((t) => t.id === takeawayId)
      if (!order) throw new Error(`Takeaway order ${takeawayId} not found`)

      const pedidos = order.pedidos || []
      const normalizedVariants = Array.isArray(variantOptions) ? variantOptions : []
      const newItem = createPedidoItem(producto, cantidad, tipo, nota, normalizedVariants)

      // Menus always create a new item since each combination is unique
      if (tipo === 'menu') {
        pedidos.push(newItem)
      } else {
        // Check if same productoId already exists
        const existingIdx = pedidos.findIndex(
          (p) =>
            p.productoId === producto.id &&
            p.categoria === producto.categoria &&
            isSameVariantOptions(p.variantOptions, normalizedVariants)
        )

        if (existingIdx >= 0) {
          pedidos[existingIdx].cantidad += cantidad
          pedidos[existingIdx].subtotal = pedidos[existingIdx].precio * pedidos[existingIdx].cantidad
        } else {
          pedidos.push(newItem)
        }
      }

      const total = calcTotal(pedidos)
      await pedidosLlevarRepo.update(takeawayId, { pedidos, total })
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] addTakeawayItem failed:', error)
      throw error
    }
  },

  /**
   * Pay a takeaway order — save venta and mark as pagado.
   * @param {number} id - Order ID
   * @param {string} paymentMethod - 'efectivo' | 'tarjeta'
   */
  payTakeaway: async (id, paymentMethod = 'efectivo') => {
    try {
      const { takeaways } = get()
      const order = takeaways.find((t) => t.id === id)
      if (!order) throw new Error(`Takeaway order ${id} not found`)

      // Save venta snapshot
      const now = new Date()
      await ventaRepo.create({
        mesaId: null, // null for takeaway
        fecha: now.toISOString().substring(0, 10),
        timestamp: now.toISOString(),
        total: order.total || 0,
        items: JSON.parse(JSON.stringify(order.pedidos || [])),
        paymentMethod
      })

      await pedidosLlevarRepo.delete(id)
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] payTakeaway failed:', error)
      throw error
    }
  },

  /**
   * Set the active takeaway order being edited.
   * @param {number|null} id - Takeaway order ID or null
   */
  setTakeawayActiva: (id) => {
    set({ takeawayActivaId: id })
  },

  /**
   * Remove an item from a takeaway order.
   */
  removeTakeawayItem: async (takeawayId, itemId) => {
    try {
      const { takeaways } = get()
      const order = takeaways.find((t) => t.id === takeawayId)
      if (!order) throw new Error(`Takeaway order ${takeawayId} not found`)

      const pedidos = (order.pedidos || []).filter((p) => p.id !== itemId)
      const total = calcTotal(pedidos)
      await pedidosLlevarRepo.update(takeawayId, { pedidos, total })
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] removeTakeawayItem failed:', error)
      throw error
    }
  },

  /**
   * Update quantity of an item in a takeaway order.
   */
  updateTakeawayItemQty: async (takeawayId, itemId, newQty) => {
    try {
      const { takeaways } = get()
      const order = takeaways.find((t) => t.id === takeawayId)
      if (!order) throw new Error(`Takeaway order ${takeawayId} not found`)

      const pedidos = (order.pedidos || []).map((p) => {
        if (p.id === itemId) {
          return { ...p, cantidad: newQty, subtotal: p.precio * newQty }
        }
        return p
      })
      const total = calcTotal(pedidos)
      await pedidosLlevarRepo.update(takeawayId, { pedidos, total })
      await get().loadTakeaways()
    } catch (error) {
      console.error('[AppStore] updateTakeawayItemQty failed:', error)
      throw error
    }
  }
}))
