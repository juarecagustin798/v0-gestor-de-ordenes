"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { markNotificationsAsRead } from "@/lib/actions" // Fixed: Changed from markNotificationAsRead to markNotificationsAsRead

export function NotificationBadge() {
  const [count, setCount] = useState(0)
  const [orderIds, setOrderIds] = useState<string[]>([])

  useEffect(() => {
    // Simulate fetching notification count
    const fetchNotifications = () => {
      // In a real app, this would come from an API or state management
      const notificationState = localStorage.getItem("order_notifications")
      if (notificationState) {
        try {
          const parsed = JSON.parse(notificationState)
          const totalCount = Object.values(parsed.counts || {}).reduce((a: number, b: number) => a + b, 0) as number
          setCount(totalCount)
          setOrderIds(parsed.orderIds || [])
        } catch (e) {
          console.error("Error parsing notifications:", e)
          setCount(0)
          setOrderIds([])
        }
      } else {
        setCount(0)
        setOrderIds([])
      }
    }

    fetchNotifications()
    // Set up polling to check for new notifications
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = async () => {
    if (count > 0 && orderIds.length > 0) {
      try {
        // Mark all notifications as read
        await markNotificationsAsRead(orderIds) // Fixed: Changed from markNotificationAsRead to markNotificationsAsRead
        setCount(0)
        setOrderIds([])
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  )
}
