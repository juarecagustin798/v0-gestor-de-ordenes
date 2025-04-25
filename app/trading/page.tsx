import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TradingOrdersTable } from "@/components/trading-orders-table"
import { getPendingOrders, getInProgressOrders, getCompletedOrders, getCanceledOrders, getTraders } from "@/lib/data"

// Marcar la página como dinámica para que se actualice con cada solicitud
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TradingDashboardPage() {
  // Obtener las órdenes para cada pestaña
  const pendingOrders = await getPendingOrders()
  const inProgressOrders = await getInProgressOrders()
  const completedOrders = await getCompletedOrders()
  const canceledOrders = await getCanceledOrders()
  const traders = await getTraders()

  return (
    <DashboardShell>
      <DashboardHeader heading="Mesa de Trading" text="Gestiona y ejecuta las órdenes recibidas de los comerciales." />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendientes{" "}
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {pendingOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            En Proceso{" "}
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {inProgressOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas{" "}
            <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
              {completedOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Canceladas{" "}
            <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
              {canceledOrders.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <TradingOrdersTable
            orders={pendingOrders}
            traders={traders}
            availableActions={["tomar", "ejecutar", "ejecutarParcial", "revisar", "cancelar"]}
          />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <TradingOrdersTable
            orders={inProgressOrders}
            traders={traders}
            availableActions={["ejecutar", "ejecutarParcial", "revisar", "cancelar"]}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TradingOrdersTable orders={completedOrders} traders={traders} availableActions={[]} readOnly={true} />
        </TabsContent>

        <TabsContent value="canceled" className="mt-6">
          <TradingOrdersTable orders={canceledOrders} traders={traders} availableActions={[]} readOnly={true} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

