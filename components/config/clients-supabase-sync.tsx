"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { saveClients, saveFileInfo } from "@/lib/services/db-service"

export function ClientsSupabaseSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [clientCount, setClientCount] = useState(0)

  const syncFromSupabase = async () => {
    setIsLoading(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      // Obtener el total de clientes para calcular el progreso
      const { count } = await supabase.from("clientes").select("*", { count: "exact", head: true })

      if (!count) {
        throw new Error("No se encontraron clientes en la base de datos")
      }

      setClientCount(count)

      // Procesar en lotes para manejar grandes cantidades de datos
      const pageSize = 1000
      const pages = Math.ceil(count / pageSize)
      const allClients: Client[] = []

      for (let page = 0; page < pages; page++) {
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error

        if (data) {
          // Mapear los datos de Supabase al formato de Cliente
          const mappedClients = data.map((row) => ({
            id: uuidv4(),
            // Mapeo directo de las columnas específicas
            idCliente: row["ID"] || "",
            tipoCuenta: row["Tipo de cuenta"] || "",
            estado: row["Estado"] || "",
            denominacion: row["Denominación"] || "",
            cuentaEspecial: row["Cuenta Especial (CNV RG5528/2024)"] || "",
            alias: row["Alias"] || "",
            titular: row["Titular"] || "",
            tipoTitular: row["Tipo Titular"] || "",
            cartera: row["Cartera"] || "",
            categoria: row["Categoría"] || "",
            administrador: row["Administrador"] || "",
            operador: row["Operador"] || "",
            sucursal: row["Sucursal"] || "",
            claseCuenta: row["Clase de cuenta"] || "",
            cuit: row["CUIT"] || "",
            ganancias: row["Ganancias"] || "",
            iva: row["IVA"] || "",

            // Mapeo a campos genéricos para compatibilidad
            name: row["Denominación"] || row["Titular"] || "",
            documentType: "CUIT",
            documentNumber: row["CUIT"] || "",
            accountNumber: row["ID"] || "",
          }))

          allClients.push(...mappedClients)
        }

        // Actualizar progreso
        setProgress(Math.round(((page + 1) / pages) * 100))

        // Pausa para permitir que la UI se actualice
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      // Guardar en IndexedDB
      await saveClients(allClients)

      // Guardar la información de la sincronización
      const syncInfo = {
        name: "Sincronización Supabase",
        size: allClients.length,
        lastModified: Date.now(),
        importedAt: new Date().toISOString(),
        clientCount: allClients.length,
      }
      await saveFileInfo(syncInfo)

      setSuccess(`Se sincronizaron ${allClients.length} clientes correctamente desde Supabase`)

      // Disparar un evento personalizado para notificar que los clientes han sido actualizados
      window.dispatchEvent(new CustomEvent("clientsUpdated"))
    } catch (error) {
      console.error("Error al sincronizar clientes desde Supabase:", error)
      setError(`Error al sincronizar: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronizar desde Supabase</CardTitle>
        <CardDescription>Importa tus clientes directamente desde la base de datos Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sincronizando clientes...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Sincronización exitosa</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={syncFromSupabase} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar desde Supabase
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
