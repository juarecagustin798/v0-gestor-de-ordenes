import type { Order, Client, Asset, User, Observation } from "./types"

// Modificar algunas órdenes de ejemplo para incluir notificaciones no leídas
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    clientId: "CLI-001",
    client: "Carlos Rodríguez",
    assetId: "GGAL",
    asset: "Grupo Financiero Galicia",
    ticker: "GGAL",
    type: "Compra",
    quantity: 100,
    price: 1500,
    total: 150000,
    status: "Pendiente",
    createdAt: new Date(2023, 10, 15),
    updatedAt: new Date(2023, 10, 15),
    notes: "",
    commercialId: "COM-001",
    commercial: "Juan Pérez",
    observations: [],
    unreadUpdates: 0, // Sin notificaciones
  },
  {
    id: "ORD-002",
    clientId: "CLI-002",
    client: "María González",
    assetId: "YPF",
    asset: "YPF S.A.",
    ticker: "YPF",
    type: "Venta",
    quantity: 50,
    price: 2200,
    total: 110000,
    status: "Tomada",
    createdAt: new Date(2023, 10, 14),
    updatedAt: new Date(2023, 10, 16),
    notes: "Cliente solicita ejecución rápida",
    commercialId: "COM-001",
    commercial: "Juan Pérez",
    traderId: "TRA-001",
    trader: "Martín Gómez",
    observations: [
      {
        id: "OBS-001",
        orderId: "ORD-002",
        content: "Orden tomada, se ejecutará en la próxima rueda",
        createdAt: new Date(2023, 10, 16, 10, 30),
        userId: "TRA-001",
        userName: "Martín Gómez",
        userRole: "Mesa",
      },
    ],
    unreadUpdates: 2, // 2 notificaciones no leídas
    lastUpdateType: "status", // Tipo de la última actualización
    unreadElements: {
      status: true,
      observations: ["OBS-001"],
    },
  },
  {
    id: "ORD-003",
    clientId: "CLI-003",
    client: "Luis Martínez",
    assetId: "PAMP",
    asset: "Pampa Energía",
    ticker: "PAMP",
    type: "Compra",
    quantity: 200,
    price: 800,
    total: 160000,
    status: "Ejecutada",
    createdAt: new Date(2023, 10, 10),
    updatedAt: new Date(2023, 10, 12),
    notes: "",
    commercialId: "COM-002",
    commercial: "Ana López",
    traderId: "TRA-002",
    trader: "Laura Sánchez",
    executedQuantity: 200,
    executedPrice: 795,
    observations: [
      {
        id: "OBS-002",
        orderId: "ORD-003",
        content: "Orden ejecutada a $795, mejor precio que el solicitado",
        createdAt: new Date(2023, 10, 12, 14, 45),
        userId: "TRA-002",
        userName: "Laura Sánchez",
        userRole: "Mesa",
      },
    ],
  },
  {
    id: "ORD-004",
    clientId: "CLI-004",
    client: "Ana Fernández",
    assetId: "TXAR",
    asset: "Ternium Argentina",
    ticker: "TXAR",
    type: "Venta",
    quantity: 75,
    price: 1200,
    total: 90000,
    status: "Cancelada",
    createdAt: new Date(2023, 10, 8),
    updatedAt: new Date(2023, 10, 9),
    notes: "Cancelada a pedido del cliente",
    commercialId: "COM-002",
    commercial: "Ana López",
    traderId: "TRA-001",
    trader: "Martín Gómez",
    observations: [
      {
        id: "OBS-003",
        orderId: "ORD-004",
        content: "Orden cancelada a pedido del comercial",
        createdAt: new Date(2023, 10, 9, 9, 15),
        userId: "TRA-001",
        userName: "Martín Gómez",
        userRole: "Mesa",
      },
    ],
  },
  {
    id: "ORD-005",
    clientId: "CLI-001",
    client: "Carlos Rodríguez",
    assetId: "BBAR",
    asset: "Banco BBVA Argentina",
    ticker: "BBAR",
    type: "Compra",
    quantity: 150,
    price: 950,
    total: 142500,
    status: "Revisar",
    createdAt: new Date(2023, 10, 17),
    updatedAt: new Date(2023, 10, 17),
    notes: "",
    commercialId: "COM-001",
    commercial: "Juan Pérez",
    traderId: "TRA-002",
    trader: "Laura Sánchez",
    observations: [
      {
        id: "OBS-004",
        orderId: "ORD-005",
        content: "Precio muy alejado del mercado, por favor confirmar con el cliente",
        createdAt: new Date(2023, 10, 17, 11, 20),
        userId: "TRA-002",
        userName: "Laura Sánchez",
        userRole: "Mesa",
      },
      {
        id: "OBS-005",
        orderId: "ORD-005",
        content: "Cliente confirma el precio, proceder con la ejecución",
        createdAt: new Date(2023, 10, 17, 14, 10),
        userId: "COM-001",
        userName: "Juan Pérez",
        userRole: "Comercial",
      },
    ],
  },
  {
    id: "ORD-006",
    clientId: "CLI-005",
    client: "Roberto Sánchez",
    assetId: "CEPU",
    asset: "Central Puerto",
    ticker: "CEPU",
    type: "Compra",
    quantity: 300,
    price: 1100,
    total: 330000,
    status: "Ejecutada parcial",
    createdAt: new Date(2023, 10, 16),
    updatedAt: new Date(2023, 10, 18),
    notes: "",
    commercialId: "COM-001",
    commercial: "Juan Pérez",
    traderId: "TRA-003",
    trader: "Diego Fernández",
    executedQuantity: 200,
    executedPrice: 1105,
    observations: [
      {
        id: "OBS-006",
        orderId: "ORD-006",
        content: "Ejecutado parcialmente 200 de 300 acciones. Continuaremos mañana con el resto.",
        createdAt: new Date(2023, 10, 18, 16, 30),
        userId: "TRA-003",
        userName: "Diego Fernández",
        userRole: "Mesa",
      },
    ],
    unreadUpdates: 2,
    lastUpdateType: "execution",
    unreadElements: {
      execution: true,
      observations: ["OBS-006"],
    },
  },
  {
    id: "ORD-007",
    clientId: "CLI-002",
    client: "María González",
    assetId: "SUPV",
    asset: "Grupo Supervielle",
    ticker: "SUPV",
    type: "Venta",
    quantity: 120,
    price: 650,
    total: 78000,
    status: "Pendiente",
    createdAt: new Date(2023, 10, 18),
    updatedAt: new Date(2023, 10, 18),
    notes: "",
    commercialId: "COM-001",
    commercial: "Juan Pérez",
    observations: [],
  },
  {
    id: "ORD-008",
    clientId: "CLI-003",
    client: "Luis Martínez",
    assetId: "ALUA",
    asset: "Aluar Aluminio Argentino",
    ticker: "ALUA",
    type: "Compra",
    quantity: 250,
    price: 780,
    total: 195000,
    status: "Pendiente",
    createdAt: new Date(2023, 10, 18),
    updatedAt: new Date(2023, 10, 18),
    notes: "Cliente solicita compra al cierre",
    commercialId: "COM-002",
    commercial: "Ana López",
    observations: [],
  },
]

