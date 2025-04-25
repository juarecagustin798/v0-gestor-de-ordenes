"use client"

import type { Order, Client, User, Observation } from "./types"
import { getClientById as getClientByIdFromDB } from "@/lib/services/db-service"

// Export the Asset type - this line might be causing the issue
// export type { Asset }
// Let's fix it by using a different approach:
export type Asset = import("./types").Asset

// Función para cargar órdenes desde localStorage
function loadOrdersFromStorage(): Order[] {
  if (typeof window !== "undefined") {
    try {
      const storedOrders = localStorage.getItem("mockOrders")
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders)
        console.log("Órdenes cargadas desde localStorage:", parsedOrders.length)
        return parsedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          observations: order.observations.map((obs: any) => ({
            ...obs,
            createdAt: new Date(obs.createdAt),
          })),
        }))
      }
    } catch (e) {
      console.error("Error al cargar órdenes desde localStorage:", e)
    }
  }
  return []
}

// Modificar la función loadClientsFromStorage para mejorar el logging
function loadClientsFromStorage(): Client[] {
  if (typeof window !== "undefined") {
    try {
      const storedClients = localStorage.getItem("mockClients")
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients)
        console.log("Clientes cargados desde localStorage:", parsedClients.length)
        console.log("Muestra de clientes:", parsedClients.slice(0, 3))
        return parsedClients
      } else {
        console.log("No se encontraron clientes en localStorage")
      }
    } catch (e) {
      console.error("Error al cargar clientes desde localStorage:", e)
    }
  }
  return []
}

// Update the mockOrders initialization to load from localStorage
// Replace the existing mockOrders declaration with this:
export const mockOrders: Order[] = []

// Load orders from localStorage when initializing
if (typeof window !== "undefined") {
  const storedOrders = loadOrdersFromStorage()
  if (storedOrders.length > 0) {
    mockOrders.push(...storedOrders)
  }
}

// Inicializar mockClients con los datos de localStorage si están disponibles
export const mockClients: Client[] = []

// Cargar clientes desde localStorage al inicializar
if (typeof window !== "undefined") {
  const storedClients = loadClientsFromStorage()
  if (storedClients.length > 0) {
    // Si hay clientes en localStorage, usarlos y NO cargar ejemplos
    mockClients.push(...storedClients)
    console.log("Usando SOLO los clientes importados:", mockClients.length)
  } else {
    // SOLO si no hay clientes en localStorage, agregar algunos clientes de ejemplo
    console.log("No hay clientes importados, usando ejemplos")
    mockClients.push(
      {
        id: "5001",
        name: "Cliente Ejemplo 1",
        email: "cliente1@ejemplo.com",
        phone: "123-456-7890",
        documentType: "DNI",
        documentNumber: "12345678",
        address: "Calle Ejemplo 123",
        accountNumber: "ACC-001",
        commercialId: "COM-001",
      },
      {
        id: "5002",
        name: "Cliente Ejemplo 2",
        email: "cliente2@ejemplo.com",
        phone: "123-456-7891",
        documentType: "DNI",
        documentNumber: "87654321",
        address: "Calle Ejemplo 124",
        accountNumber: "ACC-002",
        commercialId: "COM-001",
      },
      {
        id: "5003",
        name: "Cliente Ejemplo 3",
        email: "cliente3@ejemplo.com",
        phone: "123-456-7892",
        documentType: "DNI",
        documentNumber: "45678912",
        address: "Calle Ejemplo 125",
        accountNumber: "ACC-003",
        commercialId: "COM-001",
      },
    )

    // Guardar los clientes de ejemplo en localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mockClients", JSON.stringify(mockClients))
        console.log("Clientes de ejemplo guardados en localStorage")
      } catch (e) {
        console.error("Error al guardar clientes en localStorage:", e)
      }
    }
  }
}

// Función para obtener clientes con caché
let clientsCache: Client[] | null = null
let clientsLastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function getClients(): Promise<Client[]> {
  // Si tenemos datos en caché y son recientes, los devolvemos
  if (clientsCache && Date.now() - clientsLastFetch < CACHE_DURATION) {
    return clientsCache
  }

  try {
    // Intentamos obtener los clientes del localStorage
    const clientsData = localStorage.getItem("clients")

    if (clientsData) {
      const clients = JSON.parse(clientsData) as Client[]

      // Actualizamos la caché
      clientsCache = clients
      clientsLastFetch = Date.now()

      return clients
    }

    return []
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return []
  }
}

// Lista de activos financieros (vacía para que puedas cargar tus propios activos)
export const mockAssets: Asset[] = []

