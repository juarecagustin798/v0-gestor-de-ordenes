"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"
import type { Asset } from "@/lib/types"

interface AssetSelectProps {
  assets: Asset[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function AssetSelect({
  assets,
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar activo...",
}: AssetSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Encontrar el activo seleccionado para mostrar su nombre
  const selectedAsset = React.useMemo(() => {
    return assets.find((asset) => asset.id === value || asset.ticker === value)
  }, [assets, value])

  // Filtrar activos basado en la búsqueda
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery) {
      // Mostrar todos los activos si no hay búsqueda, hasta un límite razonable
      return assets.slice(0, 100)
    }

    return assets
      .filter((asset) => {
        const searchable = [asset.ticker || "", asset.name || "", asset.id || ""].join(" ").toLowerCase()

        return searchable.includes(searchQuery.toLowerCase())
      })
      .slice(0, 100)
  }, [assets, searchQuery])

  // Depuración
  React.useEffect(() => {
    console.log("Activos disponibles:", assets.length)
    console.log("Activos filtrados:", filteredAssets.length)
  }, [assets, filteredAssets])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !value && "text-muted-foreground")}
            disabled={disabled}
          >
            {value && selectedAsset ? `${selectedAsset.ticker} - ${selectedAsset.name || "Sin nombre"}` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar activo..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <CommandItem
                    key={asset.id || asset.ticker}
                    value={asset.id || asset.ticker}
                    onSelect={() => {
                      onChange(asset.id || asset.ticker)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", value === (asset.id || asset.ticker) ? "opacity-100" : "opacity-0")}
                    />
                    <span>
                      {asset.ticker} - {asset.name || "Sin nombre"}
                    </span>
                  </CommandItem>
                ))
              ) : (
                <div className="py-6 text-center text-sm">No hay activos disponibles</div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
