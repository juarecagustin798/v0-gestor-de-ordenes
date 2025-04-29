import Link from "next/link"
import { getOrders } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic" // Forzar renderizado dinámico

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <DashboardShell>
      <DashboardHeader heading="Órdenes" text="Gestiona las órdenes de tus clientes.">
        <Link href="/orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4">
        <h2 className="text-xl font-bold">Lista de órdenes</h2>
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Orden #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {order.client} | Activo: {order.ticker} | Estado: {order.status}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </Link>
                  <Link href={`/orders/${order.id}/test`}>
                    <Button variant="ghost" size="sm">
                      Página de prueba
                    </Button>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  )
}
