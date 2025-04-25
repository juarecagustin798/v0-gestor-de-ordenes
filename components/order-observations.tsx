"use client"

import type { Observation } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface OrderObservationsProps {
  observations: Observation[]
  unreadObservationIds?: string[]
  onMarkAsRead?: (observationId: string) => void
}

export function OrderObservations({ observations, unreadObservationIds = [], onMarkAsRead }: OrderObservationsProps) {
  if (observations.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">No hay observaciones para esta orden.</p>
      </div>
    )
  }

  // Ordenar observaciones por fecha (más recientes primero)
  const sortedObservations = [...observations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-4">
      {sortedObservations.map((observation) => {
        const isUnread = unreadObservationIds.includes(observation.id)

        return (
          <div
            key={observation.id}
            className={cn("flex gap-4 p-3 rounded-md", isUnread ? "bg-primary/10 animate-pulse" : "")}
          >
            <Avatar className={cn("h-8 w-8", observation.userRole === "Mesa" ? "bg-primary" : "bg-secondary")}>
              <AvatarFallback>
                {observation.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{observation.userName}</p>
                <span className="text-xs text-muted-foreground">{observation.userRole}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(observation.createdAt).toLocaleString()}
                </span>
                {isUnread && (
                  <>
                    <span className="ml-auto flex items-center text-primary text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Nueva
                    </span>
                    {onMarkAsRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 text-xs h-6"
                        onClick={() => onMarkAsRead(observation.id)}
                      >
                        Marcar como leída
                      </Button>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm">{observation.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
