import { getClientes } from "@/lib/services/cliente-service"
import { OrderCreationForm } from "@/components/orders/order-creation-form"

export default async function NuevaOrdenPage() {
  const clientes = await getClientes()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Orden</h1>
      <OrderCreationForm clientes={clientes} />
    </div>
  )
}
