"use server"

import { createClient } from "@/lib/supabase/server"
import type { Orden, OrdenInput, OrdenDetalleInput, OrdenObservacionInput } from "@/lib/types/orden.types"

// Función para obtener todas las órdenes
export async function obtenerOrdenes(estado?: string): Promise<Orden[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from("ordenes")
      .select(`
        *,
        detalles:orden_detalles(*),
        observaciones:orden_observaciones(*)
      `)
      .order("created_at", { ascending: false })

    // Filtrar por estado si se proporciona
    if (estado) {
      query = query.eq("estado", estado)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al obtener órdenes:", error)
      return []
    }

    return data as Orden[]
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

// Función para obtener una orden por ID
export async function obtenerOrdenPorId(id: string): Promise<Orden | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("ordenes")
      .select(`
        *,
        detalles:orden_detalles(*),
        observaciones:orden_observaciones(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error al obtener orden ${id}:`, error)
      return null
    }

    return data as Orden
  } catch (error) {
    console.error(`Error al obtener orden ${id}:`, error)
    return null
  }
}

// Función para crear una nueva orden
export async function crearOrden(
  orden: OrdenInput,
  detalles: OrdenDetalleInput[],
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient()

  try {
    // Iniciar una transacción insertando primero la orden
    const { data: ordenData, error: ordenError } = await supabase.from("ordenes").insert(orden).select().single()

    if (ordenError) {
      console.error("Error al crear orden:", ordenError)
      return { success: false, error: ordenError.message }
    }

    // Obtener el ID de la orden creada
    const ordenId = ordenData.id

    // Añadir el ID de la orden a cada detalle
    const detallesConOrdenId = detalles.map((detalle) => ({
      ...detalle,
      orden_id: ordenId,
    }))

    // Insertar los detalles de la orden
    const { error: detallesError } = await supabase.from("orden_detalles").insert(detallesConOrdenId)

    if (detallesError) {
      console.error("Error al crear detalles de la orden:", detallesError)
      // Aquí deberíamos hacer un rollback, pero Supabase no soporta transacciones explícitas
      // En un caso real, deberíamos eliminar la orden creada
      return { success: false, error: detallesError.message }
    }

    return { success: true, id: ordenId }
  } catch (error) {
    console.error("Error al crear orden:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función para actualizar una orden existente
export async function actualizarOrden(
  id: string,
  datos: Partial<OrdenInput>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("ordenes").update(datos).eq("id", id)

    if (error) {
      console.error(`Error al actualizar orden ${id}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error al actualizar orden ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función para eliminar una orden
export async function eliminarOrden(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Primero eliminar los detalles asociados
    const { error: detallesError } = await supabase.from("orden_detalles").delete().eq("orden_id", id)

    if (detallesError) {
      console.error(`Error al eliminar detalles de la orden ${id}:`, detallesError)
      return { success: false, error: detallesError.message }
    }

    // Luego eliminar las observaciones asociadas
    const { error: observacionesError } = await supabase.from("orden_observaciones").delete().eq("orden_id", id)

    if (observacionesError) {
      console.error(`Error al eliminar observaciones de la orden ${id}:`, observacionesError)
      return { success: false, error: observacionesError.message }
    }

    // Finalmente eliminar la orden
    const { error } = await supabase.from("ordenes").delete().eq("id", id)

    if (error) {
      console.error(`Error al eliminar orden ${id}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar orden ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función para añadir una observación a una orden
export async function agregarObservacion(
  observacion: OrdenObservacionInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("orden_observaciones").insert(observacion).select().single()

    if (error) {
      console.error("Error al agregar observación:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error al agregar observación:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función para actualizar el estado de una orden
export async function actualizarEstadoOrden(
  id: string,
  estado: string,
  observacion: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Actualizar el estado de la orden
    const { error: ordenError } = await supabase.from("ordenes").update({ estado }).eq("id", id)

    if (ordenError) {
      console.error(`Error al actualizar estado de la orden ${id}:`, ordenError)
      return { success: false, error: ordenError.message }
    }

    // Si se proporciona una observación, añadirla
    if (observacion) {
      const observacionData: OrdenObservacionInput = {
        orden_id: id,
        texto: observacion,
        usuario_id: "sistema", // Esto debería venir de la autenticación
        tipo: "cambio_estado",
      }

      const { error: observacionError } = await supabase.from("orden_observaciones").insert(observacionData)

      if (observacionError) {
        console.error(`Error al agregar observación a la orden ${id}:`, observacionError)
        // No hacemos rollback del cambio de estado, pero registramos el error
        return { success: true, error: "Estado actualizado, pero no se pudo agregar la observación" }
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
}

// Función para obtener órdenes por cliente
export async function obtenerOrdenesPorCliente(clienteId: string): Promise<Orden[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("ordenes")
      .select(`
        *,
        detalles:orden_detalles(*),
        observaciones:orden_observaciones(*)
      `)
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
      return []
    }

    return data as Orden[]
  } catch (error) {
    console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
    return []
  }
}

// Get orders by status
export async function obtenerOrdenesPorEstado(estado: string): Promise<Orden[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("ordenes")
      .select(`
        *,
        detalles:orden_detalles(*),
        observaciones:orden_observaciones(*)
      `)
      .eq("estado", estado)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error(`Error al obtener órdenes con estado ${estado}:`, error)
    return []
  }
}

// Export OrdenService as an async function that returns the service object
// This complies with the "use server" directive while providing the expected export
export async function OrdenService() {
  return {
    crearOrden,
    obtenerOrdenes,
    obtenerOrdenPorId,
    actualizarOrden,
    eliminarOrden,
    agregarObservacion,
    actualizarEstadoOrden,
    obtenerOrdenesPorCliente,
    obtenerOrdenesPorEstado,
  }
}
