"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TrendingUp, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { NotificationBadge } from "./notification-badge"
import { getOrders } from "@/lib/data"
import { markNotificationsAsRead } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { BellOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const [totalNotifications, setTotalNotifications] = useState(0)

  // Obtener el total de notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const orders = await getOrders()
        const total = orders.reduce((sum, order) => sum + (order.unreadUpdates || 0), 0)
        setTotalNotifications(total)
      } catch (error) {
        console.error("Error al obtener notificaciones:", error)
      }
    }

    fetchNotifications()

    // Configurar un intervalo para actualizar las notificaciones cada minuto
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Función para marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = async () => {
    try {
      const orders = await getOrders()
      const ordersWithNotifications = orders
        .filter((order) => order.unreadUpdates && order.unreadUpdates > 0)
        .map((order) => order.id)

      if (ordersWithNotifications.length > 0) {
        await markNotificationsAsRead(ordersWithNotifications)
        setTotalNotifications(0) // Actualizar el estado local inmediatamente
      }
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
    }
  }

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <TrendingUp className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Gestor de Órdenes</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={pathname?.startsWith("/orders") ? "default" : "ghost"} className="h-8 px-2">
                Órdenes
                {totalNotifications > 0 && (
                  <NotificationBadge count={totalNotifications} onClick={markAllNotificationsAsRead} />
                )}
                <span className="sr-only">Menú de órdenes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/orders">Ver todas las órdenes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear nueva orden
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {totalNotifications > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-6 w-6"
              onClick={markAllNotificationsAsRead}
              title="Marcar todas como leídas"
            >
              <BellOff className="h-4 w-4" />
              <span className="sr-only">Marcar todas como leídas</span>
            </Button>
          )}
        </div>

        <Link
          href="/trading"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/trading") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Mesa de Trading
        </Link>
        <Link
          href="/clients"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/clients") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Clientes
        </Link>
      </nav>
    </div>
  )
}

