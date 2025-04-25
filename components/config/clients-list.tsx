"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { ClientFileStatus } from "@/components/dashboard/client-file-status"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { getClientsPaginated } from "@/lib/services/db-service"
import type { Client } from "@/lib/types"

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalClients, setTotalClients] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 50
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Cargar clientes paginados
  const loadClients = useCallback(
    async (page = 1, search = "") => {
      setIsLoading(true)
      try {
        const { clients, total } = await getClientsPaginated(page, pageSize, search)
        setClients(clients)
        setTotalClients(total)
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)))
      } catch (error) {
        console.error("Error al cargar clientes:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [pageSize],
  )

  // Efecto para cargar clientes cuando cambia la página o el término de búsqueda
  useEffect(() => {
    loadClients(currentPage, debouncedSearchTerm)
  }, [loadClients, currentPage, debouncedSearchTerm])

  // Efecto para escuchar eventos de actualización de clientes
  useEffect(() => {
    const handleClientsUpdated = () => {
      loadClients(1, debouncedSearchTerm)
      setCurrentPage(1)
    }

    window.addEventListener("clientsUpdated", handleClientsUpdated)

    return () => {
      window.removeEventListener("clientsUpdated", handleClientsUpdated)
    }
  }, [loadClients, debouncedSearchTerm])

  // Manejar cambio en la búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Volver a la primera página al buscar
  }, [])

  // Manejar cambio de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
      }
    },
    [totalPages],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Clientes Importados</CardTitle>
            <CardDescription>Lista de clientes disponibles en el sistema</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadClients(currentPage, debouncedSearchTerm)}
            disabled={isLoading}
            title="Recargar clientes"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <ClientFileStatus />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por denominación, CUIT o ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          <div className="text-sm text-muted-foreground">Total: {totalClients} clientes</div>
        </div>

        {isLoading && clients.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Cargando clientes...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {debouncedSearchTerm
              ? "No se encontraron clientes con ese criterio de búsqueda."
              : "No hay clientes importados en el sistema."}
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-hidden">
              {/* Encabezados de la tabla con CSS Grid */}
              <div className="grid grid-cols-table-clients bg-muted font-medium text-sm">
                <div className="p-2 truncate">ID</div>
                <div className="p-2 truncate">Denominación</div>
                <div className="p-2 truncate">CUIT</div>
                <div className="p-2 truncate">Tipo de Cuenta</div>
                <div className="p-2 truncate">Estado</div>
              </div>

              {/* Lista de clientes con CSS Grid */}
              <div className="divide-y">
                {clients.map((client) => (
                  <div key={client.id} className="grid grid-cols-table-clients hover:bg-muted/30">
                    <div className="p-2 truncate">{client.idCliente || "N/A"}</div>
                    <div className="p-2 truncate">{client.denominacion || client.titular || "Sin nombre"}</div>
                    <div className="p-2 truncate">{client.cuit || "Sin CUIT"}</div>
                    <div className="p-2 truncate">{client.tipoCuenta || "N/A"}</div>
                    <div className="p-2 truncate">{client.estado || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {clients.length} de {totalClients} clientes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {isLoading && clients.length > 0 && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="ml-2 text-sm">Actualizando...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
