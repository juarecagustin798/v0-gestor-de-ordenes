import { Suspense } from "react"
import { obtenerOrdenes } from "@/lib/services/orden-supabase-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { OrdenesTable } from "@/components/ordenes/ordenes-table"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Órdenes | Gestor de Órdenes",
  description: "Gestión de órdenes de compra y venta",
}

// Componente de carga para la tabla de órdenes
function OrdenesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default async function OrdenesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Órdenes</h1>
        <Link href="/ordenes/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Órdenes</CardTitle>
          <CardDescription>Listado de todas las órdenes de compra y venta registradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrdenesTableSkeleton />}>
            <OrdenesTableWrapper />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente wrapper para cargar los datos de las órdenes
async function OrdenesTableWrapper() {
  // Obtener las órdenes desde Supabase
  const ordenes = await obtenerOrdenes()

  return <OrdenesTable ordenes={ordenes} />
}
