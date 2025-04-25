"use client"

import { useState } from "react"
import type { Client } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User } from "lucide-react"

interface ClientSelectionStepProps {
  clients: Client[]
  selectedClientId: string
  onClientSelect: (client: Client) => void
}

export function ClientSelectionStep({ clients, selectedClientId, onClientSelect }: ClientSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrar clientes según la búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.documentNumber.includes(searchQuery),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Seleccionar Cliente</h2>
        <p className="text-muted-foreground">Selecciona el cliente para el cual deseas crear una orden.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre o documento..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    {client.documentType} {client.documentNumber}
                  </TableCell>
                  <TableCell>{client.accountNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onClientSelect(client)}>
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredClients.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium">No se encontraron clientes</h3>
          <p className="text-sm text-muted-foreground">
            Intenta con otro término de búsqueda o contacta a soporte para crear un nuevo cliente.
          </p>
        </div>
      )}
    </div>
  )
}

