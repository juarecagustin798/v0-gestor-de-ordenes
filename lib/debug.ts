import { mockOrders } from "./data"

export function logOrderIds() {
  console.log(
    "IDs de órdenes disponibles:",
    mockOrders.map((order) => order.id),
  )
}

export function checkOrderExists(id: string) {
  const exists = mockOrders.some((order) => order.id === id)
  console.log(`Orden con ID ${id} ${exists ? "existe" : "no existe"} en mockOrders`)
  return exists
}

export function getOrderCount() {
  return mockOrders.length
}
