export const dynamic = "force-dynamic"
export const revalidate = 0

import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { OrderStatusChart } from "@/components/dashboard/order-status-chart"
import { OrderTypeChart } from "@/components/dashboard/order-type-chart"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Estadísticas generales */}
        <DashboardStats />

        {/* Gráficos y tablas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <OrderStatusChart />
          <OrderTypeChart />
        </div>

        {/* Órdenes recientes */}
        <RecentOrdersTable />
      </div>
    </DashboardShell>
  )
}
