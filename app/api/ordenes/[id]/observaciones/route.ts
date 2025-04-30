import { NextResponse } from "next/server"
import { agregarObservacion } from "@/lib/services/orden-supabase-service"
import type { OrdenObservacionInput } from "@/lib/types/orden.types"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { observacion } = (await request.json()) as { observacion: string }

    // Crear el objeto de observación
    const observacionData: OrdenObservacionInput = {
      orden_id: id,
      texto: observacion,
      usuario_id: "sistema", // Esto debería venir de la autenticación
      tipo: "general",
    }

    const result = await agregarObservacion(observacionData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.error || "Error al agregar la observación" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error al agregar observación a orden ${params.id}:`, error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
