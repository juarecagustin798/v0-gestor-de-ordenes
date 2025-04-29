"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { OrdenInput, OrdenDetalleInput, OrdenObservacionInput, Orden } from "@/lib/types/orden.types"

// Create a new order
export async function crearOrden(
  orden: OrdenInput,
  detalles: OrdenDetalleInput[],
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createServerClient()

    // Insert the order
    const { data: ordenData, error: ordenError } = await supabase.from("ordenes").insert(orden).select("id").single()

    if (ordenError) throw ordenError

    const ordenId = ordenData.id

    // Insert the order details
    const detallesConOrdenId = detalles.map((detalle) => ({
      ...detalle,
      orden_id: ordenId,
    }))

    const { error: detallesError } = await supabase.from("orden_detalles").insert(detallesConOrdenId)

    if (detallesError) throw detallesError

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/ordenes")

    return { success: true, id: ordenId }
  } catch (error: any) {
    console.error("Error al crear orden:", error)
    return { success: false, error: error.message || "Error al crear la orden" }
  }
}

// Get all orders
export async function obtenerOrdenes(): Promise<Orden[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("ordenes").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

// Get an order by ID with its details and observations
export async function obtenerOrdenPorId(id: string): Promise<Orden | null> {
  try {
    const supabase = createServerClient()

    // Get the order
    const { data: orden, error: ordenError } = await supabase.from("ordenes").select("*").eq("id", id).single()

    if (ordenError) throw ordenError

    // Get the order details
    const { data: detalles, error: detallesError } = await supabase
      .from("orden_detalles")
      .select("*")
      .eq("orden_id", id)

    if (detallesError) throw detallesError

    // Get the order observations
    const { data: observaciones, error: observacionesError } = await supabase
      .from("orden_observaciones")
      .select("*")
      .eq("orden_id", id)
      .order("created_at", { ascending: false })

    if (observacionesError) throw observacionesError

    return {
      ...orden,
      detalles: detalles || [],
      observaciones: observaciones || [],
    }
  } catch (error) {
    console.error(`Error al obtener orden con ID ${id}:`, error)
    return null
  }
}

// Update an order
export async function actualizarOrden(
  id: string,
  datos: Partial<OrdenInput>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("ordenes")
      .update({ ...datos, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath(`/ordenes/${id}`)

    return { success: true }
  } catch (error: any) {
    console.error(`Error al actualizar orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al actualizar la orden" }
  }
}

// Delete an order
export async function eliminarOrden(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Delete the order (foreign key constraints will automatically delete details and observations)
    const { error } = await supabase.from("ordenes").delete().eq("id", id)

    if (error) throw error

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/ordenes")

    return { success: true }
  } catch (error: any) {
    console.error(`Error al eliminar orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al eliminar la orden" }
  }
}

// Add an observation to an order
export async function agregarObservacion(
  observacion: OrdenObservacionInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("orden_observaciones").insert(observacion).select("id").single()

    if (error) throw error

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath(`/ordenes/${observacion.orden_id}`)

    return { success: true, id: data.id }
  } catch (error: any) {
    console.error("Error al agregar observación:", error)
    return { success: false, error: error.message || "Error al agregar la observación" }
  }
}

// Update the status of an order
export async function actualizarEstadoOrden(
  id: string,
  estado: string,
  observacion?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Update the order status
    const { error: ordenError } = await supabase
      .from("ordenes")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (ordenError) throw ordenError

    // If there's an observation, add it
    if (observacion) {
      const { error: observacionError } = await supabase.from("orden_observaciones").insert({
        orden_id: id,
        texto: `Cambio de estado a "${estado}": ${observacion}`,
      })

      if (observacionError) throw observacionError
    }

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath(`/ordenes/${id}`)

    return { success: true }
  } catch (error: any) {
    console.error(`Error al actualizar estado de orden con ID ${id}:`, error)
    return { success: false, error: error.message || "Error al actualizar el estado de la orden" }
  }
}

// Get orders by client
export async function obtenerOrdenesPorCliente(clienteId: string): Promise<Orden[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("ordenes")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error(`Error al obtener órdenes del cliente ${clienteId}:`, error)
    return []
  }
}

// Get orders by status
export async function obtenerOrdenesPorEstado(estado: string): Promise<Orden[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("ordenes")
      .select("*")
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