// Comerciales (vacío para que puedas cargar tus propios comerciales)
export const mockCommercials = []

// Traders (Mesa de Trading) (vacío para que puedas cargar tus propios traders)
export const mockTraders: User[] = []

// Función para crear una nueva orden en los datos
export function createMockOrder(orderData: Partial<Order>): Order {
  const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const newOrder: Order = {
    id,
    clientId: orderData.clientId || "",
    client: orderData.client || "",
    assetId: orderData.assetId || "",
    asset: orderData.asset || "",
    ticker: orderData.ticker || "",
    type: orderData.type || "Compra",
    quantity: orderData.quantity || 0,
    price: orderData.price || 0,
    total: orderData.total || 0,
    status: orderData.status || "Pendiente",
    notes: orderData.notes || "",
    commercialId: orderData.commercialId || "",
    commercial: orderData.commercial || "",
    observations: orderData.observations || [],
    unreadUpdates: orderData.unreadUpdates || 0,
    lastUpdateType: orderData.lastUpdateType,
    unreadElements: orderData.unreadElements,
    createdAt: orderData.createdAt || new Date(),
    updatedAt: orderData.updatedAt || new Date(),
    traderId: orderData.traderId,
    trader: orderData.trader,
    executedQuantity: orderData.executedQuantity,
    executedPrice: orderData.executedPrice,
    plazo: orderData.plazo,
    mercado: orderData.mercado,
    priceType: orderData.priceType,
    minPrice: orderData.minPrice,
    maxPrice: orderData.maxPrice,
    isMarketOrder: orderData.isMarketOrder || false,
    isSwap: orderData.isSwap || false,
    swapId: orderData.swapId,
    swapType: orderData.swapType,
    relatedOrderId: orderData.relatedOrderId,
  }

  // Add to mockOrders array
  mockOrders.push(newOrder)

  // Store in localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mockOrders", JSON.stringify(mockOrders))
      console.log("Order saved to localStorage, total orders:", mockOrders.length)
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }

  return newOrder
}

// Función para actualizar una orden en los datos
export function updateMockOrder(orderId: string, updates: Partial<Order>): Order | null {
  const orderIndex = mockOrders.findIndex((order) => order.id === orderId)

  if (orderIndex === -1) {
    return null
  }

  // Crear una copia de la orden con las actualizaciones
  const updatedOrder = {
    ...mockOrders[orderIndex],
    ...updates,
    updatedAt: new Date(),
  }

  // Actualizar la orden en el array
  mockOrders[orderIndex] = updatedOrder

  // Update in localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mockOrders", JSON.stringify(mockOrders))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }

  return updatedOrder
}

// Función para añadir una observación a una orden
export function addMockObservation(orderId: string, observation: Omit<Observation, "id">): Observation | null {
  const orderIndex = mockOrders.findIndex((order) => order.id === orderId)

  if (orderIndex === -1) {
    return null
  }

  // Crear una nueva observación con ID generado
  const newObservation: Observation = {
    id: `OBS-${Math.floor(Math.random() * 10000)}`,
    ...observation,
  }

  // Añadir la observación a la orden
  mockOrders[orderIndex].observations.push(newObservation)
  mockOrders[orderIndex].updatedAt = new Date()

  // Update in localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mockOrders", JSON.stringify(mockOrders))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }

  return newObservation
}

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  // Combinar comerciales y traders
  const commercialUsers: User[] = mockCommercials.map((commercial) => ({
    id: commercial.id,
    name: commercial.name,
    email: commercial.email,
    role: "Comercial" as const,
  }))

  return [...commercialUsers, ...mockTraders]
}

// Función para obtener un usuario por ID
export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find((user) => user.id === id)
}

// Función para obtener traders
export async function getTraders(): Promise<User[]> {
  return mockTraders
}

export async function getOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockOrders)
    }, 500)
  })
}

// Función para obtener órdenes pendientes (para la mesa de trading)
export async function getPendingOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Solo órdenes en estado Pendiente o Revisar que no han sido tomadas por un trader
      const pendingOrders = mockOrders.filter(
        (order) => (order.status === "Pendiente" || order.status === "Revisar") && !order.traderId,
      )
      resolve(pendingOrders)
    }, 100) // Reducir el tiempo para una respuesta más rápida
  })
}

// Función para obtener órdenes en proceso (tomadas por un trader)
export async function getInProgressOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Órdenes tomadas por un trader pero aún no ejecutadas completamente
      const inProgressOrders = mockOrders.filter(
        (order) =>
          order.status === "Tomada" || ((order.status === "Pendiente" || order.status === "Revisar") && order.traderId),
      )
      resolve(inProgressOrders)
    }, 100)
  })
}

