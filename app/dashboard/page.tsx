import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { OrderStatusChart } from "@/components/dashboard/order-status-chart"
import { OrderTypeChart } from "@/components/dashboard/order-type-chart"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { FavoriteAssetsManager } from "@/components/dashboard/favorite-assets-manager"
import { ClientFileStatus } from "@/components/dashboard/client-file-status"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStats />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <OrderStatusChart />
        <OrderTypeChart />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <div className="md:col-span-2">
          <RecentOrdersTable />
        </div>
        <div>
          <div className="space-y-6">
            <FavoriteAssetsManager />
            <ClientFileStatus />
          </div>
        </div>
      </div>
    </div>
  )
}
