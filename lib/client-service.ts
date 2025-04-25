import { mockClients } from "./data"

// Función para limpiar completamente los clientes
export function clearAllClients() {
  // Limpiar el array en memoria
  if (mockClients) {
    mockClients.length = 0
  }

  // Limpiar localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("mockClients")
  }

  console.log("Todos los clientes han sido eliminados")
  return true
}

// Función para importar clientes desde un archivo JSON
export async function importClientsFromJSON(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        // Limpiar todos los clientes existentes primero
        clearAllClients()

        if (!event.target || !event.target.result) {
          return resolve({ success: false, message: "Error al leer el archivo" })
        }

        const content = event.target.result.toString()
        let clients

        try {
          clients = JSON.parse(content)
        } catch (e) {
          return resolve({ success: false, message: "El archivo no contiene JSON válido" })
        }

        // Verificar que sea un array
        if (!Array.isArray(clients)) {
          return resolve({ success: false, message: "El formato del archivo no es válido (se esperaba un array)" })
        }

        // Verificar que los clientes tengan la estructura correcta
        const validClients = clients.filter(
          (client) => client && typeof client === "object" && client.id && client.name,
        )

        if (validClients.length === 0) {
          return resolve({ success: false, message: "No se encontraron clientes válidos en el archivo" })
        }

        // Guardar los nuevos clientes
        localStorage.setItem("mockClients", JSON.stringify(validClients))

        // Actualizar el array en memoria
        mockClients.push(...validClients)

        console.log(`Se importaron ${validClients.length} clientes`)

        // Forzar recarga para actualizar la UI
        window.location.reload()

        return resolve({
          success: true,
          message: `Se importaron ${validClients.length} clientes correctamente`,
        })
      } catch (e) {
        console.error("Error al importar clientes:", e)
        return resolve({ success: false, message: "Error al procesar el archivo" })
      }
    }

    reader.onerror = () => {
      resolve({ success: false, message: "Error al leer el archivo" })
    }

    reader.readAsText(file)
  })
}
