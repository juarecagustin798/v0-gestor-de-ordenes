"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useFavoriteAssets } from "@/hooks/use-favorite-assets"

export function FavoriteAssetsManager() {
  const { favorites, addFavorite, removeFavorite } = useFavoriteAssets()
  const [newAsset, setNewAsset] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Manejar la adición de un nuevo activo favorito
  const handleAddFavorite = () => {
    if (newAsset.trim()) {
      addFavorite(newAsset.trim().toUpperCase())
      setNewAsset("")
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Activos Favoritos</CardTitle>
        <CardDescription>Activos que sigues frecuentemente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {favorites.length > 0 ? (
            favorites.map((asset) => (
              <Badge key={asset} variant="secondary" className="flex items-center gap-1">
                {asset}
                <button onClick={() => removeFavorite(asset)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Eliminar {asset}</span>
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay activos favoritos. Agrega algunos para seguirlos.</p>
          )}
        </div>

        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              placeholder="Ej: AAPL, MSFT"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddFavorite()
                } else if (e.key === "Escape") {
                  setIsAdding(false)
                  setNewAsset("")
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleAddFavorite}>
              Agregar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar activo
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
