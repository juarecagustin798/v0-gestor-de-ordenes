"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, X, AlertCircle } from "lucide-react"
import { useFavoriteAssets } from "@/hooks/use-favorite-assets"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Asset } from "@/lib/types"
import { loadAssetsFromStorage } from "@/lib/api-service"
import { cn } from "@/lib/utils"

// Función para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function FavoriteAssetsManager() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { favorites, isFavorite, toggleFavorite } = useFavoriteAssets()

  // Cargar activos al iniciar
  useEffect(() => {
    const storedAssets = loadAssetsFromStorage()
    if (storedAssets.length > 0) {
      setAssets(storedAssets)
    }
  }, [])

  // Filtrar activos según la búsqueda
  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.ticker.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.market.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  )

  // Separar activos favoritos
  const favoriteAssets = assets.filter((asset) => isFavorite(asset.ticker))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activos Favoritos</CardTitle>
        <CardDescription>
          Gestiona tus activos favoritos para acceder a ellos rápidamente al crear órdenes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mostrar favoritos actuales */}
        <div>
          <h3 className="text-sm font-medium mb-2">Tus favoritos ({favoriteAssets.length})</h3>
          {favoriteAssets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {favoriteAssets.map((asset) => (
                <Badge key={asset.ticker} variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {asset.ticker}
                  <button
                    onClick={() => toggleFavorite(asset.ticker)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Eliminar</span>
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tienes activos favoritos. Busca y marca activos como favoritos para verlos aquí.
            </p>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar activos para añadir a favoritos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {assets.length === 0 ? (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay activos disponibles. Importa activos desde la sección de configuración.
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="p-4 space-y-2">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <div key={asset.ticker} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{asset.ticker}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        isFavorite(asset.ticker) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500",
                      )}
                      onClick={() => toggleFavorite(asset.ticker)}
                    >
                      <Star className={cn("h-5 w-5", isFavorite(asset.ticker) && "fill-current")} />
                      <span className="sr-only">
                        {isFavorite(asset.ticker) ? "Quitar de favoritos" : "Añadir a favoritos"}
                      </span>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No se encontraron activos con ese criterio de búsqueda.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
