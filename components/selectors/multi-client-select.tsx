"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Client } from "@/lib/types"

// Función para cargar clientes desde localStorage
function getClientsFromStorage(): Client[] {
  if (typeof window !== "undefined") {
    try {
      const storedClients = localStorage.getItem("mockClients")
      if (storedClients) {
        return JSON.parse(storedClients)
      }
    } catch (e) {
      console.error("Error al cargar clientes desde localStorage:", e)
    }
  }
  return []
}

interface MultiClientSelectProps {
  clients: Client[]
  selectedClientIds: string[]
  onChange: (clientIds: string[]) => void
}

export function MultiClientSelect({ clients, selectedClientIds, onChange }: MultiClientSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar clientes desde localStorage si no hay clientes proporcionados
  const [allClients, setAllClients] = useState<Client[]>(clients.length > 0 ? clients : getClientsFromStorage())
  const [filteredClients, setFilteredClients] = useState<Client[]>(allClients)

  // Obtener los clientes seleccionados
  const selectedClients = allClients.filter((client) => selectedClientIds.includes(client.id))

  // Actualizar clientes cuando cambian los props
  useEffect(() => {
    if (clients.length > 0) {
      setAllClients(clients)
    } else {
      const storedClients = getClientsFromStorage()
      if (storedClients.length > 0) {
        setAllClients(storedClients)
      }
    }
  }, [clients])

  // Filtrar clientes según el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(allClients)
      return
    }

    const lowercaseSearch = searchTerm.toLowerCase()
    const filtered = allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercaseSearch) ||
        client.documentNumber.toLowerCase().includes(lowercaseSearch) ||
        client.accountNumber.toLowerCase().includes(lowercaseSearch),
    )
    setFilteredClients(filtered)
  }, [searchTerm, allClients])

  // Manejar la selección/deselección de un cliente
  const toggleClient = (clientId: string) => {
    if (selectedClientIds.includes(clientId)) {
      onChange(selectedClientIds.filter((id) => id !== clientId))
    } else {
      onChange([...selectedClientIds, clientId])
    }
  }

  // Eliminar un cliente de la selección
  const removeClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el popover
    onChange(selectedClientIds.filter((id) => id !== clientId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {selectedClientIds.length === 0
                ? "Seleccionar clientes..."
                : `${selectedClientIds.length} cliente(s) seleccionado(s)`}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar cliente..."
                className="flex-1 border-0 focus:ring-0"
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            </div>
            <CommandList>
              {filteredClients.length === 0 ? (
                <CommandEmpty>
                  {allClients.length === 0
                    ? "No hay clientes disponibles. Importe clientes desde la sección de configuración."
                    : "No se encontraron clientes con ese criterio."}
                </CommandEmpty>
              ) : (
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredClients.map((client) => (
                    <CommandItem key={client.id} value={client.id} onSelect={() => toggleClient(client.id)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClientIds.includes(client.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.documentType} {client.documentNumber} | Cuenta: {client.accountNumber}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Mostrar los clientes seleccionados */}
      {selectedClients.length > 0 && (
        <ScrollArea className="h-20 w-full rounded-md border p-2">
          <div className="flex flex-wrap gap-2">
            {selectedClients.map((client) => (
              <Badge key={client.id} variant="secondary" className="flex items-center gap-1">
                {client.name}
                <button onClick={(e) => removeClient(client.id, e)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Eliminar</span>
                </button>
              </Badge>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
