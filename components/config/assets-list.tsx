"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { FixedSizeList as List } from "react-window"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Loader2, RefreshCw } from "lucide-react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import type { Asset } from "@/lib/types"

// Función para cargar activos desde localStorage
const loadAssetsFromStorage = (): Asset[] => {
  if (typeof window === "undefined") return []

  try {
    const storedAssets = localStorage.getItem("mockAssets")
    if (storedAssets) {
      return JSON.parse(storedAssets)
    }
  } catch (error) {
    console.error("Error al cargar activos:", error)
  }

  return []
}

// Componente para renderizar cada fila de activo
const AssetRow = ({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
  const asset = data.assets[index]

  if (!asset) return null

  return (
    <div style={style} className={`flex items-center px-4 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}>
      <div className="flex-1 min-w-0 truncate">{asset.ticker || "Sin ticker"}</div>
      <div className="flex-1 min-w-0 truncate">{asset.name || "Sin nombre"}</div>
      <div className="flex-1 min-w-0 truncate">{asset.market}</div>
      <div className="flex-1 min-w-0 truncate">{asset.currency}</div>
    </div>
  )
}

// Componente principal de la lista de activos
export function AssetsList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const listRef = useRef<any>(null)

  // Cargar activos
  const loadAssets = useCallback(async () => {
    setIsLoading(true)
    try {
      const loadedAssets = loadAssetsFromStorage()
      setAssets(loadedAssets)
    } catch (error) {
      console.error("Error al cargar activos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  // Filtrar activos basado en el término de búsqueda
  const filteredAssets = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return assets

    const term = debouncedSearchTerm.toLowerCase()
    return assets.filter(
      (asset) =>
        (asset.name?.toLowerCase() || "").includes(term) ||
        (asset.ticker?.toLowerCase() || "").includes(term) ||
        (asset.market?.toLowerCase() || "").includes(term),
    )
  }, [assets, debouncedSearchTerm])

  // Calcular altura de la lista
  const getListHeight = () => {
    if (typeof window === "undefined") return 400
    return Math.min(window.innerHeight - 300, 600)
  }

  // Manejar cambio en la búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (listRef.current) {
      listRef.current.scrollTo(0)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activos Importados</CardTitle>
            <CardDescription>Lista de activos disponibles en el sistema</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={loadAssets} disabled={isLoading} title="Recargar activos">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ticker o mercado..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {filteredAssets.length} de {assets.length} activos
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Cargando activos...</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {assets.length === 0
              ? "No hay activos importados en el sistema."
              : "No se encontraron activos con ese criterio de búsqueda."}
          </div>
        ) : (
          <div className="border rounded-md">
            {/* Encabezados de la tabla */}
            <div className="flex items-center px-4 py-2 bg-muted font-medium text-sm">
              <div className="flex-1">Ticker</div>
              <div className="flex-1">Nombre</div>
              <div className="flex-1">Mercado</div>
              <div className="flex-1">Moneda</div>
            </div>

            {/* Lista virtualizada */}
            <List
              ref={listRef}
              height={getListHeight()}
              width="100%"
              itemCount={filteredAssets.length}
              itemSize={40}
              itemData={{ assets: filteredAssets }}
            >
              {AssetRow}
            </List>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
