"use server"

import type { OrderFormValues, StatusUpdateParams, Order as OrderType, NotificationState } from "./types"
import { updateMockOrder, addMockObservation, createMockOrder, getOrderById, getClientById, getAssetById } from "./data"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
// Añadir la importación de OrderFormValues al principio del archivo
// import { OrderFormValues } from "./types-order-form"

// Tipos
export interface Client {
  id: string
  name: string
  [key: string]: any
}

export interface Asset {
  id: string
  ticker: string
  name: string
  lastPrice?: number
  [key: string]: any
}

// Mock orders (assuming this is where it should be declared)
const mockOrders: OrderType[] = []

// Función para obtener el estado actual de las notificaciones
function getNotificationState(): NotificationState {
  const notificationCookie = cookies().get("order_notifications")
  if (!notificationCookie) {
    return { orderIds: [], counts: {}, unreadElements: {} }
  }

  try {
    return JSON.parse(notificationCookie.value)
  } catch (e) {
    return { orderIds: [], counts: {}, unreadElements: {} }
  }
}

// Función para guardar el estado de las notificaciones
function saveNotificationState(state: NotificationState) {
  cookies().set("order_notifications", JSON.stringify(state), {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    httpOnly: true,
  })
}

// Función para incrementar el contador de notificaciones
function incrementNotificationCount(
  orderId: string,
  type: "status" | "observation" | "execution",
  observationId?: string,
) {
  const state = getNotificationState()

  if (!state.orderIds.includes(orderId)) {
    state.orderIds.push(orderId)
  }

  state.counts[orderId] = (state.counts[orderId] || 0) + 1

  // Inicializar unreadElements para esta orden si no existe
  if (!state.unreadElements[orderId]) {
    state.unreadElements[orderId] = {}
  }

  // Marcar el elemento específico como no leído
  if (type === "status") {
    state.unreadElements[orderId].status = true
  } else if (type === "execution") {
    state.unreadElements[orderId].execution = true
  } else if (type === "observation" && observationId) {
    if (!state.unreadElements[orderId].observations) {
      state.unreadElements[orderId].observations = []
    }
    if (!state.unreadElements[orderId].observations.includes(observationId)) {
      state.unreadElements[orderId].observations.push(observationId)
    }
  }

  // Actualizar también el estado en el modelo de datos
  updateMockOrder(orderId, {
    unreadUpdates: state.counts[orderId],
    lastUpdateType: type,
    unreadElements: state.unreadElements[orderId],
  })

  saveNotificationState(state)
}

// Función para marcar las notificaciones como leídas
export async function markNotificationsAsRead(orderIds: string[]) {
  const state = getNotificationState()

  for (const orderId of orderIds) {
    if (state.counts[orderId]) {
      delete state.counts[orderId]
      delete state.unreadElements[orderId]
      state.orderIds = state.orderIds.filter((id) => id !== orderId)

      // Actualizar también el estado en el modelo de datos
      updateMockOrder(orderId, {
        unreadUpdates: 0,
        unreadElements: undefined,
      })
    }
  }

  saveNotificationState(state)

  // Revalidar rutas
  revalidatePath("/")
  revalidatePath("/orders")
  revalidatePath("/trading")
  for (const id of orderIds) {
    revalidatePath(`/orders/${id}`)
  }

  return { success: true }
}

