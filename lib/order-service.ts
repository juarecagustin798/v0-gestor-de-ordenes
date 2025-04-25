import type { Order } from "./types"

// Función para crear una nueva orden
export function createOrder(orderData: Partial<Order>): Order {
  // Generar un ID único para la orden
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Asegurarse de que el tipo de operación se mantenga como lo envió el usuario
  // Si viene operationType pero no type, establecer type basado en operationType
  if (!orderData.type && orderData.operationType) {
    if (orderData.operationType.startsWith("buy")) {
      orderData.type = "Compra"
    } else if (orderData.operationType.startsWith("sell")) {
      orderData.type = "Venta"
    }
  }

  // Log para depuración
  console.log("Creando orden con tipo:", orderData.type)
  console.log("Tipo de operación:", orderData.operationType)

  // Crear la nueva orden con valores por defecto
  const newOrder: Order = {
    id: orderId,
    clientId: orderData.clientId || "",
    client: orderData.client || "",
    assetId: orderData.assetId || "",
    asset: orderData.asset || "",
    ticker: orderData.ticker || "",
    type: orderData.type || "Desconocido", // Usar el tipo proporcionado
    operationType: orderData.operationType || "", // Mantener el operationType original
    quantity: orderData.quantity || 0,
    price: orderData.price || 0,
    total: orderData.total || (orderData.quantity || 0) * (orderData.price || 0),
    status: orderData.status || "Pendiente",
    notes: orderData.notes || "",
    commercialId: orderData.commercialId || "COM-001",
    commercial: orderData.commercial || "Juan Pérez",
    observations: orderData.observations || [],
    unreadUpdates: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isMarketOrder: orderData.isMarketOrder || false,
    isSwap: orderData.isSwap || false,
    ...orderData, // Incluir cualquier otro campo proporcionado
  }

  // Guardar la orden en localStorage
  saveOrderToLocalStorage(newOrder)

  return newOrder
}

// Función para guardar una orden en localStorage
function saveOrderToLocalStorage(order: Order): void {
  try {
    // Obtener órdenes existentes
    const existingOrders = getOrdersFromLocalStorage()

    // Agregar la nueva orden
    existingOrders.push(order)

    // Guardar en localStorage
    localStorage.setItem("orders", JSON.stringify(existingOrders))

    console.log(`Orden guardada en localStorage, total órdenes: ${existingOrders.length}`)
  } catch (error) {
    console.error("Error al guardar la orden en localStorage:", error)
  }
}

// Función para obtener órdenes de localStorage
export function getOrdersFromLocalStorage(): Order[] {
  try {
    const ordersJson = localStorage.getItem("orders")
    return ordersJson ? JSON.parse(ordersJson) : []
  } catch (error) {
    console.error("Error al obtener órdenes de localStorage:", error)
    return []
  }
}

// Función para actualizar el estado de una orden
export function updateOrderStatus(orderId: string, status: string): Order | null {
  try {
    const orders = getOrdersFromLocalStorage()
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) {
      console.error(`Orden con ID ${orderId} no encontrada`)
      return null
    }

    // Actualizar el estado
    orders[orderIndex].status = status
    orders[orderIndex].updatedAt = new Date()

    // Guardar en localStorage
    localStorage.setItem("orders", JSON.stringify(orders))

    console.log(`Estado de la orden ${orderId} actualizado a "${status}"`)

    return orders[orderIndex]
  } catch (error) {
    console.error("Error al actualizar el estado de la orden:", error)
    return null
  }
}
