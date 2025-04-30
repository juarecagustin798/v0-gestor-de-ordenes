import { NextResponse } from "next/server"
import { obtenerOrdenPorId, actualizarOrden, eliminarOrden } from "@/lib/services/orden-supabase-service"
import type { OrdenInput } from "@/lib/types/orden.types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const orden = await obtenerOrdenPorId(id)

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ orden })
  } catch (error) {
    console.error(`Error al obtener orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener la orden" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const datos = (await request.json()) as Partial<OrdenInput>

    const result = await actualizarOrden(id, datos)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Error al actualizar la orden" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error al actualizar orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await eliminarOrden(id)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Error al eliminar la orden" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error al eliminar orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
