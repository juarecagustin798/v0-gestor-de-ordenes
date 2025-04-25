"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { updateOrdenEstado } from "@/lib/services/orden-service"

type Orden = {
  id: string
  estado: string
  created_at: string
  updated_at: string
  observaciones: string | null
  clientes: {
    id: string
    nombre: string
  } | null
  activos: Array<{
    id: string
    tipo: string
    valor: number | null
  }>
}

export function TradingOrdersTableRealtime({ initialOrdenes }: { initialOrdenes: Orden[] }) {
  const [ordenes, setOrdenes] = useState<Orden[]>(initialOrdenes)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("ordenes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ordenes",
        },
        async (payload) => {
          // Cuando hay un cambio, obtenemos los datos actualizados
          const { data } = await supabase
            .from("ordenes")
            .select(`
              *,
              clientes (id, nombre),
              activos (*)
            `)
            .order("created_at", { ascending: false })

          if (data) {
            setOrdenes(data as Orden[])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case "en_proceso":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            En Proceso
          </Badge>
        )
      case "completada":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const handleViewOrder = (id: string) => {
    router.push(`/ordenes/${id}`)
  }

  const handleUpdateEstado = async (id: string, estado: string) => {
    await updateOrdenEstado(id, estado)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead>Actualizada</TableHead>
            <TableHead>Activos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay órdenes disponibles
              </TableCell>
            </TableRow>
          ) : (
            ordenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell>{orden.clientes?.nombre || "Cliente desconocido"}</TableCell>
                <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(orden.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(orden.updated_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
                <TableCell>{orden.activos?.length || 0} activos</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewOrder(orden.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      {orden.estado === "pendiente" && (
                        <DropdownMenuItem onClick={() => handleUpdateEstado(orden.id, "en_proceso")}>
                          Marcar en proceso
                        </DropdownMenuItem>
                      )}
                      {orden.estado === "en_proceso" && (
                        <DropdownMenuItem onClick={() => handleUpdateEstado(orden.id, "completada")}>
                          Marcar completada
                        </DropdownMenuItem>
                      )}
                      {(orden.estado === "pendiente" || orden.estado === "en_proceso") && (
                        <DropdownMenuItem onClick={() => handleUpdateEstado(orden.id, "cancelada")}>
                          Cancelar orden
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
