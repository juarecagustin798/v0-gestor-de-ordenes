"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { saveClients, saveFileInfo } from "@/lib/services/db-service"
import type { Client } from "@/lib/types"

export function AutoClientsLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAndLoadClients = async () => {
      // Verificar si es la primera visita o si ya se cargaron clientes anteriormente
      const isFirstVisit = localStorage.getItem("clientsInitialized") === null

      // Si es la primera visita, cargar clientes desde Supabase
      if (isFirstVisit) {
        setIsLoading(true)
        try {
          console.log("Primera visita detectada, cargando clientes automáticamente desde Supabase...")

          // Marcar que los clientes ya fueron inicializados
          localStorage.setItem("clientsInitialized", "true")

          const supabase = createClient()

          // Verificar si hay clientes en Supabase
          const { count } = await supabase.from("clientes").select("*", { count: "exact", head: true })

          if (!count || count === 0) {
            console.log("No se encontraron clientes en Supabase")
            return
          }

          // Obtener clientes en lotes para manejar grandes cantidades de datos
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
          }

          // Guardar en IndexedDB
          await saveClients(allClients)

          // Guardar la información de la sincronización
          const syncInfo = {
            name: "Sincronización Automática Supabase",
            size: allClients.length,
            lastModified: Date.now(),
            importedAt: new Date().toISOString(),
            clientCount: allClients.length,
          }
          await saveFileInfo(syncInfo)

          // Disparar un evento personalizado para notificar que los clientes han sido actualizados
          window.dispatchEvent(new CustomEvent("clientsUpdated"))

          toast({
            title: "Clientes cargados",
            description: `Se han cargado ${allClients.length} clientes automáticamente desde Supabase.`,
          })
        } catch (error) {
          console.error("Error al cargar clientes automáticamente:", error)
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar clientes. Por favor, sincronice manualmente más tarde.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkAndLoadClients()
  }, [toast])

  // Este componente no renderiza nada visible
  return null
}