// Función para obtener órdenes completadas (ejecutadas total o parcialmente)
export async function getCompletedOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const completedOrders = mockOrders.filter(
        (order) => order.status === "Ejecutada" || order.status === "Ejecutada parcial",
      )
      resolve(completedOrders)
    }, 100)
  })
}

// Función para obtener órdenes canceladas
export async function getCanceledOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const canceledOrders = mockOrders.filter((order) => order.status === "Cancelada")
      resolve(canceledOrders)
    }, 100)
  })
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  console.log(`Buscando orden con ID: ${id}`)

  // Verificar que el ID no sea undefined o null
  if (!id) {
    console.error("ID de orden no válido:", id)
    return undefined
  }

  // Buscar la orden directamente en el array
  const order = mockOrders.find((order) => order.id === id)

  // Registrar el resultado para depuración
  console.log(`Resultado de búsqueda para ID ${id}:`, order ? "Orden encontrada" : "Orden no encontrada")

  // Devolver la orden encontrada o undefined
  return order
}

// Añadir esta función si no existe
export async function getAllClients() {
  try {
    // En un entorno real, esto obtendría datos de una API o base de datos
    // Para este ejemplo, devolvemos una lista de clientes de prueba
    const mockClients = [
      { id: "1", name: "Cliente 1", idCliente: "CLI001", accountNumber: "ACC001" },
      { id: "2", name: "Cliente 2", idCliente: "CLI002", accountNumber: "ACC002" },
      { id: "3", name: "Cliente 3", idCliente: "CLI003", accountNumber: "ACC003" },
      { id: "4", name: "Cliente 4", idCliente: "CLI004", accountNumber: "ACC004" },
      { id: "5", name: "Cliente 5", idCliente: "CLI005", accountNumber: "ACC005" },
      // Añadir el cliente específico que está causando el error
      {
        id: "fc05c58b-a142-469c-becd-543d014e0911",
        name: "Cliente Especial",
        idCliente: "fc05c58b-a142-469c-becd-543d014e0911",
        accountNumber: "ACC-ESPECIAL",
      },
    ]

    // Intentar recuperar clientes del localStorage si estamos en el cliente
    if (typeof window !== "undefined") {
      try {
        const storedClients = localStorage.getItem("mockClients")
        if (storedClients) {
          return JSON.parse(storedClients)
        }
      } catch (e) {
        console.warn("No se pudo recuperar clientes del localStorage:", e)
      }
    }

    return mockClients
  } catch (error) {
    console.error("Error al obtener todos los clientes:", error)
    return []
  }
}

// Modificar la función getClientById para usar la función de la base de datos
export async function getClientById(clientId: string) {
  try {
    if (!clientId) {
      console.error("ID de cliente no proporcionado")
      return null
    }

    console.log("Buscando cliente con ID:", clientId)

    // Primero intentar obtener el cliente de la base de datos
    const clientFromDB = await getClientByIdFromDB(clientId)
    if (clientFromDB) {
      console.log(
        "Cliente encontrado en la base de datos:",
        clientFromDB.denominacion || clientFromDB.titular || clientFromDB.name,
      )
      return clientFromDB
    }

    // Si no se encuentra en la base de datos, intentar en localStorage
    if (typeof window !== "undefined") {
      try {
        const storedClients = localStorage.getItem("mockClients")
        if (storedClients) {
          const clients = JSON.parse(storedClients)
          const client = clients.find(
            (c: any) => c.id === clientId || c.idCliente === clientId || c.accountNumber === clientId,
          )

          if (client) {
            console.log("Cliente encontrado en localStorage:", client.name || client.denominacion || client.titular)
            return client
          }
        }
      } catch (e) {
        console.warn("Error al buscar cliente en localStorage:", e)
      }
    }

    console.warn(`Cliente con ID ${clientId} no encontrado. Creando cliente temporal.`)

    // Crear un cliente temporal para evitar errores
    return {
      id: clientId,
      name: `Cliente ${clientId.substring(0, 8)}`,
      idCliente: clientId,
      accountNumber: clientId,
    }
  } catch (error) {
    console.error(`Error al buscar cliente con ID ${clientId}:`, error)

    // Crear un cliente temporal para evitar errores
    return {
      id: clientId,
      name: `Cliente ${clientId.substring(0, 8)}`,
      idCliente: clientId,
      accountNumber: clientId,
    }
  }
}

