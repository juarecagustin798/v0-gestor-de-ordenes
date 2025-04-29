import { NextResponse } from "next/server"
import { obtenerOrdenPorId } from "@/lib/services/orden-supabase-service"

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
