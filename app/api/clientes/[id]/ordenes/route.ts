import { NextResponse } from "next/server"
import { obtenerOrdenesPorCliente } from "@/lib/services/orden-supabase-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clienteId = params.id
    const ordenes = await obtenerOrdenesPorCliente(clienteId)

    return NextResponse.json(ordenes)
  } catch (error) {
    console.error("Error obteniendo ordenes:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
