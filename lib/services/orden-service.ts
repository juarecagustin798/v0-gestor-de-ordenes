"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOrdenes() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("ordenes")
    .select(`
      *,
      clientes (id, nombre),
      activos (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }

  return data
}

export async function getOrdenById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("ordenes")
    .select(`
      *,
      clientes (id, nombre, email, telefono),
      activos (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error al obtener orden:", error)
    return null
  }

  return data
}

export async function createOrden(formData: FormData) {
  const supabase = createServerClient()

  // Extraer datos básicos de la orden
  const cliente_id = formData.get("cliente_id") as string
  const observaciones = formData.get("observaciones") as string

  // Iniciar una transacción
  // Nota: Supabase no soporta transacciones directamente en el cliente,
  // así que manejamos esto con múltiples operaciones

  // 1. Crear la orden
  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .insert([{ cliente_id, observaciones, estado: "pendiente" }])
    .select()
    .single()

  if (ordenError) {
    console.error("Error al crear orden:", ordenError)
    return { success: false, error: ordenError.message }
  }

  // 2. Extraer y procesar activos
  const tipos = formData.getAll("tipo") as string[]
  const descripciones = formData.getAll("descripcion") as string[]
  const valores = formData.getAll("valor") as string[]

  const activos = tipos.map((tipo, index) => ({
    orden_id: orden.id,
    tipo,
    descripcion: descripciones[index],
    valor: Number.parseFloat(valores[index]),
  }))

  // 3. Insertar activos
  if (activos.length > 0) {
    const { error: activosError } = await supabase.from("activos").insert(activos)

    if (activosError) {
      console.error("Error al crear activos:", activosError)
      // Idealmente, deberíamos eliminar la orden si falla la inserción de activos
      // pero mantendremos simple este ejemplo
      return { success: false, error: activosError.message }
    }
  }

  revalidatePath("/ordenes")
  return { success: true, data: orden }
}

export async function updateOrdenEstado(id: string, estado: string, observaciones?: string) {
  const supabase = createServerClient()

  const updateData: any = { estado }
  if (observaciones) {
    updateData.observaciones = observaciones
  }

  const { data, error } = await supabase.from("ordenes").update(updateData).eq("id", id).select()

  if (error) {
    console.error("Error al actualizar estado de orden:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/ordenes")
  revalidatePath(`/ordenes/${id}`)
  return { success: true, data }
}

export async function deleteOrden(id: string) {
  const supabase = createServerClient()

  // Debido a las restricciones de clave foránea con ON DELETE CASCADE,
  // los activos asociados se eliminarán automáticamente
  const { error } = await supabase.from("ordenes").delete().eq("id", id)

  if (error) {
    console.error("Error al eliminar orden:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/ordenes")
  return { success: true }
}