// Función para marcar elementos específicos como leídos
export async function markElementAsRead(
  orderId: string,
  elementType: "status" | "execution" | "observation",
  observationId?: string,
) {
  try {
    const state = getNotificationState()

    if (state.unreadElements[orderId]) {
      if (elementType === "status") {
        state.unreadElements[orderId].status = false
      } else if (elementType === "execution") {
        state.unreadElements[orderId].execution = false
      } else if (elementType === "observation" && observationId && state.unreadElements[orderId].observations) {
        state.unreadElements[orderId].observations = state.unreadElements[orderId].observations.filter(
          (id) => id !== observationId,
        )
      }

      // Si no quedan elementos no leídos, eliminar la orden de las notificaciones
      const hasUnreadElements =
        state.unreadElements[orderId].status ||
        state.unreadElements[orderId].execution ||
        (state.unreadElements[orderId].observations && state.unreadElements[orderId].observations.length > 0)

      if (!hasUnreadElements) {
        delete state.counts[orderId]
        delete state.unreadElements[orderId]
        state.orderIds = state.orderIds.filter((id) => id !== orderId)

        // Actualizar también el estado en el modelo de datos
        const orderExists = await getOrderById(orderId)
        if (orderExists) {
          updateMockOrder(orderId, {
            unreadUpdates: 0,
            unreadElements: undefined,
          })
        } else {
          console.warn(`No se pudo actualizar la orden ${orderId} porque no existe`)
        }
      } else {
        // Actualizar el contador y el modelo de datos
        const newCount =
          (state.unreadElements[orderId].observations?.length || 0) +
          (state.unreadElements[orderId].status ? 1 : 0) +
          (state.unreadElements[orderId].execution ? 1 : 0)

        state.counts[orderId] = newCount

        // Actualizar también el estado en el modelo de datos
        const orderExists = await getOrderById(orderId)
        if (orderExists) {
          updateMockOrder(orderId, {
            unreadUpdates: newCount,
            unreadElements: state.unreadElements[orderId],
          })
        } else {
          console.warn(`No se pudo actualizar la orden ${orderId} porque no existe`)
        }
      }

      saveNotificationState(state)

      // Revalidar rutas
      revalidatePath("/")
      revalidatePath("/orders")
      revalidatePath("/trading")
      revalidatePath(`/orders/${orderId}`)

      return { success: true }
    }

    return { success: false, error: "No hay elementos no leídos para esta orden" }
  } catch (error) {
    console.error(`Error al marcar elemento como leído para la orden ${orderId}:`, error)
    return { success: false, error: "Error al marcar elemento como leído" }
  }
}

// Actualizar la función createOrder para manejar el nuevo formato de datos
export async function createOrder(data: OrderFormValues) {
  try {
    // Verificar que los datos requeridos estén presentes
    if (!data.data.clientId) {
      return { success: false, error: "ID de cliente no proporcionado" }
    }

    // Obtener información del cliente y del activo
    const client = await getClientById(data.data.clientId)
    const asset = await getAssetById(data.data.ticker)

    if (!client || !asset) {
      throw new Error("Cliente o activo no encontrado")
    }

    // Determinar la cantidad y el precio según el modo de entrada
    const quantity =
      data.data.inputMode === "quantity"
        ? data.data.quantity
        : Math.floor((data.data.amount || 0) / (data.data.price || 1))

    const price = data.data.isMarketOrder ? 0 : data.data.price || 0

    // Calcular el total
    const total = quantity * price

    // Crear la orden usando la función createMockOrder
    const newOrder = createMockOrder({
      clientId: client.id,
      client: client.name || client.denominacion || client.titular || `Cliente ${client.id}`,
      assetId: asset.id,
      asset: asset.name,
      ticker: asset.ticker,
      type: data.data.type === "buy" ? "Compra" : data.data.type === "sell" ? "Venta" : data.data.type,
      quantity: quantity,
      price: price,
      total: total,
      status: "Pendiente",
      notes: (data.data.isMarketOrder ? "ORDEN A MERCADO. " : "") + (data.data.notes || ""),
      commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
      commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
      observations: [],
      unreadUpdates: 0,
      lastUpdateType: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      plazo: data.data.plazo,
      mercado: data.data.mercado,
      priceType: data.data.priceType,
      minPrice: !data.data.isMarketOrder && data.data.usePriceBands ? data.data.minPrice : undefined,
      maxPrice: !data.data.isMarketOrder && data.data.usePriceBands ? data.data.maxPrice : undefined,
    })

    console.log("Orden creada:", newOrder)

    // Ensure the order is added to mockOrders
    if (!mockOrders.some((order) => order.id === newOrder.id)) {
      mockOrders.push(newOrder)
    }

    // Persist orders to localStorage for better data retention
    try {
      localStorage.setItem("mockOrders", JSON.stringify(mockOrders))
      console.log("Órdenes guardadas en localStorage:", mockOrders.length)
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e)
    }

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/")
    revalidatePath("/orders")
    revalidatePath("/trading")

    return { success: true, id: newOrder.id }
  } catch (error) {
    console.error("Error al crear la orden:", error)
    return { success: false, error: "Error al crear la orden" }
  }
}

