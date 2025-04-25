"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Asset } from "@/lib/types"

interface AssetSelectProps {
  assets: Asset[]
  value: string
  onChange: (value: string) => void
}

export function AssetSelect({ assets, value, onChange }: AssetSelectProps) {
  const [open, setOpen] = useState(false)

  // Encontrar el activo seleccionado
  const selectedAsset = assets.find((asset) => asset.ticker === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value && selectedAsset ? `${selectedAsset.ticker} - ${selectedAsset.name}` : "Seleccionar activo..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder="Buscar activo..." className="flex-1 border-0 focus:ring-0" />
          </div>
          <CommandList>
            <CommandEmpty>No se encontraron activos.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {assets.map((asset) => (
                <CommandItem
                  key={asset.ticker}
                  value={asset.ticker}
                  onSelect={() => {
                    onChange(asset.ticker)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === asset.ticker ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.ticker}</span>
                      <span className="text-xs text-muted-foreground">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(asset.lastPrice)}
                      </span>
                      <Badge variant={asset.change >= 0 ? "default" : "destructive"} className="text-xs">
                        {asset.change >= 0 ? "+" : ""}
                        {asset.change}%
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

