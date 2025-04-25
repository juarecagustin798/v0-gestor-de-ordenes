"use server"

import { revalidatePath } from "next/cache"
import { type Order, OrderStatus } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export async function createOrder(
  orderData: Partial<Order>,
): Promise<{ success: boolean; message: string; order?: Order }> {
  try {
    // Verificar que los datos requeridos estén presentes
    if (!orderData.clientId) {
      return { success: false, message: "El ID del cliente es requerido" }
    }

    // Crear un nuevo ID para la orden
    const orderId = uuidv4()

    // Crear la nueva orden
    const newOrder: Order = {
      id: orderId,
      clientId: orderData.clientId,
      clientName: orderData.clientName || "Cliente sin nombre",
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData,
    }

    // Guardar la orden en localStorage (simulando una base de datos)
    let orders: Order[] = []
    try {
      const storedOrders = localStorage.getItem("orders")
      if (storedOrders) {
        orders = JSON.parse(storedOrders)
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error)
    }

    orders.push(newOrder)
    localStorage.setItem("orders", JSON.stringify(orders))

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/orders")

    return { success: true, message: "Orden creada exitosamente", order: newOrder }
  } catch (error) {
    console.error("Error al crear la orden:", error)
    return {
      success: false,
      message: `Error al crear la orden: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    // Obtener órdenes de localStorage (simulando una base de datos)
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      return JSON.parse(storedOrders)
    }
    return []
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const orders = await getOrders()
    return orders.find((order) => order.id === id) || null
  } catch (error) {
    console.error("Error al obtener la orden:", error)
    return null
  }
}

export async function updateOrder(
  id: string,
  orderData: Partial<Order>,
): Promise<{ success: boolean; message: string; order?: Order }> {
  try {
    const orders = await getOrders()
    const orderIndex = orders.findIndex((order) => order.id === id)

    if (orderIndex === -1) {
      return { success: false, message: "Orden no encontrada" }
    }

    // Actualizar la orden
    const updatedOrder = {
      ...orders[orderIndex],
      ...orderData,
      updatedAt: new Date().toISOString(),
    }

    orders[orderIndex] = updatedOrder

    // Guardar las órdenes actualizadas
    localStorage.setItem("orders", JSON.stringify(orders))

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/orders")

    return { success: true, message: "Orden actualizada exitosamente", order: updatedOrder }
  } catch (error) {
    console.error("Error al actualizar la orden:", error)
    return {
      success: false,
      message: `Error al actualizar la orden: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

export async function deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const orders = await getOrders()
    const filteredOrders = orders.filter((order) => order.id !== id)

    if (filteredOrders.length === orders.length) {
      return { success: false, message: "Orden no encontrada" }
    }

    // Guardar las órdenes actualizadas
    localStorage.setItem("orders", JSON.stringify(filteredOrders))

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/orders")

    return { success: true, message: "Orden eliminada exitosamente" }
  } catch (error) {
    console.error("Error al eliminar la orden:", error)
    return {
      success: false,
      message: `Error al eliminar la orden: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}
