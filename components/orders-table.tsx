"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Ban,
  CheckCircle,
  ArrowRightLeft,
  Filter,
  X,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/lib/types"
import { updateOrderStatus, markNotificationsAsRead } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import { NotificationBadge } from "./notification-badge"

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({})

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setIsUpdating(id)

      const result = await updateOrderStatus({
        orderIds: [id],
        status: status,
      })

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: `La orden ${id} ha sido actualizada a "${status}".`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el estado de la orden.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const markOrderNotificationsAsRead = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId)
      if (order?.unreadUpdates && order.unreadUpdates > 0) {
        await markNotificationsAsRead([orderId])
      }
    } catch (error) {
      console.error("Error al marcar notificaciones como leídas:", error)
    }
  }

  // Función para actualizar el estado de filtros activos
  const updateActiveFilters = (columnId: string, value: string) => {
    if (value) {
      setActiveFilters((prev) => ({ ...prev, [columnId]: true }))
    } else {
      const newFilters = { ...activeFilters }
      delete newFilters[columnId]
      setActiveFilters(newFilters)
    }
  }

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    table.getAllColumns().forEach((column) => {
      if (column.getCanFilter()) {
        column.setFilterValue("")
      }
    })
    setActiveFilters({})
  }

  // Función para limpiar un filtro específico
  const clearFilter = (columnId: string) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.setFilterValue("")
      const newFilters = { ...activeFilters }
      delete newFilters[columnId]
      setActiveFilters(newFilters)
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="font-medium flex items-center">
            {order.id}
            {order.unreadUpdates && order.unreadUpdates > 0 && (
              <NotificationBadge
                count={order.unreadUpdates}
                variant={order.lastUpdateType || "default"}
                onClick={() => markOrderNotificationsAsRead(order.id)}
              />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "client",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Cliente
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("client")}</div>,
    },
    {
      accessorKey: "ticker",
      header: "Ticker",
      cell: ({ row }) => <div className="font-medium">{row.getValue("ticker")}</div>,
    },
    {
      accessorKey: "asset",
      header: "Activo",
      cell: ({ row }) => <div>{row.getValue("asset")}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Tipo de Operación
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        const type = order.type as string

        return (
          <div className="flex items-center gap-2">
            <Badge variant={type === "Compra" ? "default" : "destructive"}>{type}</Badge>
            {order.isSwap && <Badge variant="outline">Swap {order.swapType === "buy" ? "(Compra)" : "(Venta)"}</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => <div className="text-right">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("total"))
        const formatted = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(amount)
        return <div className="text-right font-bold">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        let variant = "default"

        switch (status) {
          case "Pendiente":
            variant = "outline"
            break
          case "En proceso":
            variant = "secondary"
            break
          case "Tomada":
            variant = "blue"
            break
          case "Ejecutada":
            variant = "green"
            break
          case "Ejecutada parcial":
            variant = "yellow"
            break
          case "Revisar":
            variant = "orange"
            break
          case "Cancelada":
            variant = "destructive"
            break
        }

        return <Badge variant={variant as any}>{status}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={isUpdating === order.id}
                onClick={() => markOrderNotificationsAsRead(order.id)}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/orders/${order.id}`} className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </DropdownMenuItem>

              {order.isSwap && order.relatedOrderId && (
                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.relatedOrderId}`} className="cursor-pointer">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Ver orden {order.swapType === "buy" ? "de venta" : "de compra"} relacionada
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Actualizar Estado</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "En proceso")}
                disabled={
                  order.status === "En proceso" || order.status === "Completada" || order.status === "Cancelada"
                }
              >
                <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                Marcar en proceso
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "Completada")}
                disabled={order.status === "Completada" || order.status === "Cancelada"}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Marcar completada
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "Cancelada")}
                disabled={order.status === "Completada" || order.status === "Cancelada"}
              >
                <Ban className="mr-2 h-4 w-4 text-red-500" />
                Cancelar orden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableColumnFilters: true,
  })

  // Contar filtros activos
  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Card>
                <CardContent className="p-2">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filtros</h4>
                      {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 px-2 text-xs">
                          Limpiar todos
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div className="grid gap-3">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanFilter())
                        .map((column) => {
                          const isActive = activeFilters[column.id]
                          return (
                            <div key={column.id} className="grid gap-1">
                              <div className="flex items-center justify-between">
                                <label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
                                  {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                                </label>
                                {isActive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearFilter(column.id)}
                                    className="h-auto p-0 px-2 text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Limpiar
                                  </Button>
                                )}
                              </div>
                              <Input
                                id={`filter-${column.id}`}
                                placeholder={`Filtrar por ${column.id}...`}
                                value={(column.getFilterValue() as string) ?? ""}
                                onChange={(e) => {
                                  column.setFilterValue(e.target.value)
                                  updateActiveFilters(column.id, e.target.value)
                                }}
                                className="h-8"
                              />
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <div className="hidden items-center gap-1 lg:flex">
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {activeFilterCount} {activeFilterCount === 1 ? "filtro activo" : "filtros activos"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 text-xs">
                Limpiar todos
              </Button>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <div className="flex flex-wrap gap-1">
                {Object.keys(activeFilters).map((columnId) => (
                  <Badge
                    key={columnId}
                    variant="outline"
                    className="flex items-center gap-1 rounded-sm px-1 font-normal"
                  >
                    {columnId}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(columnId)}
                      className="h-auto p-0 text-xs ml-1"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Quitar filtro {columnId}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const order = row.original
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => markOrderNotificationsAsRead(order.id)}
                    className={order.unreadUpdates && order.unreadUpdates > 0 ? "cursor-pointer hover:bg-muted/50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {orders.length} fila(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}

