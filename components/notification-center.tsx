"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BellOff, Bell } from "lucide-react"
import { markNotificationsAsRead } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"
import { useRouter } from "next/navigation"

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders?: Order[] // Ahora las órdenes son opcionales y se pasan como prop
  onRefresh?: () => void // Callback para refrescar las órdenes
}

export function NotificationCenter({
  open,
  onOpenChange,
  orders = [], // Valor por defecto: array vacío
  onRefresh,
}: NotificationCenterProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "unread">("unread")

  // Filtrar órdenes con notificaciones
  const ordersWithNotifications = orders.filter((order) => order.unreadUpdates && order.unreadUpdates > 0)

  // Contar notificaciones totales
  const totalNotifications = ordersWithNotifications.reduce((sum, order) => sum + (order.unreadUpdates || 0), 0)

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      setLoading(true)
      const orderIds = ordersWithNotifications.map((order) => order.id)
      if (orderIds.length > 0) {
        await markNotificationsAsRead(orderIds)
        toast({
          title: "Notificaciones",
          description: "Todas las notificaciones han sido marcadas como leídas",
        })
        // Llamar al callback de actualización si existe
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error) {
      console.error("Error al marcar notificaciones como leídas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Navegar a los detalles de la orden y marcar como leída
  const goToOrderDetails = async (orderId: string) => {
    try {
      setLoading(true)
      // Marcar como leída si tiene notificaciones
      if (ordersWithNotifications.some((order) => order.id === orderId)) {
        await markNotificationsAsRead([orderId])
        // Llamar al callback de actualización si existe
        if (onRefresh) {
          onRefresh()
        }
      }

      // Cerrar el diálogo
      onOpenChange(false)

      // Navegar a la página de detalles
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar órdenes según la pestaña activa
  const filteredOrders =
    activeTab === "unread" ? ordersWithNotifications : orders.filter((order) => order.lastUpdateType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Centro de Notificaciones
            {totalNotifications > 0 && (
              <Badge variant="default" className="ml-2">
                {totalNotifications} no leídas
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Historial de actualizaciones y cambios en las órdenes</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="unread"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "all" | "unread")}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="unread">No leídas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>

            {totalNotifications > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading}>
                <BellOff className="mr-2 h-4 w-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 max-h-[400px] pr-4">
            <TabsContent value="unread" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando notificaciones...</p>
                </div>
              ) : ordersWithNotifications.length > 0 ? (
                <div className="space-y-4">
                  {ordersWithNotifications.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-lg border bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => goToOrderDetails(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          Orden #{order.id}
                          <Badge variant="default" className="ml-2">
                            {order.unreadUpdates} {order.unreadUpdates === 1 ? "actualización" : "actualizaciones"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        Cliente: {order.client} | Activo: {order.ticker} | Estado: {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No hay notificaciones sin leer</h3>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando notificaciones...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${order.unreadUpdates ? "bg-primary/5 border-primary/20" : "bg-background"}`}
                      onClick={() => goToOrderDetails(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Orden #{order.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        Cliente: {order.client} | Activo: {order.ticker} | Estado: {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No hay notificaciones</h3>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
