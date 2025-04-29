import { notFound } from "next/navigation"
import { obtenerOrdenPorId } from "@/lib/services/orden-supabase-service"
import { OrdenDetalleView } from "@/components/ordenes/orden-detalle-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdenPageProps {
  params: {
    id: string
  }
}

export default async function OrdenPage({ params }: OrdenPageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<OrdenDetailSkeleton />}>
        <OrdenDetailWrapper id={params.id} />
      </Suspense>
    </div>
  )
}

// Componente de carga para los detalles de la orden
function OrdenDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}

// Componente wrapper para cargar los datos de la orden
async function OrdenDetailWrapper({ id }: { id: string }) {
  // Obtener la orden desde Supabase
  const orden = await obtenerOrdenPorId(id)

  if (!orden) {
    notFound()
  }

  return <OrdenDetalleView orden={orden} />
}