// Función para crear una nueva orden en los datos de ejemplo
export function createMockOrder(orderData: Partial<Order>): Order {
  // Generar un ID único para la nueva orden
  const newId = `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`

  // Crear la nueva orden con valores predeterminados y los datos proporcionados
  const newOrder: Order = {
    id: newId,
    clientId: "",
    client: "",
    assetId: "",
    asset: "",
    ticker: "",
    type: "Compra",
    quantity: 0,
    price: 0,
    total: 0,
    status: "Pendiente",
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: "",
    commercialId: "",
    commercial: "",
    observations: [],
    ...orderData,
    // Calcular el total si no se proporciona
    total: orderData.total || (orderData.quantity && orderData.price ? orderData.quantity * orderData.price : 0),
  }

  // Añadir la nueva orden al array de órdenes
  mockOrders.push(newOrder)

  return newOrder
}

// Función para actualizar una orden en los datos de ejemplo
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

  return newObservation
}

// Lista de clientes
export const mockClients: Client[] = [
  {
    id: "CLI-001",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "11-1234-5678",
    documentType: "DNI",
    documentNumber: "25678901",
    address: "Av. Corrientes 1234, CABA",
    accountNumber: "ACC-001",
    commercialId: "COM-001",
  },
  {
    id: "CLI-002",
    name: "María González",
    email: "maria.gonzalez@ejemplo.com",
    phone: "11-2345-6789",
    documentType: "DNI",
    documentNumber: "27890123",
    address: "Av. Santa Fe 567, CABA",
    accountNumber: "ACC-002",
    commercialId: "COM-001",
  },
  {
    id: "CLI-003",
    name: "Luis Martínez",
    email: "luis.martinez@ejemplo.com",
    phone: "11-3456-7890",
    documentType: "DNI",
    documentNumber: "30123456",
    address: "Av. Cabildo 890, CABA",
    accountNumber: "ACC-003",
    commercialId: "COM-002",
  },
  {
    id: "CLI-004",
    name: "Ana Fernández",
    email: "ana.fernandez@ejemplo.com",
    phone: "11-4567-8901",
    documentType: "DNI",
    documentNumber: "28901234",
    address: "Av. Rivadavia 1234, CABA",
    accountNumber: "ACC-004",
    commercialId: "COM-002",
  },
  {
    id: "CLI-005",
    name: "Roberto Sánchez",
    email: "roberto.sanchez@ejemplo.com",
    phone: "11-5678-9012",
    documentType: "DNI",
    documentNumber: "26789012",
    address: "Av. Belgrano 567, CABA",
    accountNumber: "ACC-005",
    commercialId: "COM-001",
  },
]

