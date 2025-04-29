import { NextResponse } from "next/server"
import { agregarObservacion } from "@/lib/services/orden-supabase-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { observacion } = await request.json()

    if (!observacion) {
      return NextResponse.json({ error: "La observación es requerida" }, { status: 400 })
    }

    const result = await agregarObservacion(id, observacion)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al añadir la observación" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al añadir observación a la orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al añadir la observación" }, { status: 500 })
  }
}
