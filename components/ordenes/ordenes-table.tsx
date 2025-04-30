"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingOrdersTableRealtime } from "@/components/trading/trading-orders-table-realtime"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OrdenesTable() {
  const [activeTab, setActiveTab] = useState("pending")

  return (
    <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="pending">Pendientes</TabsTrigger>
        <TabsTrigger value="in-progress">En Proceso</TabsTrigger>
        <TabsTrigger value="completed">Ejecutadas</TabsTrigger>
        <TabsTrigger value="under-review">En Revisión</TabsTrigger>
        <TabsTrigger value="canceled">Canceladas</TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Pendientes</CardTitle>
            <CardDescription>Órdenes que aún no han sido tomadas por un operador.</CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOrdersTableRealtime availableActions={["tomar"]} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="in-progress">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes En Proceso</CardTitle>
            <CardDescription>Órdenes que han sido tomadas y están siendo procesadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOrdersTableRealtime availableActions={["ejecutar", "ejecutarParcial", "revisar", "cancelar"]} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="completed">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Ejecutadas</CardTitle>
            <CardDescription>Órdenes que han sido completadas exitosamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOrdersTableRealtime readOnly status="Ejecutada" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="under-review">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes En Revisión</CardTitle>
            <CardDescription>Órdenes que requieren revisión adicional.</CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOrdersTableRealtime readOnly status="Revisar" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="canceled">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Canceladas</CardTitle>
            <CardDescription>Órdenes que han sido canceladas.</CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOrdersTableRealtime readOnly status="Cancelada" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
