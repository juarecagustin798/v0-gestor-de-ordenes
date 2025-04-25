"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"
import "@/lib/xlsx-shim" // Importar el shim para xlsx

interface OrdersExportButtonProps {
  orders: Order[]
}

export function OrdersExportButton({ orders }: OrdersExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Importar xlsx dinámicamente solo cuando se necesite
      const XLSX = await import("xlsx")

      // Preparar los datos para la exportación
      const data = orders.map((order) => ({
        ID: order.id,
        Cliente: order.client,
        Activo: order.asset,
        Ticker: order.ticker,
        Tipo: order.type,
        Cantidad: order.quantity,
        Precio: order.price,
        Total: order.total,
        Estado: order.status,
        "Fecha Creación": new Date(order.createdAt).toLocaleDateString(),
        "Última Actualización": new Date(order.updatedAt).toLocaleDateString(),
        Comercial: order.commercial,
        Trader: order.trader || "",
        "Cantidad Ejecutada": order.executedQuantity || "",
        "Precio Ejecutado": order.executedPrice || "",
        Notas: order.notes || "",
        Plazo: order.plazo || "",
        Mercado: order.mercado || "",
        "Tipo de Precio": order.priceType ? (order.priceType === "money" ? "Moneda" : "Rendimiento") : "",
        "Es Swap": order.isSwap ? "Sí" : "No",
        "Tipo de Swap": order.swapType ? (order.swapType === "buy" ? "Compra" : "Venta") : "",
      }))

      // Crear un libro de trabajo y una hoja
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes")

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 10 }, // ID
        { wch: 20 }, // Cliente
        { wch: 20 }, // Activo
        { wch: 10 }, // Ticker
        { wch: 10 }, // Tipo
        { wch: 10 }, // Cantidad
        { wch: 12 }, // Precio
        { wch: 12 }, // Total
        { wch: 15 }, // Estado
        { wch: 15 }, // Fecha Creación
        { wch: 15 }, // Última Actualización
        { wch: 20 }, // Comercial
        { wch: 20 }, // Trader
        { wch: 15 }, // Cantidad Ejecutada
        { wch: 15 }, // Precio Ejecutado
        { wch: 30 }, // Notas
        { wch: 10 }, // Plazo
        { wch: 15 }, // Mercado
        { wch: 15 }, // Tipo de Precio
        { wch: 10 }, // Es Swap
        { wch: 15 }, // Tipo de Swap
      ]
      worksheet["!cols"] = columnWidths

      // Generar el archivo para descarga en el navegador
      const fileName = `ordenes_${new Date().toISOString().split("T")[0]}.xlsx`

      // Convertir el libro a un array buffer
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Crear un blob con el array buffer
      const blob = new Blob([wbout], { type: "application/octet-stream" })

      // Crear una URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un elemento de enlace temporal
      const a = document.createElement("a")
      a.href = url
      a.download = fileName

      // Añadir el enlace al documento, hacer clic en él y luego eliminarlo
      document.body.appendChild(a)
      a.click()

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)

      toast({
        title: "Exportación exitosa",
        description: `Se ha descargado el archivo ${fileName}`,
      })
    } catch (error) {
      console.error("Error al exportar órdenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar las órdenes",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exportando..." : "Exportar XLSX"}
    </Button>
  )
}
