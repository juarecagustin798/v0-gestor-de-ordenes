"use client"

import { createClient } from "@/lib/supabase/client"
import type { OrdenObservacionInput, Orden } from "@/lib/types/orden.types"

// Servicio para interactuar con las tablas de órdenes en Supabase (versión cliente)
export const OrdenService = {
  // Obtener todas las órdenes
  async obtenerOrdenes(): Promise<Orden[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("ordenes")
        .select(`
          *,
          detalles:orden_detalles(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error al obtener órdenes:", error)
      return []
    }
  },

  // Obtener una orden por ID con sus detalles y observaciones
  async obtenerOrdenPorId(id: string): Promise<Orden | null> {
    try {
      const supabase = createClient()

      // Obtener la orden con sus detalles y observaciones
      const { data, error } = await supabase
        .from("ordenes")
        .select(`
          *,
          detalles:orden_detalles(*),
          observaciones:orden_observaciones(*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error(`Error al obtener orden con ID ${id}:`, error)
      return null
    }
  },

  // Obtener órdenes por cliente
  async obtenerOrdenesPorCliente(clienteId: string): Promise<Orden[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("ordenes")
        .select(`
          *,
          detalles:orden_detalles(*)
        `)
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
      return []
    }
  },

  // Obtener órdenes por estado
  async obtenerOrdenesPorEstado(estado: string): Promise<Orden[]> {
    try {
      const supabase = createClient()

      // Asegurar que el estado tenga el formato correcto para la consulta
      const formattedEstado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()

      console.log(`Buscando órdenes con estado: "${formattedEstado}"`)

      const { data, error } = await supabase
        .from("ordenes")
        .select(`
          *,
          detalles:orden_detalles(*)
        `)
        .eq("estado", formattedEstado)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(`Error en la consulta de órdenes por estado ${formattedEstado}:`, error)
        throw error
      }

      console.log(`Encontradas ${data?.length || 0} órdenes con estado ${formattedEstado}`)
      return data || []
    } catch (error) {
      console.error(`Error al obtener órdenes con estado ${estado}:`, error)
      return []
    }
  },

  // Actualizar el estado de una orden
  async actualizarEstadoOrden(
    id: string,
    estado: string,
    observacion?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      // Asegurar que el estado tenga el formato correcto
      const formattedEstado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()

      console.log(`Actualizando orden ${id} a estado: "${formattedEstado}"`)

      // Actualizar el estado de la orden
      const { error } = await supabase
        .from("ordenes")
        .update({ estado: formattedEstado, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      // Si hay observación, agregarla
      if (observacion) {
        await this.agregarObservacion({
          orden_id: id,
          texto: observacion,
        })
      }

      return { success: true }
    } catch (error: any) {
      console.error(`Error al actualizar estado de orden ${id}:`, error)
      return { success: false, error: error.message }
    }
  },

  // Agregar una observación a una orden
  async agregarObservacion(observacion: OrdenObservacionInput): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("orden_observaciones").insert({
        orden_id: observacion.orden_id,
        texto: observacion.texto,
        usuario_id: observacion.usuario_id,
        usuario_nombre: observacion.usuario_nombre,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error(`Error al agregar observación a orden ${observacion.orden_id}:`, error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Cuenta las órdenes por estado
   * @param status Estado de las órdenes a contar
   * @returns Número de órdenes con el estado especificado
   */
  async countOrdersByStatus(status: string): Promise<number> {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .eq("estado", status)

      if (error) {
        console.error("Error al contar órdenes por estado:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error al contar órdenes por estado:", error)
      return 0
    }
  },
}
