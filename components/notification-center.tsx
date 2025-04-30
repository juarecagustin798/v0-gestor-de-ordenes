"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { BellOff } from "lucide-react"
import { markNotificationsAsRead } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/types"

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders?: Order[]
  onRefresh?: () => void
}

export function NotificationCenter({ open, onOpenChange, orders = [], onRefresh }: NotificationCenterProps) {
  const router = useRouter()
  const [ordersWithNotifications, setOrdersWithNotifications] = useState<Order[]>([])

  // Filtrar órdenes con notificaciones no leídas
  useEffect(() => {
    setOrdersWithNotifications(orders.filter((order) => order.unreadUpdates && order.unreadUpdates > 0))
  }, [orders])

  // Marcar una orden como leída
  const markAsRead = async (orderId: string) => {
    try {
      await markNotificationsAsRead([orderId])
      toast({
        title: "Notificación",
        description: "Notificación marcada como leída",
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error)
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const orderIds = ordersWithNotifications.map((order) => order.id)
      if (orderIds.length > 0) {
        await markNotificationsAsRead(orderIds)
        toast({
          title: "Notificaciones",
          description: "Todas las notificaciones han sido marcadas como leídas",
        })
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
    }
  }

  // Navegar a la orden
  const navigateToOrder = (orderId: string) => {
    router.push(`/ordenes/${orderId}`)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Centro de Notificaciones</SheetTitle>
          <SheetDescription>
            {ordersWithNotifications.length > 0
              ? "Notificaciones de órdenes actualizadas"
              : "No hay notificaciones nuevas"}
          </SheetDescription>
        </SheetHeader>

        {ordersWithNotifications.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <BellOff className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          </div>
        )}

        <ScrollArea className="mt-4 h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            {ordersWithNotifications.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => navigateToOrder(order.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Orden #{order.orderNumber || order.id.substring(0, 8)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.clientName || "Cliente"} - {order.assetName || "Activo"}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.unreadUpdates} {order.unreadUpdates === 1 ? "actualización" : "actualizaciones"} sin leer
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(order.id)
                    }}
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {ordersWithNotifications.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <p className="text-center text-muted-foreground">No hay notificaciones nuevas</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
