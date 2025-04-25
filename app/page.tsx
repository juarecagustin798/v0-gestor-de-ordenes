import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrdersTable } from "@/components/orders-table"
import { Button } from "@/components/ui/button"
import { getOrders } from "@/lib/data"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
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
      <OrdersTable orders={orders} />
    </DashboardShell>
  )
}

