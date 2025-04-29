"use client"

import type { OrdenInput, OrdenDetalleInput, Orden } from "@/lib/types/orden.types"

// Cliente proxy para el servicio de órdenes
// Este archivo se usa en componentes del cliente para acceder a las funciones del servidor
export const OrdenService = {
  // Obtener todas las órdenes
  obtenerOrdenes: async (): Promise<Orden[]> => {
    try {
      const response = await fetch("/api/ordenes")
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes: ${response.statusText}`)
      }
      const data = await response.json()
      return data.ordenes || []
    } catch (error) {
      console.error("Error al obtener órdenes:", error)
      return []
    }
  },

  // Obtener una orden por ID
  obtenerOrdenPorId: async (id: string): Promise<Orden | null> => {
    try {
      const response = await fetch(`/api/ordenes/${id}`)
      if (!response.ok) {
        throw new Error(`Error al obtener orden: ${response.statusText}`)
      }
      const data = await response.json()
      return data.orden || null
    } catch (error) {
      console.error(`Error al obtener orden ${id}:`, error)
      return null
    }
  },

  actualizarOrden: async (id: string, datos: Partial<OrdenInput>): Promise<{ success: boolean; error?: string }> => {
    const response = await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })
    return response.json()
  },

  eliminarOrden: async (id: string): Promise<{ success: boolean; error?: string }> => {
    const response = await fetch(`/api/ordenes/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },

  // Añadir observación a una orden
  agregarObservacion: async (id: string, observacion: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/ordenes/${id}/observaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ observacion }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || `Error al añadir observación: ${response.statusText}`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error(`Error al añadir observación a la orden ${id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  },

  // Actualizar el estado de una orden
  actualizarEstadoOrden: async (
    id: string,
    estado: string,
    observacion: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/ordenes/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado, observacion }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || `Error al actualizar estado: ${response.statusText}`,
        }
      }

      return { success: true }
    } catch (error) {
      console.error(`Error al actualizar estado de la orden ${id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  },

  // Obtener órdenes por cliente
  obtenerOrdenesPorCliente: async (clienteId: string): Promise<Orden[]> => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/ordenes`)
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes del cliente: ${response.statusText}`)
      }
      const data = await response.json()
      return data.ordenes || []
    } catch (error) {
      console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
      return []
    }
  },

  // Obtener órdenes por estado
  obtenerOrdenesPorEstado: async (estado: string): Promise<Orden[]> => {
    try {
      const response = await fetch(`/api/ordenes?estado=${encodeURIComponent(estado)}`)
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes por estado: ${response.statusText}`)
      }
      const data = await response.json()
      return data.ordenes || []
    } catch (error) {
      console.error(`Error al obtener órdenes con estado ${estado}:`, error)
      return []
    }
  },

  crearOrden: async (
    orden: OrdenInput,
    detalles: OrdenDetalleInput[],
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    const response = await fetch("/api/ordenes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orden, detalles }),
    })
    return response.json()
  },
}
