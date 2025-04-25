"use client"

import { useState, useEffect } from "react"
import type { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OrderObservations } from "./order-observations"
import { AddObservationForm } from "./add-observation-form"
import { markNotificationsAsRead, markElementAsRead } from "@/lib/actions"
import { NotificationBadge } from "./notification-badge"
import { AlertCircle, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

export function OrderDetails({ order }: { order: Order }) {
  // Verificar que la orden existe y tiene todas las propiedades necesarias
  if (!order) {
    return <div>No se encontró la orden</div>
  }

  const total = order.quantity * order.price
  const executedTotal =
    order.executedQuantity && order.executedPrice ? order.executedQuantity * order.executedPrice : undefined

  // Estado local para rastrear elementos no leídos después de que se carga el componente
  const [unreadElements, setUnreadElements] = useState<Order["unreadElements"]>(order.unreadElements || undefined)

  useEffect(() => {
    setUnreadElements(order.unreadElements)
  }, [order.unreadElements])

  // Marcar un elemento específico como leído
  const handleMarkElementAsRead = async (
    elementType: "status" | "execution" | "observation",
    observationId?: string,
  ) => {
    if (unreadElements) {
      // Actualizar estado local inmediatamente para mejor UX
      setUnreadElements((prev) => {
        if (!prev) return prev

        const updated = { ...prev }
        if (elementType === "status") {
          updated.status = false
        } else if (elementType === "execution") {
          updated.execution = false
        } else if (elementType === "observation" && observationId && updated.observations) {
          updated.observations = updated.observations.filter((id) => id !== observationId)
        }
        return updated
      })

      // Llamar a la acción del servidor
      await markElementAsRead(order.id, elementType, observationId)
    }
  }

  // Función para determinar la variante del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "outline"
      case "Tomada":
        return "blue"
      case "Ejecutada parcial":
        return "yellow"
      case "Ejecutada":
        return "green"
      case "Revisar":
        return "orange"
      case "Cancelada":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Información de la Orden
              {order.unreadUpdates && order.unreadUpdates > 0 && (
                <NotificationBadge
                  count={order.unreadUpdates}
                  variant={order.lastUpdateType || "default"}
                  onClick={() => {
                    markNotificationsAsRead([order.id])
                    setUnreadElements(undefined)
                  }}
                />
              )}
            </CardTitle>
            <CardDescription>Detalles completos de la orden.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Detalles del Cliente</h3>
              <p className="text-sm text-muted-foreground">Información del cliente que realizó la orden.</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Cliente:</span>
                  <span>{order.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Comercial:</span>
                  <span>{order.commercial}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Detalles de la Orden</h3>
              <p className="text-sm text-muted-foreground">Información específica de la orden.</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">ID:</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha:</span>
                  <span>{order.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estado:</span>
                  <div className="flex items-center">
                    <Badge
                      variant={getStatusBadgeVariant(order.status) as any}
                      className={unreadElements?.status ? "animate-pulse ring-2 ring-primary" : ""}
                      onClick={() => unreadElements?.status && handleMarkElementAsRead("status")}
                    >
                      {order.status}
                    </Badge>
                    {unreadElements?.status && (
                      <span
                        className="ml-2 text-xs text-primary cursor-pointer hover:underline"
                        onClick={() => handleMarkElementAsRead("status")}
                      >
                        Nuevo
                      </span>
                    )}
                  </div>
                </div>
                {order.trader && (
                  <div className="flex justify-between">
                    <span className="font-medium">Trader:</span>
                    <span>{order.trader}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Detalles de la Operación</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Tipo:</span>
                <div className="flex items-center">
                  <Badge variant={order.type === "Compra" ? "default" : "destructive"}>{order.type}</Badge>
                  {order.isSwap && (
                    <Badge variant="outline" className="ml-2">
                      Swap {order.swapType === "buy" ? "(Compra)" : "(Venta)"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mostrar enlace a la orden relacionada si es un swap */}
              {order.isSwap && order.relatedOrderId && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Orden relacionada:</span>
                  <Link
                    href={`/orders/${order.relatedOrderId}`}
                    className="flex items-center text-primary hover:underline"
                  >
                    <ArrowRightLeft className="mr-1 h-4 w-4" />
                    Ver orden {order.swapType === "buy" ? "de venta" : "de compra"}
                  </Link>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Activo:</span>
                <span>
                  {order.asset} ({order.ticker})
                </span>
              </div>

              {/* Mostrar información adicional de la orden */}
              {order.plazo && (
                <div className="flex justify-between">
                  <span className="font-medium">Plazo:</span>
                  <span>{order.plazo}</span>
                </div>
              )}

              {order.mercado && (
                <div className="flex justify-between">
                  <span className="font-medium">Mercado:</span>
                  <span>{order.mercado}</span>
                </div>
              )}

              {order.priceType && (
                <div className="flex justify-between">
                  <span className="font-medium">Tipo de precio:</span>
                  <span>{order.priceType === "money" ? "Moneda ($)" : "Rendimiento (%)"}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Cantidad solicitada:</span>
                <span>{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Precio solicitado:</span>
                <span>
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(order.price)}
                </span>
              </div>

              {/* Mostrar bandas de precio si existen */}
              {(order.minPrice !== undefined || order.maxPrice !== undefined) && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Bandas de precio:</span>
                    <span>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(order.minPrice || 0)}
                      /
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(order.maxPrice || 0)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Total solicitado:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(total)}
                </span>
              </div>

              {/* Mostrar información de ejecución si está disponible */}
              {(order.executedQuantity !== undefined || order.executedPrice !== undefined) && (
                <>
                  <Separator className="my-2" />
                  <div className={unreadElements?.execution ? "bg-primary/10 p-3 rounded-md animate-pulse" : ""}>
                    {unreadElements?.execution && (
                      <div className="flex items-center mb-2 text-primary">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Información de ejecución actualizada</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-xs h-6"
                          onClick={() => handleMarkElementAsRead("execution")}
                        >
                          Marcar como leído
                        </Button>
                      </div>
                    )}
                    {order.executedQuantity !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Cantidad ejecutada:</span>
                        <span>{order.executedQuantity}</span>
                      </div>
                    )}
                    {order.executedPrice !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Precio ejecutado:</span>
                        <span>
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(order.executedPrice)}
                        </span>
                      </div>
                    )}
                    {executedTotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Total ejecutado:</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(executedTotal)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Notas del Comercial</h3>
                <p className="mt-2 text-sm">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Editar</Button>
            <Button>Actualizar Estado</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Observaciones
              {order.observations.length > 0 &&
                unreadElements?.observations &&
                unreadElements.observations.length > 0 && (
                  <NotificationBadge
                    count={unreadElements.observations.length}
                    variant="observation"
                    onClick={() => {
                      // Marcar todas las observaciones como leídas
                      if (unreadElements.observations) {
                        unreadElements.observations.forEach((obsId) => {
                          handleMarkElementAsRead("observation", obsId)
                        })
                      }
                    }}
                  />
                )}
            </CardTitle>
            <CardDescription>Comunicación entre comerciales y mesa de trading.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrderObservations
            observations={order.observations}
            unreadObservationIds={unreadElements?.observations || []}
            onMarkAsRead={(observationId) => handleMarkElementAsRead("observation", observationId)}
          />
          <Separator />
          <AddObservationForm orderId={order.id} />
        </CardContent>
      </Card>
    </div>
  )
}
