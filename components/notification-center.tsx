"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { markElementAsRead, markNotificationsAsRead } from "@/lib/actions" // Fixed: Changed from markNotificationAsRead to markNotificationsAsRead
import type { Order } from "@/lib/types"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
  onRefresh?: () => void
}

export function NotificationCenter({ open, onOpenChange, orders, onRefresh }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter orders with unread updates
  const ordersWithNotifications = orders.filter((order) => order.unreadUpdates && order.unreadUpdates > 0)

  const handleMarkAllAsRead = async () => {
    if (ordersWithNotifications.length > 0) {
      const orderIds = ordersWithNotifications.map((order) => order.id)
      try {
        await markNotificationsAsRead(orderIds)
        onOpenChange(false)
        if (onRefresh) {
          onRefresh()
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }
  }

  const handleMarkAsRead = async (
    orderId: string,
    type: "status" | "execution" | "observation",
    observationId?: string,
  ) => {
    try {
      await markElementAsRead(orderId, type, observationId)
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error("Error marking element as read:", error)
    }
  }

  const getNotificationText = (order: Order) => {
    if (!order.lastUpdateType) return "Actualización de orden"

    switch (order.lastUpdateType) {
      case "status":
        return `Estado actualizado a: ${order.status}`
      case "execution":
        return `Ejecución: ${order.executedQuantity} a $${order.executedPrice}`
      case "observation":
        return "Nueva observación"
      default:
        return "Actualización de orden"
    }
  }

  const getNotificationTime = (order: Order) => {
    if (!order.updatedAt) return "Hace un momento"

    try {
      const date = new Date(order.updatedAt)
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } catch (e) {
      return "Hace un momento"
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-4 top-16 z-50 w-80 max-w-md rounded-md border bg-background p-4 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notificaciones</h3>
          <div className="flex gap-2">
            {ordersWithNotifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Marcar todo como leído
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas ({ordersWithNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ScrollArea className="h-[300px]">
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-md border p-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                          {order.client} - {order.ticker}
                        </Link>
                        <span className="text-xs text-muted-foreground">{getNotificationTime(order)}</span>
                      </div>
                      <p className="text-sm">{getNotificationText(order)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No hay notificaciones</p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread">
            <ScrollArea className="h-[300px]">
              {ordersWithNotifications.length > 0 ? (
                <div className="space-y-2">
                  {ordersWithNotifications.map((order) => (
                    <div key={order.id} className="rounded-md border p-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                          {order.client} - {order.ticker}
                        </Link>
                        <span className="text-xs text-muted-foreground">{getNotificationTime(order)}</span>
                      </div>
                      <p className="text-sm">{getNotificationText(order)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No hay notificaciones no leídas</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
