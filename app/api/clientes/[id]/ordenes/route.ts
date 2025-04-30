import { NextResponse } from "next/server"
import { obtenerOrdenesPorCliente } from "@/lib/services/orden-supabase-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clienteId = params.id
    const ordenes = await obtenerOrdenesPorCliente(clienteId)

    return NextResponse.json({ ordenes })
  } catch (error) {
    console.error(`Error al obtener órdenes del cliente ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener las órdenes del cliente" }, { status: 500 })
  }
}
