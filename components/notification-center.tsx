"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { markElementAsRead, markNotificationsAsRead } from "@/lib/actions" // Fixed: Changed from markNotificationAsRead to markNotificationsAsRead
import type { Order } from "@/lib/types"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Order[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = () => {
      // In a real app, this would come from an API or state management
      const notificationState = localStorage.getItem("order_notifications")
      const ordersData = localStorage.getItem("mockOrders")

      if (notificationState && ordersData) {
        try {
          const parsed = JSON.parse(notificationState)
          const orders = JSON.parse(ordersData)
          const orderIds = parsed.orderIds || []

          // Filter orders that have notifications
          const notificationOrders = orders.filter((order: Order) => orderIds.includes(order.id))
          setNotifications(notificationOrders)
        } catch (e) {
          console.error("Error parsing notifications:", e)
          setNotifications([])
        }
      } else {
        setNotifications([])
      }
    }

    fetchNotifications()
    // Set up polling to check for new notifications
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    if (notifications.length > 0) {
      const orderIds = notifications.map((order) => order.id)
      try {
        await markNotificationsAsRead(orderIds) // Fixed: Changed from markNotificationAsRead to markNotificationsAsRead
        setNotifications([])
        setIsOpen(false)
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
      // Refresh notifications
      const notificationState = localStorage.getItem("order_notifications")
      const ordersData = localStorage.getItem("mockOrders")

      if (notificationState && ordersData) {
        try {
          const parsed = JSON.parse(notificationState)
          const orders = JSON.parse(ordersData)
          const orderIds = parsed.orderIds || []

          // Filter orders that have notifications
          const notificationOrders = orders.filter((order: Order) => orderIds.includes(order.id))
          setNotifications(notificationOrders)
        } catch (e) {
          console.error("Error parsing notifications:", e)
        }
      }
    } catch (error) {
      console.error("Error marking element as read:", error)
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
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

  return (
    <div className="relative">
      <Button variant="ghost" onClick={toggleOpen}>
        Notificaciones
        {notifications.length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {notifications.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-md border bg-background p-4 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notificaciones</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Marcar todo como leído
              </Button>
            )}
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">No leídas</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((order) => (
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
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((order) => (
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
      )}
    </div>
  )
}
