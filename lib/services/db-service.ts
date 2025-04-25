// Servicio para manejar la base de datos IndexedDB
import type { Client } from "@/lib/types"

const DB_NAME = "gestor-ordenes-db"
const DB_VERSION = 1
const CLIENTS_STORE = "clients"
const FILE_INFO_STORE = "fileInfo"

// Interfaz para la información del archivo
export interface FileInfo {
  name: string
  size: number
  lastModified: number
  importedAt: string
  clientCount: number
}

// Inicializar la base de datos
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("Error al abrir la base de datos:", event)
      reject("Error al abrir la base de datos")
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Crear almacén para clientes si no existe
      if (!db.objectStoreNames.contains(CLIENTS_STORE)) {
        const clientsStore = db.createObjectStore(CLIENTS_STORE, { keyPath: "id" })
        // Crear índices para búsquedas rápidas
        clientsStore.createIndex("denominacion", "denominacion", { unique: false })
        clientsStore.createIndex("cuit", "cuit", { unique: false })
        clientsStore.createIndex("idCliente", "idCliente", { unique: false })
        clientsStore.createIndex("titular", "titular", { unique: false })
      }

      // Crear almacén para información del archivo
      if (!db.objectStoreNames.contains(FILE_INFO_STORE)) {
        db.createObjectStore(FILE_INFO_STORE, { keyPath: "name" })
      }
    }
  })
}

// Limpiar el almacén de clientes
export const clearClientsStore = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CLIENTS_STORE, "readwrite")
    const store = transaction.objectStore(CLIENTS_STORE)

    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      console.error("Error al limpiar el almacén de clientes:", event)
      reject("Error al limpiar el almacén de clientes")
    }
  })
}

// Guardar un lote de clientes
export const saveBatchClients = async (clients: Client[]): Promise<void> => {
  if (clients.length === 0) return

  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CLIENTS_STORE, "readwrite")
    const store = transaction.objectStore(CLIENTS_STORE)

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = (event) => {
      console.error("Error al guardar lote de clientes:", event)
      reject("Error al guardar lote de clientes")
    }

    // Agregar cada cliente en el lote
    clients.forEach((client) => {
      store.add(client)
    })
  })
}

// Guardar clientes en la base de datos
export const saveClients = async (clients: Client[]): Promise<void> => {
  try {
    // Primero limpiamos el almacén
    await clearClientsStore()

    // Luego guardamos los clientes en lotes
    const batchSize = 100
    for (let i = 0; i < clients.length; i += batchSize) {
      const batch = clients.slice(i, i + batchSize)
      await saveBatchClients(batch)

      // Pequeña pausa para permitir que el navegador respire
      if (i + batchSize < clients.length) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }
  } catch (error) {
    console.error("Error al guardar clientes:", error)
    throw new Error("Error al guardar clientes en la base de datos")
  }
}

// Guardar información del archivo
export const saveFileInfo = async (fileInfo: FileInfo): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILE_INFO_STORE, "readwrite")
    const store = transaction.objectStore(FILE_INFO_STORE)

    const request = store.put(fileInfo)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      console.error("Error al guardar información del archivo:", event)
      reject("Error al guardar información del archivo")
    }
  })
}

// Obtener todos los clientes
export const getAllClients = async (): Promise<Client[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CLIENTS_STORE, "readonly")
    const store = transaction.objectStore(CLIENTS_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (event) => {
      console.error("Error al obtener clientes:", event)
      reject("Error al obtener clientes de la base de datos")
    }
  })
}

// Obtener clientes paginados
export const getClientsPaginated = async (
  page = 1,
  pageSize = 50,
  searchTerm = "",
): Promise<{ clients: Client[]; total: number }> => {
  try {
    const db = await initDB()

    // Obtener todos los clientes
    const allClients = await new Promise<Client[]>((resolve, reject) => {
      const transaction = db.transaction(CLIENTS_STORE, "readonly")
      const store = transaction.objectStore(CLIENTS_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error al obtener clientes:", event)
        reject("Error al obtener clientes")
      }
    })

    // Filtrar por término de búsqueda si es necesario
    let filteredClients = allClients
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredClients = allClients.filter(
        (client) =>
          (client.denominacion?.toLowerCase() || "").includes(term) ||
          (client.titular?.toLowerCase() || "").includes(term) ||
          (client.cuit?.toLowerCase() || "").includes(term) ||
          (client.idCliente?.toLowerCase() || "").includes(term) ||
          (client.id?.toLowerCase() || "").includes(term),
      )
    }

    // Calcular el total filtrado
    const filteredTotal = filteredClients.length

    // Paginar los resultados
    const start = (page - 1) * pageSize
    const paginatedClients = filteredClients.slice(start, start + pageSize)

    return { clients: paginatedClients, total: filteredTotal }
  } catch (error) {
    console.error("Error al obtener clientes paginados:", error)
    throw new Error("Error al obtener clientes paginados")
  }
}

