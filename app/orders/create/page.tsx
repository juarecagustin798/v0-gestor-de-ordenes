import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrderCreationForm } from "@/components/new-order-form/order-creation-form"
import { getClients, getAssets } from "@/lib/data"

export default async function CreateOrderPage() {
  // Obtener los datos necesarios para el formulario
  const clients = await getClients()
  const assets = await getAssets()

  // Buscar la función que maneja la creación de órdenes
  // Modificar para asegurar que el tipo se mantenga como lo envió el usuario

  // Buscar algo como:
  const handleCreateOrder = async (formData: any) => {
    // Asegurarse de que esta línea no esté sobrescribiendo el tipo:
    // formData.type = "Venta"; // <-- Eliminar o comentar esta línea si existe

    // Agregar un log para depuración:
    console.log("Tipo de operación antes de enviar a createOrder:", formData.type)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Crear Orden" text="Crea una nueva orden para un cliente." />
      <div className="grid gap-8">
        <OrderCreationForm clients={clients} assets={assets} />
      </div>
    </DashboardShell>
  )
}
