import { NextResponse } from "next/server"
import { actualizarEstadoOrden } from "@/lib/services/orden-supabase-service"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { estado, observacion } = await request.json()

    if (!estado) {
      return NextResponse.json({ error: "El estado es requerido" }, { status: 400 })
    }

    const result = await actualizarEstadoOrden(id, estado, observacion || "")

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al actualizar el estado" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al actualizar estado de la orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar el estado de la orden" }, { status: 500 })
  }
}
