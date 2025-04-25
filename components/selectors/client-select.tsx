"use client"

import React, { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { FormControl } from "@/components/ui/form"
import { ChevronsUpDown, Check, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchClients } from "@/lib/services/db-service"
import type { Client } from "@/lib/types"
import { useDebounce } from "@/lib/hooks/use-debounce"

interface ClientSelectProps {
  clients?: {
    id: string
    denominacion?: string
    titular?: string
    cuit?: string
    idCliente?: string
    accountNumber?: string
  }[]
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ClientSelect({
  clients: propClients = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar cliente...",
}: ClientSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Encontrar el cliente seleccionado para mostrar su nombre
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    propClients.find((client) => client.id === value) as Client | undefined,
  )

  // Cargar el cliente seleccionado si no está en propClients
  useEffect(() => {
    const loadSelectedClient = async () => {
      if (value && !selectedClient) {
        try {
          const results = await searchClients(value)
          const client = results.find((c) => c.id === value)
          if (client) {
            setSelectedClient(client)
          }
        } catch (error) {
          console.error("Error al cargar el cliente seleccionado:", error)
        }
      }
    }

    loadSelectedClient()
  }, [value, selectedClient])

  // Buscar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const searchClientsAsync = async () => {
      setLoading(true)
      try {
        const results = await searchClients(debouncedSearchTerm)
        setSearchResults(results)
      } catch (error) {
        console.error("Error al buscar clientes:", error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    searchClientsAsync()
  }, [debouncedSearchTerm])

  // Combinar clientes de props y resultados de búsqueda
  const displayClients =
    searchTerm.length < 2
      ? propClients
      : [
          ...searchResults.filter((client) => !propClients.some((propClient) => propClient.id === client.id)),
          ...propClients,
        ]

  // Función para obtener el ID del cliente (número de cuenta)
  const getClientAccountId = (client: Client): string => {
    // Priorizar el ID de la tabla como identificador principal
    return client.id || client.idCliente || client.accountNumber || ""
  }

  // Modificar la función formatClientName para mostrar el ID de cuenta correcto
  // Reemplazar la función formatClientName actual con esta versión:

  const formatClientName = (client: Client): string => {
    // Priorizar el ID de la tabla como identificador para mostrar
    const displayId = client.idCliente || client.accountNumber || client.id
    const name = client.denominacion || client.titular || client.name || "Cliente sin nombre"

    if (displayId) {
      return `${name} (${displayId})`
    }
    return name
  }

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
            {value && selectedClient ? (
              <div className="flex items-center gap-2 text-left overflow-hidden">
                <span className="truncate">{formatClientName(selectedClient)}</span>
              </div>
            ) : (
              placeholder
            )}
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" side="bottom" align="start" sideOffset={5}>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-8 p-2 text-sm border rounded"
              placeholder="Buscar por número de cuenta o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              <p className="text-sm mt-2">Buscando clientes...</p>
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="py-6 text-center text-sm">Escribe al menos 2 caracteres para buscar clientes</div>
          ) : displayClients.length === 0 ? (
            <div className="py-6 text-center text-sm">No se encontraron clientes</div>
          ) : (
            <div className="space-y-1">
              {displayClients.map((client) => (
                <Button
                  key={client.id}
                  variant={client.id === value ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    // Usar el ID de la tabla como identificador principal
                    onChange(client.id)
                    setSelectedClient(client)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", client.id === value ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col w-full overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {client.denominacion || client.titular || client.name || "Cliente sin nombre"}
                      </span>
                    </div>
                    {/* También modificar el contenido del botón en la lista de resultados para mostrar el ID correcto */}
                    {/* Buscar la sección donde se muestra la información del cliente en la lista de resultados y reemplazarla: */}
                    <div className="flex text-xs gap-4">
                      <span className="font-medium text-primary">
                        ID: {client.idCliente || client.accountNumber || client.id}
                      </span>
                      {client.cuit && <span className="text-muted-foreground">CUIT: {client.cuit}</span>}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
