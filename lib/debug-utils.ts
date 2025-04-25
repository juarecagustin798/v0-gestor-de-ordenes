"\"use client"

// Utilidades para depuración y reinicio de datos

export function resetClientData() {
  if (typeof window !== "undefined") {
    try {
      // Eliminar clientes de localStorage
      localStorage.removeItem("mockClients")

      // Recargar la página para que se reinicien los datos
      window.location.reload()

      return true
    } catch (e) {
      console.error("Error al reiniciar datos de clientes:", e)
      return false
    }
  }
  return false
}

export function debugLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      const clients = localStorage.getItem("mockClients")
      const orders = localStorage.getItem("mockOrders")
      const assets = localStorage.getItem("mockAssets")

      return {
        clients: clients ? JSON.parse(clients) : [],
        orders: orders ? JSON.parse(orders) : [],
        assets: assets ? JSON.parse(assets) : [],
      }
    } catch (e) {
      console.error("Error al depurar localStorage:", e)
      return { error: e }
    }
  }
  return { error: "No se puede acceder a localStorage (servidor)" }
}

// Función para verificar si los datos de clientes están correctamente formateados
export function validateClientData() {
  if (typeof window !== "undefined") {
    try {
      const clientsStr = localStorage.getItem("mockClients")
      if (!clientsStr) {
        return { valid: false, message: "No hay datos de clientes en localStorage" }
      }

      const clients = JSON.parse(clientsStr)

      if (!Array.isArray(clients)) {
        return { valid: false, message: "Los datos de clientes no son un array" }
      }

      if (clients.length === 0) {
        return { valid: false, message: "El array de clientes está vacío" }
      }

      // Verificar estructura de los primeros 5 clientes
      const sampleClients = clients.slice(0, 5)
      const invalidClients = sampleClients.filter(
        (client) => !client || typeof client !== "object" || !client.id || !client.name,
      )

      if (invalidClients.length > 0) {
        return {
          valid: false,
          message: "Algunos clientes tienen formato incorrecto",
          invalidSamples: invalidClients,
        }
      }

      return {
        valid: true,
        message: `Datos de clientes válidos (${clients.length} clientes)`,
        samples: sampleClients,
      }
    } catch (e) {
      return { valid: false, message: "Error al validar datos de clientes", error: e }
    }
  }
  return { valid: false, message: "No se puede acceder a localStorage (servidor)" }
}

export function setupDebugUtils() {
  // No implementation needed for client-side setup
}
