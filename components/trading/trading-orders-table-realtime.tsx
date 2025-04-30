"use client"

import { useEffect, useState } from "react"
import { TradingOrdersTable } from "@/components/trading-orders-table"

interface TradingOrdersTableRealtimeProps {
  availableActions?: ("tomar" | "ejecutar" | "ejecutarParcial" | "revisar" | "cancelar")[]
  readOnly?: boolean
  status?: string
}

export function TradingOrdersTableRealtime({
  availableActions = [],
  readOnly = false,
  status,
}: TradingOrdersTableRealtimeProps) {
  const [key, setKey] = useState(0)

  // Forzar actualización cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prevKey) => prevKey + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return <TradingOrdersTable key={key} availableActions={availableActions} readOnly={readOnly} status={status} />
}
