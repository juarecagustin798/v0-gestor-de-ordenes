import { NextResponse } from "next/server"
import { actualizarEstadoOrden } from "@/lib/services/orden-supabase-service"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { estado, observacion } = (await request.json()) as {
      estado: string
      observacion: string
    }

    const result = await actualizarEstadoOrden(id, estado, observacion)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Error al actualizar el estado de la orden" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error al actualizar estado de orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