export async function updateOrderStatus(params: StatusUpdateParams) {
  try {
    const { orderIds, status, observation, executedQuantity, executedPrice } = params

    // Verificar que orderIds sea un array válido
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return {
        success: false,
        error: "No se proporcionaron IDs de órdenes válidos",
      }
    }

    // En un entorno real, esto vendría del usuario autenticado
    const currentUser = {
      id: "TRA-001",
      name: "Martín Gómez",
      role: "Mesa",
    }

    // Actualizar cada orden
    const updatedOrders = orderIds.map((orderId) => {
      // Preparar las actualizaciones
      const updates: Partial<OrderType> = {
        status: status,
        updatedAt: new Date(),
      }

      // Asignar trader si es necesario
      if (status === "Tomada" || !updates.traderId) {
        updates.traderId = currentUser.id
        updates.trader = currentUser.name
      }

      // Actualizar datos de ejecución si se proporcionaron
      if (executedQuantity !== undefined) {
        updates.executedQuantity = executedQuantity
      }

      if (executedPrice !== undefined) {
        updates.executedPrice = executedPrice
      }

      // Actualizar la orden
      const updatedOrder = updateMockOrder(orderId, updates)

      // Incrementar el contador de notificaciones
      const updateType = executedQuantity !== undefined || executedPrice !== undefined ? "execution" : "status"
      incrementNotificationCount(orderId, updateType)

      // Añadir observación si se proporcionó
      if (observation && updatedOrder) {
        const newObservation = addMockObservation(orderId, {
          orderId,
          content: observation,
          createdAt: new Date(),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: "Mesa",
        })

        if (newObservation) {
          incrementNotificationCount(orderId, "observation", newObservation.id)
        }
      }

      return updatedOrder
    })

    // Verificar si todas las órdenes se actualizaron correctamente
    const failedUpdates = updatedOrders.filter((order) => order === null).length

    if (failedUpdates > 0) {
      console.warn(`${failedUpdates} órdenes no pudieron ser actualizadas.`)
    }

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/orders")
    revalidatePath("/trading")
    orderIds.forEach((id) => {
      revalidatePath(`/orders/${id}`)
    })

    return {
      success: true,
      message: `${orderIds.length - failedUpdates} orden(es) actualizada(s) a "${status}"`,
    }
  } catch (error) {
    console.error("Error al actualizar el estado:", error)
    return {
      success: false,
      error: "Error al actualizar el estado de la(s) orden(es)",
    }
  }
}

