"use client"

import { useEffect, useState } from "react"
import { fetchAllInstruments } from "@/lib/api-service"
import { useToast } from "@/components/ui/use-toast"

export function AutoAssetsLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAndLoadAssets = async () => {
      // Verificar si ya tenemos activos en localStorage
      const hasStoredAssets = localStorage.getItem("mockAssets") !== null
      const isFirstVisit = localStorage.getItem("appInitialized") === null

      // Si no hay activos almacenados y es la primera visita, cargar desde la API
      if (!hasStoredAssets && isFirstVisit) {
        setIsLoading(true)
        try {
          console.log("Primera visita detectada, cargando activos automáticamente...")

          // Marcar que la app ya fue inicializada para no volver a cargar en futuras visitas
          localStorage.setItem("appInitialized", "true")

          // Cargar activos desde la API
          const assets = await fetchAllInstruments()

          if (assets.length > 0) {
            toast({
              title: "Activos cargados",
              description: `Se han cargado ${assets.length} activos automáticamente.`,
            })
          } else {
            console.warn("No se pudieron cargar activos desde la API")
            toast({
              title: "Aviso",
              description: "No se pudieron cargar activos automáticamente. Por favor, importe activos manualmente.",
              variant: "default",
            })
          }
        } catch (error) {
          console.error("Error al cargar activos automáticamente:", error)
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar activos. Por favor, inténtelo manualmente más tarde.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkAndLoadAssets()
  }, [toast])

  // Este componente no renderiza nada visible
  return null
}
