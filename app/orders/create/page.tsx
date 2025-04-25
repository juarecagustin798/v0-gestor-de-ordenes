import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrderCreationForm } from "@/components/order-creation-form"
import { getClients, getAssets } from "@/lib/data"

export default async function CreateOrderPage() {
  // Obtener los datos necesarios para el formulario
  const clients = await getClients()
  const assets = await getAssets()

  return (
    <DashboardShell>
      <DashboardHeader heading="Crear Orden" text="Crea una nueva orden para un cliente." />
      <div className="grid gap-8">
        <OrderCreationForm clients={clients} assets={assets} />
      </div>
    </DashboardShell>
  )
}

