"use client"

import { useState, useEffect } from "react"
import type { Asset } from "@/lib/types"
import { getAssets } from "@/lib/services/asset-service"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetsList } from "@/components/config/assets-list"
import { AssetsImporter } from "@/components/config/assets-importer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AssetsConfigPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      // Intentar cargar desde localStorage primero
      let assets: Asset[] = []

      if (typeof window !== "undefined") {
        const storedAssets = localStorage.getItem("mockAssets")
        if (storedAssets) {
          assets = JSON.parse(storedAssets)
          console.log("Activos cargados desde localStorage:", assets.length)

          // IMPORTANTE: Actualizar también mockAssets en memoria para uso inmediato
          import("@/lib/data").then(({ mockAssets }) => {
            // Verificar si hay activos que no están en mockAssets
            const existingTickerSet = new Set(mockAssets.map((a) => a.ticker))
            const newAssets = assets.filter((a) => !existingTickerSet.has(a.ticker))

            if (newAssets.length > 0) {
              console.log("Añadiendo nuevos activos a mockAssets:", newAssets.length)
              mockAssets.push(...newAssets)
            }
          })
        }
      }

      // Si no hay activos en localStorage, intentar cargar desde la API
      if (assets.length === 0) {
        assets = await getAssets()
      }

      setAssets(assets)
    } catch (error) {
      console.error("Error al cargar activos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los activos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración de Activos</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Activos</TabsTrigger>
          <TabsTrigger value="import">Importar Activos</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Activos Disponibles</CardTitle>
              <CardDescription>Gestione los activos disponibles en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <AssetsList assets={assets} onRefresh={fetchAssets} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Importar Activos</CardTitle>
              <CardDescription>Importe activos desde un archivo CSV o Excel.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsImporter onImportComplete={fetchAssets} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