export async function addObservation(orderId: string, content: string) {
  try {
    // En un entorno real, esto vendría del usuario autenticado
    const currentUser = {
      id: "TRA-001",
      name: "Martín Gómez",
      role: "Mesa",
    }

    // Añadir la observación
    const newObservation = addMockObservation(orderId, {
      orderId,
      content,
      createdAt: new Date(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: "Mesa",
    })

    if (!newObservation) {
      return {
        success: false,
        error: "No se pudo añadir la observación. Orden no encontrada.",
      }
    }

    // Incrementar el contador de notificaciones
    incrementNotificationCount(orderId, "observation", newObservation.id)

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/orders")
    revalidatePath("/trading")
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error("Error al añadir observación:", error)
    return { success: false, error: "Error al añadir la observación" }
  }
}

// Añadir la función createOrders al final del archivo, antes de la última llave de cierre
export async function createOrders(formData: OrderFormValues) {
  try {
    console.log("createOrders called with data:", formData)
    const { mode, data } = formData

    // Verify that the client exists
    let clientId: string
    let clientName: string

    if (mode === "individual") {
      clientId = data.clientId
      console.log("Individual order mode, clientId:", clientId)
    } else if (mode === "bulk") {
      clientId = data.clientId
      console.log("Bulk order mode, clientId:", clientId)
    } else if (mode === "swap") {
      clientId = data.clientId
      console.log("Swap order mode, clientId:", clientId)
    } else {
      throw new Error("Modo de formulario no válido")
    }

    // Check if clientId is empty
    if (!clientId) {
      console.error("Client ID is empty")
      return { success: false, error: "ID de cliente no proporcionado" }
    }

    // Intentar obtener el cliente
    let client
    try {
      console.log("Buscando cliente con ID:", clientId)
      client = await getClientById(clientId)

      if (!client) {
        console.error("Cliente no encontrado para ID:", clientId)
        console.log("Creando cliente temporal para continuar")
        // Crear un cliente temporal para evitar que falle la creación de la orden
        client = {
          id: clientId,
          name: `Cliente ${clientId.substring(0, 8)}`,
          idCliente: clientId,
          accountNumber: clientId,
        }
      }
    } catch (error) {
      console.error("Error al buscar cliente:", error)
      // Crear un cliente temporal para evitar que falle la creación de la orden
      client = {
        id: clientId,
        name: `Cliente ${clientId.substring(0, 8)}`,
        idCliente: clientId,
        accountNumber: clientId,
      }
    }

    clientName = client.name || client.denominacion || client.titular || `Cliente ${clientId.substring(0, 8)}`
    console.log("Cliente encontrado o creado:", clientName)

    // Create orders based on mode
    if (mode === "individual") {
      // Get asset information
      const asset = await getAssetById(data.ticker)
      if (!asset) {
        console.error("Asset not found for ticker:", data.ticker)
        return { success: false, error: "Activo no encontrado" }
      }
      console.log("Asset found:", asset.name)

      // Create the order
      console.log("Creating order with data:", {
        clientId: client.id,
        client: clientName,
        assetId: asset.id,
        asset: asset.name,
        ticker: asset.ticker,
        type: data.type,
        quantity: data.quantity,
        price: data.isMarketOrder ? 0 : data.price,
      })

      const newOrder = createMockOrder({
        clientId: client.id,
        client: clientName,
        assetId: asset.id,
        asset: asset.name,
        ticker: asset.ticker,
        type: data.operationType === "buy" ? "Compra" : "Venta",
        quantity: data.quantity,
        price: data.isMarketOrder ? 0 : data.price,
        total: data.isMarketOrder ? 0 : data.quantity * data.price,
        status: "Pendiente",
        notes: (data.isMarketOrder ? "ORDEN A MERCADO. " : "") + (data.notes || ""),
        commercialId: "COM-001",
        commercial: "Juan Pérez",
        observations: [],
        mercado: data.market,
        isMarketOrder: data.isMarketOrder,
      })

      console.log("New order created:", newOrder)

      // Save orders to localStorage
      try {
        if (typeof window !== "undefined") {
          const currentOrders = JSON.parse(localStorage.getItem("mockOrders") || "[]")
          currentOrders.push(newOrder)
          localStorage.setItem("mockOrders", JSON.stringify(currentOrders))
          console.log("Orders saved to localStorage, total count:", currentOrders.length)
        }
      } catch (e) {
        console.warn("Could not save to localStorage:", e)
      }

      // Revalidate routes
      revalidatePath("/")
      revalidatePath("/orders")
      revalidatePath("/trading")

      return {
        success: true,
        message: "Orden creada exitosamente",
        orderId: newOrder.id,
      }
    } else if (mode === "bulk") {
      // Crear múltiples órdenes
      const createdOrders = []

      for (const orderData of data.orders) {
        // Obtener información del activo
        const asset = await getAssetById(orderData.ticker)
        if (!asset) {
          continue // Saltar este activo si no se encuentra
        }

        // Calcular el total
        const total = orderData.quantity * orderData.price

        // Crear la orden
        const newOrder = createMockOrder({
          clientId: client.id,
          client: clientName,
          assetId: asset.id,
          asset: asset.name,
          ticker: asset.ticker,
          type: orderData.type,
          quantity: orderData.quantity,
          price: orderData.price,
          total: total,
          status: "Pendiente",
          notes: data.notes || "",
          commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
          commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
          observations: [],
          plazo: orderData.plazo,
          mercado: orderData.mercado,
          priceType: orderData.priceType,
          minPrice: orderData.usePriceBands ? orderData.minPrice : undefined,
          maxPrice: orderData.usePriceBands ? orderData.maxPrice : undefined,
        })

        createdOrders.push(newOrder)
      }

      // Save orders to localStorage
      try {
        if (typeof window !== "undefined") {
          const currentOrders = JSON.parse(localStorage.getItem("mockOrders") || "[]")
          createdOrders.forEach((order) => currentOrders.push(order))
          localStorage.setItem("mockOrders", JSON.stringify(currentOrders))
          console.log("Bulk orders saved to localStorage, total count:", currentOrders.length)
        }
      } catch (e) {
        console.warn("Could not save bulk orders to localStorage:", e)
      }

      // Revalidar rutas
      revalidatePath("/")
      revalidatePath("/orders")
      revalidatePath("/trading")

      return {
        success: true,
        message: `${createdOrders.length} órdenes creadas exitosamente`,
      }
    } else if (mode === "swap") {
      // Crear orden de venta
      const sellAsset = await getAssetById(data.sellOrder.ticker)
      if (!sellAsset) {
        return { success: false, error: "Activo de venta no encontrado" }
      }

      const sellTotal = data.sellOrder.quantity * data.sellOrder.price

      // Generar un ID único para el grupo de swap
      const swapId = `SWAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      const sellOrder = createMockOrder({
        clientId: client.id,
        client: clientName,
        assetId: sellAsset.id,
        asset: sellAsset.name,
        ticker: sellAsset.ticker,
        type: "Venta",
        quantity: data.sellOrder.quantity,
        price: data.sellOrder.price,
        total: sellTotal,
        status: "Pendiente",
        notes: `Parte de operación swap. ${data.notes || ""}`,
        commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
        commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
        observations: [],
        plazo: data.sellOrder.plazo,
        mercado: data.sellOrder.mercado,
        priceType: data.sellOrder.priceType,
        minPrice: data.sellOrder.usePriceBands ? data.sellOrder.minPrice : undefined,
        maxPrice: data.sellOrder.usePriceBands ? data.sellOrder.maxPrice : undefined,
        // Nuevos campos para swap
        isSwap: true,
        swapId: swapId,
        swapType: "sell",
      })

      // Crear orden de compra
      const buyAsset = await getAssetById(data.buyOrder.ticker)
      if (!buyAsset) {
        return { success: false, error: "Activo de compra no encontrado" }
      }

      const buyTotal = data.buyOrder.quantity * data.buyOrder.price

      const buyOrder = createMockOrder({
        clientId: client.id,
        client: clientName,
        assetId: buyAsset.id,
        asset: buyAsset.name,
        ticker: buyAsset.ticker,
        type: "Compra",
        quantity: data.buyOrder.quantity,
        price: data.buyOrder.price,
        total: buyTotal,
        status: "Pendiente",
        notes: `Parte de operación swap. Fondos provenientes de venta de ${sellAsset.ticker}. ${data.notes || ""}`,
        commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
        commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
        observations: [],
        plazo: data.buyOrder.plazo,
        mercado: data.buyOrder.mercado,
        priceType: data.buyOrder.priceType,
        minPrice: data.buyOrder.usePriceBands ? data.buyOrder.minPrice : undefined,
        maxPrice: data.buyOrder.usePriceBands ? data.buyOrder.maxPrice : undefined,
        // Nuevos campos para swap
        isSwap: true,
        swapId: swapId,
        swapType: "buy",
        relatedOrderId: sellOrder.id,
      })

      // Actualizar la orden de venta con la referencia a la orden de compra
      updateMockOrder(sellOrder.id, {
        relatedOrderId: buyOrder.id,
      })

      // Save orders to localStorage
      try {
        if (typeof window !== "undefined") {
          const currentOrders = JSON.parse(localStorage.getItem("mockOrders") || "[]")
          currentOrders.push(sellOrder, buyOrder)
          localStorage.setItem("mockOrders", JSON.stringify(currentOrders))
          console.log("Swap orders saved to localStorage, total count:", currentOrders.length)
        }
      } catch (e) {
        console.warn("Could not save swap orders to localStorage:", e)
      }

      // Revalidar rutas
      revalidatePath("/")
      revalidatePath("/orders")
      revalidatePath("/trading")

      return {
        success: true,
        message: "Operación swap creada exitosamente",
        orderId: sellOrder.id,
      }
    }

    return { success: false, error: "Modo de formulario no válido" }
  } catch (error) {
    console.error("Error al crear órdenes:", error)
    return { success: false, error: "Error al crear las órdenes" }
  }
}

export interface OrderTypeDefinition {
  id: string
  clientId: string
  assetId: string
  quantity: number
  amount?: number
  price: number
  market: string
  term: string
  status: "pending" | "completed" | "cancelled"
  observations?: string
  createdAt: string
  [key: string]: any
}

export async function getClientsFromSavedFile(): Promise<Client[]> {
  "use server"

  try {
    // En un entorno real, esto podría obtener datos de una API o base de datos
    // Para este ejemplo, simulamos que devuelve datos
    return [
      { id: "1", name: "Cliente 1" },
      { id: "2", name: "Cliente 2" },
      { id: "3", name: "Cliente 3" },
      { id: "4", name: "Cliente 4" },
      { id: "5", name: "Cliente 5" },
    ]
  } catch (error) {
    console.error("Error en getClientsFromSavedFile:", error)
    return [] // Devolver un array vacío en caso de error
  }
}

export async function getAssets(): Promise<Asset[]> {
  // En un entorno real, esto podría obtener datos de una API o base de datos
  // Para este ejemplo, simulamos que devuelve datos
  return [
    { id: "1", ticker: "AAPL", name: "Apple Inc.", lastPrice: 150.25 },
    { id: "2", ticker: "MSFT", name: "Microsoft Corporation", lastPrice: 290.1 },
    { id: "3", ticker: "GOOGL", name: "Alphabet Inc.", lastPrice: 2750.5 },
    { id: "4", ticker: "AMZN", name: "Amazon.com, Inc.", lastPrice: 3300.75 },
    { id: "5", ticker: "FB", name: "Meta Platforms, Inc.", lastPrice: 325.45 },
    { id: "6", ticker: "TSLA", name: "Tesla, Inc.", lastPrice: 850.3 },
    { id: "7", ticker: "NVDA", name: "NVIDIA Corporation", lastPrice: 215.6 },
    { id: "8", ticker: "JPM", name: "JPMorgan Chase & Co.", lastPrice: 150.9 },
    { id: "9", ticker: "V", name: "Visa Inc.", lastPrice: 230.15 },
    { id: "10", ticker: "JNJ", name: "Johnson & Johnson", lastPrice: 170.25 },
  ]
}

export async function createOrderType(
  orderData: Omit<OrderTypeDefinition, "id" | "createdAt" | "status">,
): Promise<OrderTypeDefinition> {
  // En un entorno real, esto enviaría datos a una API o base de datos
  // Para este ejemplo, simulamos que crea una orden y devuelve los datos
  const newOrder: OrderTypeDefinition = {
    ...orderData,
    id: Math.random().toString(36).substring(2, 9),
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/orders")

  return newOrder
}

export async function getOrders(): Promise<OrderTypeDefinition[]> {
  // En un entorno real, esto obtendría datos de una API o base de datos
  // Para este ejemplo, simulamos que devuelve datos
  return [
    {
      id: "1",
      clientId: "1",
      assetId: "1",
      quantity: 10,
      price: 150.25,
      amount: 1502.5,
      market: "BYMA",
      term: "CI",
      status: "pending",
      createdAt: "2023-01-01T12:00:00Z",
    },
    {
      id: "2",
      clientId: "2",
      assetId: "2",
      quantity: 5,
      price: 290.1,
      amount: 1450.5,
      market: "A3",
      term: "24hs",
      status: "completed",
      createdAt: "2023-01-02T14:30:00Z",
    },
    {
      id: "3",
      clientId: "3",
      assetId: "3",
      quantity: 2,
      price: 2750.5,
      amount: 5501.0,
      market: "EXTERIOR",
      term: "CI",
      status: "cancelled",
      createdAt: "2023-01-03T09:15:00Z",
    },
  ]
}

export async function updateOrder(
  orderId: string,
  orderData: Partial<OrderTypeDefinition>,
): Promise<OrderTypeDefinition> {
  // En un entorno real, esto actualizaría datos en una API o base de datos
  // Para este ejemplo, simulamos que actualiza una orden y devuelve los datos

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/orders")

  return {
    id: orderId,
    clientId: "1",
    assetId: "1",
    quantity: 10,
    price: 150.25,
    amount: 1502.5,
    market: "BYMA",
    term: "CI",
    status: orderData.status || "pending",
    createdAt: "2023-01-01T12:00:00Z",
    ...orderData,
  }
}

// Buscar la función que crea órdenes, probablemente se llame createOrder o similar
// Modificar para asegurar que el tipo se mantenga como lo envió el usuario

// Buscar algo como:
// export async function createOrder(orderData: any) {
// Asegurarse de que esta línea no esté sobrescribiendo el tipo:
// orderData.type = "Venta"; // <-- Eliminar o comentar esta línea si existe

// O si hay alguna lógica que esté cambiando el tipo, modificarla para respetar el tipo original:
// Por ejemplo, si hay algo como:
// if (orderData.operationType === "buy") {
//   orderData.type = "Venta"; // <-- Esto está incorrecto, debería ser "Compra"
// }

// Agregar un log para depuración:
// Note: Removed console.log statement that was outside of function scope
