import { NextResponse } from "next/server"
import { obtenerOrdenes, crearOrden } from "@/lib/services/orden-supabase-service"
import type { OrdenInput, OrdenDetalleInput } from "@/lib/types/orden.types"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")

    // Obtener órdenes, filtrando por estado si se proporciona
    const ordenes = await obtenerOrdenes(estado || undefined)

    return NextResponse.json({ ordenes })
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orden, detalles } = body as {
      orden: OrdenInput
      detalles: OrdenDetalleInput[]
    }

    const result = await crearOrden(orden, detalles)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.error || "Error al crear la orden" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error al crear orden:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
