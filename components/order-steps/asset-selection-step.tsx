"use client"

import { useState, useEffect } from "react"
import type { Asset } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { searchAssets } from "@/lib/data"

interface AssetSelectionStepProps {
  assets: Asset[]
  selectedAssetId: string
  onAssetSelect: (asset: Asset) => void
  onBack: () => void
}

export function AssetSelectionStep({ assets, selectedAssetId, onAssetSelect, onBack }: AssetSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(assets)
  const [isSearching, setIsSearching] = useState(false)

  // Efecto para buscar activos cuando cambia la consulta
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const results = await searchAssets(searchQuery)
          setFilteredAssets(results)
        } catch (error) {
          console.error("Error al buscar activos:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setFilteredAssets(assets)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, assets])

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Seleccionar Activo</h2>
          <p className="text-muted-foreground">Selecciona el activo financiero para la orden.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre o ticker..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Último Precio</TableHead>
              <TableHead>Variación</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isSearching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Buscando activos...
                </TableCell>
              </TableRow>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.ticker}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(asset.lastPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={asset.change >= 0 ? "default" : "destructive"}>
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onAssetSelect(asset)}>
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron activos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAssets.length === 0 && searchQuery && !isSearching && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No se encontraron activos</h3>
          <p className="text-sm text-muted-foreground">
            Intenta con otro término de búsqueda o contacta a soporte para añadir un nuevo activo.
          </p>
        </div>
      )}
    </div>
  )
}

