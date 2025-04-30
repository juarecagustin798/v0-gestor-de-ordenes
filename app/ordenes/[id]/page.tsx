import { OrdenDetalleView } from "@/components/ordenes/orden-detalle-view"
import { notFound } from "next/navigation"

interface OrdenPageProps {
  params: {
    id: string
  }
}

export default function OrdenPage({ params }: OrdenPageProps) {
  // Validar que el ID sea un formato válido
  if (!params.id || params.id === "undefined") {
    return notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Detalle de Orden</h1>
      <OrdenDetalleView ordenId={params.id} />
    </div>
  )
}
