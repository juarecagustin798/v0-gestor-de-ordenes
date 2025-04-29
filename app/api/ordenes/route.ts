import { NextResponse } from "next/server"
import { obtenerOrdenes, obtenerOrdenesPorEstado } from "@/lib/services/orden-supabase-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")

    let ordenes
    if (estado) {
      ordenes = await obtenerOrdenesPorEstado(estado)
    } else {
      ordenes = await obtenerOrdenes()
    }

    return NextResponse.json({ ordenes })
  } catch (error) {
    console.error("Error en API de órdenes:", error)
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 })
  }
}
