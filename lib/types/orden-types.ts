// Tipos para las órdenes
export interface OrdenInput {
  cliente_id: string
  cliente_nombre?: string
  cliente_cuenta?: string
  tipo_operacion: string
  estado?: string
  mercado?: string
  plazo?: string
  notas?: string
}

export interface OrdenDetalleInput {
  orden_id: string
  ticker: string
  cantidad: number
  precio: number
  es_orden_mercado?: boolean
}

export interface OrdenObservacionInput {
  orden_id: string
  usuario_id?: string
  usuario_nombre?: string
  texto: string
}

export interface Orden {
  id: string
  cliente_id: string
  cliente_nombre?: string
  cliente_cuenta?: string
  tipo_operacion: string
  estado: string
  mercado?: string
  plazo?: string
  notas?: string
  created_at: string
  updated_at: string
  detalles?: OrdenDetalle[]
  observaciones?: OrdenObservacion[]
}

export interface OrdenDetalle {
  id: string
  orden_id: string
  ticker: string
  cantidad: number
  precio: number
  es_orden_mercado: boolean
  created_at: string
  updated_at: string
}

export interface OrdenObservacion {
  id: string
  orden_id: string
  usuario_id?: string
  usuario_nombre?: string
  texto: string
  created_at: string
}
