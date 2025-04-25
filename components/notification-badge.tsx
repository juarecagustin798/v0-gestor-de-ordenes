"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"

interface NotificationBadgeProps {
  count: number
  variant?: "status" | "observation" | "execution" | "default"
  onClick?: () => void
}

export function NotificationBadge({ count, variant = "default", onClick }: NotificationBadgeProps) {
  if (count <= 0) return null

  const getVariantClass = () => {
    switch (variant) {
      case "status":
        return "bg-blue-500 hover:bg-blue-600"
      case "observation":
        return "bg-amber-500 hover:bg-amber-600"
      case "execution":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-primary hover:bg-primary/90"
    }
  }

  const getVariantTitle = () => {
    switch (variant) {
      case "status":
        return "Cambios de estado"
      case "observation":
        return "Nuevas observaciones"
      case "execution":
        return "Detalles de ejecución"
      default:
        return "Notificaciones"
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation() // Evitar que el evento se propague a elementos padres
      onClick()
    }
  }

  return (
    <Badge
      className={`${getVariantClass()} text-white ml-2 px-1.5 py-0.5 rounded-full cursor-pointer transition-all hover:scale-110`}
      title={`${count} ${getVariantTitle()}`}
      onClick={handleClick}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  )
}

