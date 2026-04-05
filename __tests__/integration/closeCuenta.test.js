import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '../../src/db/schema'
import { mesaRepo } from '../../src/db/repositories/mesas'
import { ventaRepo } from '../../src/db/repositories/ventas'
import { createPedidoItem, calcTotal } from '../../src/utils/orderHelpers'

describe('closeCuenta atomicity', () => {
  beforeEach(async () => {
    await db.mesas.clear()
    await db.ventas.clear()

    // Seed an occupied mesa with orders
    const now = new Date().toISOString()
    await db.mesas.add({
      id: 5,
      numero: 5,
      estado: 'ocupada',
      pedidos: [
        { id: 'a', nombre: 'Café', precio: 1.5, cantidad: 2, categoria: 'bebidas', subtotal: 3 },
        { id: 'b', nombre: 'Ensalada', precio: 8, cantidad: 1, categoria: 'entrantes', subtotal: 8 }
      ],
      total: 11,
      openedAt: now,
      createdAt: now,
      updatedAt: now
    })
  })

  afterEach(async () => {
    await db.mesas.clear()
    await db.ventas.clear()
  })

  it('saves venta to DB before resetting mesa', async () => {
    const mesa = await db.mesas.get(5)
    expect(mesa.estado).toBe('ocupada')
    expect(mesa.pedidos).toHaveLength(2)

    // Simulate closeCuenta flow: save venta first, then reset mesa
    const now = new Date()
    const venta = {
      mesaId: mesa.numero,
      fecha: now.toISOString().substring(0, 10),
      timestamp: now.toISOString(),
      total: mesa.total,
      items: JSON.parse(JSON.stringify(mesa.pedidos)),
      paymentMethod: 'efectivo'
    }
    await ventaRepo.create(venta)
    await mesaRepo.closeCuenta(5)

    // Verify venta was saved
    const ventas = await ventaRepo.getAll()
    expect(ventas).toHaveLength(1)
    expect(ventas[0].mesaId).toBe(5)
    expect(ventas[0].total).toBe(11)
    expect(ventas[0].items).toHaveLength(2)
    expect(ventas[0].paymentMethod).toBe('efectivo')

    // Verify mesa was reset
    const resetMesa = await db.mesas.get(5)
    expect(resetMesa.estado).toBe('libre')
    expect(resetMesa.pedidos).toEqual([])
    expect(resetMesa.total).toBe(0)
    expect(resetMesa.openedAt).toBeNull()
  })

  it('venta record contains correct snapshot', async () => {
    const mesa = await db.mesas.get(5)
    const now = new Date()
    const ventaId = await ventaRepo.create({
      mesaId: mesa.numero,
      fecha: now.toISOString().substring(0, 10),
      timestamp: now.toISOString(),
      total: mesa.total,
      items: JSON.parse(JSON.stringify(mesa.pedidos)),
      paymentMethod: 'tarjeta'
    })

    const savedVenta = await db.ventas.get(ventaId)
    expect(savedVenta.fecha).toBe(now.toISOString().substring(0, 10))
    expect(savedVenta.items[0].nombre).toBe('Café')
    expect(savedVenta.items[1].nombre).toBe('Ensalada')
    expect(savedVenta.paymentMethod).toBe('tarjeta')
  })

  it('mesa transitions to libre state after venta save', async () => {
    const mesa = await db.mesas.get(5)
    const now = new Date()
    await ventaRepo.create({
      mesaId: mesa.numero,
      fecha: now.toISOString().substring(0, 10),
      timestamp: now.toISOString(),
      total: mesa.total,
      items: JSON.parse(JSON.stringify(mesa.pedidos)),
      paymentMethod: 'efectivo'
    })
    await mesaRepo.closeCuenta(5)

    const afterMesa = await db.mesas.get(5)
    expect(afterMesa.estado).toBe('libre')
  })
})
