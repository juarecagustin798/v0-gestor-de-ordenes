"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getClientes() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("clientes").select("*").order("nombre")

  if (error) {
    console.error("Error al obtener clientes:", error)
    return []
  }

  return data
}

export async function getClienteById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single()

  if (error) {
    console.error("Error al obtener cliente:", error)
    return null
  }

  return data
}

export async function createCliente(formData: FormData) {
  const supabase = createServerClient()

  const nombre = formData.get("nombre") as string
  const email = formData.get("email") as string
  const telefono = formData.get("telefono") as string

  const { data, error } = await supabase.from("clientes").insert([{ nombre, email, telefono }]).select()

  if (error) {
    console.error("Error al crear cliente:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/clientes")
  return { success: true, data }
}

export async function updateCliente(id: string, formData: FormData) {
  const supabase = createServerClient()

  const nombre = formData.get("nombre") as string
  const email = formData.get("email") as string
  const telefono = formData.get("telefono") as string

  const { data, error } = await supabase.from("clientes").update({ nombre, email, telefono }).eq("id", id).select()

  if (error) {
    console.error("Error al actualizar cliente:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/clientes")
  revalidatePath(`/clientes/${id}`)
  return { success: true, data }
}

export async function deleteCliente(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("clientes").delete().eq("id", id)

  if (error) {
    console.error("Error al eliminar cliente:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/clientes")
  return { success: true }
}