// Lista de activos financieros
export const mockAssets: Asset[] = [
  {
    id: "GGAL",
    name: "Grupo Financiero Galicia",
    ticker: "GGAL",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 1500,
    change: 2.5,
    volume: 1000000,
  },
  {
    id: "YPF",
    name: "YPF S.A.",
    ticker: "YPF",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 2200,
    change: -1.2,
    volume: 1500000,
  },
  {
    id: "PAMP",
    name: "Pampa Energía",
    ticker: "PAMP",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 800,
    change: 0.8,
    volume: 800000,
  },
  {
    id: "TXAR",
    name: "Ternium Argentina",
    ticker: "TXAR",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 1200,
    change: 1.5,
    volume: 600000,
  },
  {
    id: "BBAR",
    name: "Banco BBVA Argentina",
    ticker: "BBAR",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 950,
    change: -0.5,
    volume: 700000,
  },
  {
    id: "CEPU",
    name: "Central Puerto",
    ticker: "CEPU",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 1100,
    change: 3.2,
    volume: 900000,
  },
  {
    id: "SUPV",
    name: "Grupo Supervielle",
    ticker: "SUPV",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 650,
    change: 1.8,
    volume: 500000,
  },
  {
    id: "ALUA",
    name: "Aluar Aluminio Argentino",
    ticker: "ALUA",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 780,
    change: 0.3,
    volume: 400000,
  },
  {
    id: "TECO2",
    name: "Telecom Argentina",
    ticker: "TECO2",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 1050,
    change: -0.7,
    volume: 550000,
  },
  {
    id: "TGSU2",
    name: "Transportadora de Gas del Sur",
    ticker: "TGSU2",
    type: "Acción",
    market: "BYMA",
    currency: "ARS",
    lastPrice: 920,
    change: 1.1,
    volume: 450000,
  },
]

// Comerciales
export const mockCommercials = [
  {
    id: "COM-001",
    name: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    phone: "11-1111-1111",
  },
  {
    id: "COM-002",
    name: "Ana López",
    email: "ana.lopez@ejemplo.com",
    phone: "11-2222-2222",
  },
]

// Traders (Mesa de Trading)
export const mockTraders: User[] = [
  {
    id: "TRA-001",
    name: "Martín Gómez",
    email: "martin.gomez@ejemplo.com",
    role: "Mesa",
  },
  {
    id: "TRA-002",
    name: "Laura Sánchez",
    email: "laura.sanchez@ejemplo.com",
    role: "Mesa",
  },
  {
    id: "TRA-003",
    name: "Diego Fernández",
    email: "diego.fernandez@ejemplo.com",
    role: "Mesa",
  },
]

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

// Modificar las funciones de obtención de órdenes para asegurar el filtrado correcto

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

// Nueva función para obtener órdenes canceladas
export async function getCanceledOrders(): Promise<Order[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const canceledOrders = mockOrders.filter((order) => order.status === "Cancelada")
      resolve(canceledOrders)
    }, 100)
  })
}

// Buscar la función getOrderById y asegurarse de que está devolviendo la orden correctamente
// Modificar la función para que imprima el ID que está buscando y el resultado

export async function getOrderById(id: string): Promise<Order | undefined> {
  console.log(`Buscando orden con ID: ${id}`)

  // Verificar que el ID no sea undefined o null
  if (!id) {
    console.error("ID de orden no válido:", id)
    return undefined
  }

  // Buscar la orden directamente en el array (sin Promise ni setTimeout)
  const order = mockOrders.find((order) => order.id === id)

  // Registrar el resultado para depuración
  console.log(`Resultado de búsqueda para ID ${id}:`, order ? "Orden encontrada" : "Orden no encontrada")

  // Devolver la orden encontrada o undefined
  return order
}

export async function getClients(): Promise<Client[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClients)
    }, 500)
  })
}

export async function getClientById(id: string): Promise<Client | undefined> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const client = mockClients.find((client) => client.id === id)
      resolve(client)
    }, 500)
  })
}

export async function getAssets(): Promise<Asset[]> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAssets)
    }, 500)
  })
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  // Simular una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      const asset = mockAssets.find((asset) => asset.id === id)
      resolve(asset)
    }, 500)
  })
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