// Obtener información del archivo
export const getFileInfo = async (): Promise<FileInfo | null> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILE_INFO_STORE, "readonly")
    const store = transaction.objectStore(FILE_INFO_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      if (request.result.length > 0) {
        resolve(request.result[0])
      } else {
        resolve(null)
      }
    }

    request.onerror = (event) => {
      console.error("Error al obtener información del archivo:", event)
      reject("Error al obtener información del archivo")
    }
  })
}

// Buscar clientes por término
export async function searchClients(query: string): Promise<Client[]> {
  try {
    console.log("Buscando clientes con query:", query)

    // Normalizar la consulta
    const normalizedQuery = query.toLowerCase().trim()

    // Intentar buscar en IndexedDB primero
    const db = await initDB()
    const allClients = await new Promise<Client[]>((resolve, reject) => {
      const transaction = db.transaction(CLIENTS_STORE, "readonly")
      const store = transaction.objectStore(CLIENTS_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error al obtener clientes:", event)
        reject("Error al obtener clientes")
      }
    })

    // Filtrar clientes que coincidan con la consulta, priorizando coincidencias exactas en ID
    const exactMatches: Client[] = []
    const partialMatches: Client[] = []

    allClients.forEach((client) => {
      // Verificar coincidencia exacta en ID
      if (client.id === normalizedQuery) {
        exactMatches.push(client)
        return
      }

      // Verificar coincidencias parciales en otros campos
      const id = (client.id || "").toLowerCase()
      const name = (client.denominacion || client.titular || client.name || "").toLowerCase()
      const accountId = (client.idCliente || client.accountNumber || "").toLowerCase()
      const cuit = (client.cuit || "").toLowerCase()

      if (
        id.includes(normalizedQuery) ||
        name.includes(normalizedQuery) ||
        accountId.includes(normalizedQuery) ||
        cuit.includes(normalizedQuery)
      ) {
        partialMatches.push(client)
      }
    })

    // Combinar resultados, priorizando coincidencias exactas
    const results = [...exactMatches, ...partialMatches]

    console.log(`Encontrados ${results.length} clientes (${exactMatches.length} coincidencias exactas)`)
    return results.slice(0, 50) // Limitar a 50 resultados
  } catch (error) {
    console.error("Error al buscar clientes:", error)
    return []
  }
}

// Obtener cliente por ID
export async function getClientById(id: string): Promise<Client | null> {
  try {
    if (!id) {
      console.error("ID de cliente no proporcionado")
      return null
    }

    console.log("Buscando cliente con ID:", id)

    const db = await initDB()

    // Intentar obtener el cliente directamente por su ID
    const client = await new Promise<Client | null>((resolve, reject) => {
      const transaction = db.transaction(CLIENTS_STORE, "readonly")
      const store = transaction.objectStore(CLIENTS_STORE)
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          console.log("Cliente encontrado por ID exacto:", request.result.denominacion || request.result.titular)
          resolve(request.result)
        } else {
          resolve(null)
        }
      }

      request.onerror = (event) => {
        console.error("Error al obtener cliente por ID:", event)
        reject("Error al obtener cliente")
      }
    })

    if (client) return client

    // Si no se encuentra por ID exacto, buscar por otros campos
    const allClients = await getAllClients()

    // Buscar por idCliente o accountNumber
    const clientByOtherFields = allClients.find((c) => c.idCliente === id || c.accountNumber === id)

    if (clientByOtherFields) {
      console.log(
        "Cliente encontrado por campo alternativo:",
        clientByOtherFields.denominacion || clientByOtherFields.titular,
      )
      return clientByOtherFields
    }

    console.log("Cliente no encontrado con ID:", id)
    return null
  } catch (error) {
    console.error("Error al buscar cliente por ID:", error)
    return null
  }
}
