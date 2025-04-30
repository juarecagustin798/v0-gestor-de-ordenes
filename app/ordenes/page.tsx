import { OrdenesTable } from "@/components/ordenes/ordenes-table"

export default function OrdenesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Órdenes</h1>
      <OrdenesTable />
    </div>
  )
}
