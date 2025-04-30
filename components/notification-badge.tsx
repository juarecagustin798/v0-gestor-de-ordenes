"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count?: number
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

export function NotificationBadge({ count = 0, onClick, className }: NotificationBadgeProps) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white",
        className,
      )}
      onClick={onClick}
    >
      {count > 9 ? "9+" : count}
    </span>
  )
}