// Modificar solo la función getAssetById para hacerla más flexible
export async function getAssetById(id: string): Promise<Asset | undefined> {
  console.log(`Buscando activo con ID/ticker: ${id}`)

  // Verificar que el ID no sea undefined o null
  if (!id) {
    console.error("ID/ticker de activo no válido:", id)
    return undefined
  }

  // Primero, intentar cargar todos los activos disponibles, incluyendo los de localStorage
  let allAssets = [...mockAssets]

  // Intentar cargar activos adicionales desde localStorage
  if (typeof window !== "undefined") {
    try {
      const storedAssets = localStorage.getItem("mockAssets")
      if (storedAssets) {
        const parsedAssets = JSON.parse(storedAssets)
        console.log("Activos cargados desde localStorage en getAssetById:", parsedAssets.length)

        // Añadir solo los activos que no están ya en mockAssets
        const existingTickerSet = new Set(mockAssets.map((a) => a.ticker))
        const newAssets = parsedAssets.filter((a) => !existingTickerSet.has(a.ticker))

        if (newAssets.length > 0) {
          console.log("Añadiendo nuevos activos desde localStorage en getAssetById:", newAssets.length)
          allAssets = [...mockAssets, ...newAssets]
        }
      }
    } catch (e) {
      console.error("Error al cargar activos desde localStorage en getAssetById:", e)
    }
  }

  // 1. Buscar coincidencia exacta en todos los activos disponibles
  let asset = allAssets.find((a) => a.ticker === id || a.id === id)

  // 2. Si no se encuentra, buscar por coincidencia normalizada
  if (!asset) {
    const normalizedSearchId = id.replace(/\s+/g, "").toLowerCase()
    asset = allAssets.find((a) => {
      const normalizedAssetTicker = a.ticker.replace(/\s+/g, "").toLowerCase()
      return normalizedAssetTicker === normalizedSearchId
    })
  }

  // 3. Si aún no se encuentra, buscar por ticker base
  if (!asset) {
    const baseTicker = id.split("-")[0].trim()
    console.log("Buscando por ticker base en getAssetById:", baseTicker)

    asset = allAssets.find((a) => a.ticker.startsWith(baseTicker))
  }

  // 4. Si aún no se encuentra, buscar por coincidencia parcial
  if (!asset) {
    const searchTerms = id.split(/[\s-]+/)
    console.log("Buscando por términos en getAssetById:", searchTerms)

    const possibleMatches = allAssets.filter((a) => {
      return searchTerms.some((term) => a.ticker.toLowerCase().includes(term.toLowerCase()))
    })

    if (possibleMatches.length > 0) {
      console.log(
        "Posibles coincidencias en getAssetById:",
        possibleMatches.map((a) => a.ticker),
      )
      possibleMatches.sort((a, b) => a.ticker.length - b.ticker.length)
      asset = possibleMatches[0]
    }
  }

  // Registrar el resultado para depuración
  if (asset) {
    console.log(`Activo encontrado: ${asset.name} con ticker ${asset.ticker}`)
  } else {
    console.log(`No se encontró ningún activo para ${id}`)
  }

  // Devolver el activo encontrado o undefined
  return asset
}

export async function searchAssets(query: string): Promise<Asset[]> {
  // Simular una búsqueda de activos
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredAssets = mockAssets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.ticker.toLowerCase().includes(query.toLowerCase()),
      )
      resolve(filteredAssets)
    }, 300)
  })
}

// Función para cargar activos desde localStorage
function loadAssetsFromStorage(): Asset[] {
  if (typeof window !== "undefined") {
    try {
      const storedAssets = localStorage.getItem("mockAssets")
      if (storedAssets) {
        const parsedAssets = JSON.parse(storedAssets)
        console.log("Activos cargados desde localStorage:", parsedAssets.length)
        return parsedAssets
      } else {
        console.log("No se encontraron activos en localStorage")
      }
    } catch (e) {
      console.error("Error al cargar activos desde localStorage:", e)
    }
  }
  return []
}

// Asegurarnos de que la función getAssets esté correctamente exportada
export async function getAssets(): Promise<Asset[]> {
  // Devolver directamente los activos en memoria si existen
  if (mockAssets.length > 0) {
    return mockAssets
  }

  // Si no hay activos en memoria, intentar cargar desde localStorage
  const storedAssets = loadAssetsFromStorage()
  if (storedAssets.length > 0) {
    // Actualizar mockAssets para futuras consultas
    mockAssets.push(...storedAssets)
    return storedAssets
  }

  // Si no hay datos, devolver un array vacío
  return []
}
