export interface Observation {
  id: string
  orderId: string
  content: string
  createdAt: Date
  userId: string
  userName: string
  userRole: string
}

export interface Order {
  id: string
  clientId: string
  client: string
  assetId: string
  asset: string
  ticker: string
  type: "Compra" | "Venta"
  quantity: number
  price: number
  total: number
  status: string //"Pendiente" | "Tomada" | "Ejecutada" | "Ejecutada parcial" | "Cancelada" | "Revisar"
  createdAt: Date
  updatedAt: Date
  notes: string
  commercialId: string
  commercial: string
  traderId?: string
  trader?: string
  observations: Observation[]
  executedQuantity?: number
  executedPrice?: number
  unreadUpdates?: number // Contador de actualizaciones no leídas
  lastUpdateType?: "status" | "observation" | "execution" // Tipo de la última actualización
  unreadElements?: {
    status?: boolean // Estado no leído
    execution?: boolean // Detalles de ejecución no leídos
    observations?: string[] // IDs de observaciones no leídas
  }
  // Nuevos campos para órdenes
  plazo?: "CI" | "24hs"
  mercado?: "BYMA" | "A3" | "SENEBI/SISTACO" | "Exterior"
  priceType?: "money" | "yield"
  minPrice?: number
  maxPrice?: number
  // Campos para swaps
  isSwap?: boolean
  swapId?: string // ID del grupo de swap
  swapType?: "buy" | "sell" // Indica si es la parte de compra o venta del swap
  relatedOrderId?: string // ID de la orden relacionada en el swap
}

export interface Client {
  id: string
  // Campos originales que podrían seguir siendo útiles
  name?: string
  documentType?: string
  documentNumber?: string
  accountNumber?: string
  email?: string
  phone?: string
  address?: string
  commercialId?: string

  // Nuevos campos según las columnas del archivo
  idCliente?: string
  tipoCuenta?: string
  estado?: string
  denominacion?: string
  cuentaEspecial?: string
  alias?: string
  titular?: string
  tipoTitular?: string
  cartera?: string
  categoria?: string
  administrador?: string
  operador?: string
  sucursal?: string
  claseCuenta?: string
  cuit?: string
  ganancias?: string
  iva?: string
}

export interface Asset {
  id: string
  name: string
  ticker: string
  type: string
  market: string
  currency: string
  lastPrice: number
  change: number
  volume: number
  maturityDate?: string // Añadir este campo opcional
}

export interface User {
  id: string
  name: string
  email: string
  role: "Comercial" | "Mesa"
}

export interface StatusUpdateParams {
  orderIds: string[]
  status: string
  observation?: string
  executedQuantity?: number
  executedPrice?: number
}

export interface NotificationState {
  orderIds: string[]
  counts: { [orderId: string]: number }
  unreadElements: {
    [orderId: string]: {
      status?: boolean
      execution?: boolean
      observations?: string[]
    }
  }
}

export interface OrderFormValues {
  mode: "individual" | "bulk" | "swap"
  clientId: string
  assetId: string
  type: "Compra" | "Venta"
  quantity: number
  price: number
  notes: string
}

export enum OrderStatus {
  PENDING = "Pendiente",
  TAKEN = "Tomada",
  EXECUTED = "Ejecutada",
  PARTIALLY_EXECUTED = "Ejecutada parcial",
  CANCELLED = "Cancelada",
  REVIEW = "Revisar",
}
