import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrderDetails } from "@/components/order-details"
import { getOrderById } from "@/lib/data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic" // Forzar renderizado dinámico

export default async function OrderPage({ params }: { params: { id: string } }) {
  console.log("Renderizando página de orden con ID:", params.id)

  try {
    // Intentar obtener la orden
    const order = await getOrderById(params.id)

    // Si no se encuentra la orden, mostrar la página 404
    if (!order) {
      console.error(`Orden con ID ${params.id} no encontrada`)
      return notFound()
    }

    // Renderizar la página con los detalles de la orden
    return (
      <DashboardShell>
        <DashboardHeader heading={`Orden #${order.id}`} text="Detalles de la orden." />
        <OrderDetails order={order} />
      </DashboardShell>
    )
  } catch (error) {
    console.error(`Error al obtener la orden con ID ${params.id}:`, error)
    return notFound()
  }
}

