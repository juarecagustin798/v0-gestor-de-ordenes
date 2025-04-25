"use server"

import type { OrderFormValues, StatusUpdateParams, Order, NotificationState } from "./types"
import { updateMockOrder, addMockObservation, createMockOrder, getOrderById } from "./data"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getClientById, getAssetById } from "./data"
// Añadir la importación de OrderFormValues al principio del archivo
// import { OrderFormValues } from "./types-order-form"

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

export async function createOrder(data: OrderFormValues) {
  try {
    // Obtener información del cliente y del activo
    const client = await getClientById(data.clientId)
    const asset = await getAssetById(data.assetId)

    if (!client || !asset) {
      throw new Error("Cliente o activo no encontrado")
    }

    // Calcular el total
    const total = data.quantity * data.price

    // Crear la orden usando la función createMockOrder
    const newOrder = createMockOrder({
      clientId: client.id,
      client: client.name,
      assetId: asset.id,
      asset: asset.name,
      ticker: asset.ticker,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      total: total,
      status: "Pendiente",
      notes: data.notes,
      commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
      commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
      observations: [],
      unreadUpdates: 0,
      lastUpdateType: undefined,
    })

    console.log("Orden creada:", newOrder)

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
      const updates: Partial<Order> = {
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
    const { mode, data } = formData

    // Verificar que el cliente existe
    let clientId: string
    let clientName: string

    if (mode === "individual") {
      clientId = data.clientId
    } else if (mode === "bulk") {
      clientId = data.clientId
    } else if (mode === "swap") {
      clientId = data.clientId
    } else {
      throw new Error("Modo de formulario no válido")
    }

    const client = await getClientById(clientId)
    if (!client) {
      return { success: false, error: "Cliente no encontrado" }
    }
    clientName = client.name

    // Crear órdenes según el modo
    if (mode === "individual") {
      // Obtener información del activo
      const asset = await getAssetById(data.ticker)
      if (!asset) {
        return { success: false, error: "Activo no encontrado" }
      }

      // Calcular el total
      const total = data.quantity * data.price

      // Crear la orden
      const newOrder = createMockOrder({
        clientId: client.id,
        client: client.name,
        assetId: asset.id,
        asset: asset.name,
        ticker: asset.ticker,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        total: total,
        status: "Pendiente",
        notes: data.notes || "",
        commercialId: "COM-001", // En un entorno real, esto vendría del usuario autenticado
        commercial: "Juan Pérez", // En un entorno real, esto vendría del usuario autenticado
        observations: [],
        plazo: data.plazo,
        mercado: data.mercado,
        priceType: data.priceType,
        minPrice: data.usePriceBands ? data.minPrice : undefined,
        maxPrice: data.usePriceBands ? data.maxPrice : undefined,
      })

      console.log("Nueva orden creada:", newOrder)

      // Revalidar rutas
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
          client: client.name,
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
        client: client.name,
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
        client: client.name,
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

