"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingOrdersTable } from "@/components/trading-orders-table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, ExternalLink } from "lucide-react"
import { SendOrdersDialog } from "@/components/send-orders-dialog"
import { SentOrdersDialog } from "@/components/sent-orders-dialog"
import { createClient } from "@/lib/supabase/client"

export default function TradingPage() {
  const [counts, setCounts] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0,
    underReview: 0,
    sent: 0,
  })
  const [activeTab, setActiveTab] = useState("pending")
  const [sendOrdersDialogOpen, setSendOrdersDialogOpen] = useState(false)
  const [sentOrdersDialogOpen, setSentOrdersDialogOpen] = useState(false)

  // Función para obtener los conteos de órdenes por estado
  const fetchCounts = async () => {
    try {
      const supabase = createClient()

      // Obtener conteo de órdenes pendientes
      const { count: pendingCount, error: pendingError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Pendiente,estado.eq.pendiente")

      // Obtener conteo de órdenes en progreso (tomadas)
      const { count: inProgressCount, error: inProgressError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Tomada,estado.eq.tomada")

      // Obtener conteo de órdenes completadas
      const { count: completedCount, error: completedError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Ejecutada,estado.eq.ejecutada")

      // Obtener conteo de órdenes canceladas
      const { count: canceledCount, error: canceledError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Cancelada,estado.eq.cancelada")

      // Obtener conteo de órdenes en revisión
      const { count: underReviewCount, error: underReviewError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Revisar,estado.eq.revisar")

      // Obtener conteo de órdenes enviadas al mercado
      const { count: sentCount, error: sentError } = await supabase
        .from("ordenes")
        .select("*", { count: "exact", head: true })
        .or("estado.eq.Enviada,estado.eq.enviada")

      setCounts({
        pending: pendingCount || 0,
        inProgress: inProgressCount || 0,
        completed: completedCount || 0,
        canceled: canceledCount || 0,
        underReview: underReviewCount || 0,
        sent: sentCount || 0,
      })
    } catch (error) {
      console.error("Error al obtener conteos:", error)
    }
  }

  // Configurar suscripción a cambios en tiempo real
  useEffect(() => {
    fetchCounts()

    const supabase = createClient()

    // Suscribirse a cambios en la tabla de órdenes
    const subscription = supabase
      .channel("ordenes-counts")
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "ordenes",
        },
        (payload) => {
          // Actualizar conteos cuando hay cambios
          fetchCounts()
        },
      )
      .subscribe()

    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="Trading" description="Gestiona las órdenes de trading en tiempo real.">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSentOrdersDialogOpen(true)} className="flex items-center">
            <ExternalLink className="mr-2 h-4 w-4" />
            Órdenes en mercado
            {counts.sent > 0 && (
              <Badge variant="secondary" className="ml-2">
                {counts.sent}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setSendOrdersDialogOpen(true)} className="flex items-center">
            <Send className="mr-2 h-4 w-4" />
            Envío de órdenes
          </Button>
        </div>
      </DashboardHeader>
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            Pendientes
            <Badge variant="secondary" className="ml-2">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center">
            En proceso
            <Badge variant="secondary" className="ml-2">
              {counts.inProgress}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="under-review" className="flex items-center">
            En revisión
            <Badge variant="secondary" className="ml-2">
              {counts.underReview}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            Completadas
            <Badge variant="secondary" className="ml-2">
              {counts.completed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="canceled" className="flex items-center">
            Canceladas
            <Badge variant="secondary" className="ml-2">
              {counts.canceled}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <TradingOrdersTable availableActions={["tomar", "cancelar"]} />
        </TabsContent>
        <TabsContent value="in-progress" className="space-y-4">
          <TradingOrdersTable availableActions={["ejecutar", "ejecutarParcial", "revisar", "cancelar"]} />
        </TabsContent>
        <TabsContent value="under-review" className="space-y-4">
          <TradingOrdersTable readOnly={true} status="Revisar" />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <TradingOrdersTable readOnly={true} />
        </TabsContent>
        <TabsContent value="canceled" className="space-y-4">
          <TradingOrdersTable readOnly={true} />
        </TabsContent>
      </Tabs>

      {/* Diálogo de envío de órdenes */}
      <SendOrdersDialog open={sendOrdersDialogOpen} onOpenChange={setSendOrdersDialogOpen} />

      {/* Diálogo de órdenes enviadas al mercado */}
      <SentOrdersDialog open={sentOrdersDialogOpen} onOpenChange={setSentOrdersDialogOpen} />
    </DashboardShell>
  )
}
