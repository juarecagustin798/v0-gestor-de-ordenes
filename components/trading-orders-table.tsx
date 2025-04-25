"use client"

import { useState, useEffect } from "react"
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
  CheckCircle,
  AlertCircle,
  Ban,
  Clock,
  ArrowRightLeft,
  Filter,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Order, User } from "@/lib/types"
import { updateOrderStatus, markNotificationsAsRead } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import { StatusUpdateDialog } from "./status-update-dialog"
import { ExecutionConfirmationDialog } from "./execution-confirmation-dialog"
import { NotificationBadge } from "./notification-badge"

interface TradingOrdersTableProps {
  orders: Order[]
  traders: User[]
  availableActions: ("tomar" | "ejecutar" | "ejecutarParcial" | "revisar" | "cancelar")[]
  readOnly?: boolean
}

export function TradingOrdersTable({ orders, traders, availableActions, readOnly = false }: TradingOrdersTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({})

  // Estado para el diálogo de actualización de estado
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Estado para el diálogo de confirmación de ejecución
  const [executionConfirmOpen, setExecutionConfirmOpen] = useState(false)

  // Estado para manejar la actualización secuencial de múltiples órdenes
  const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([])
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0)
  const [processingMultiple, setProcessingMultiple] = useState(false)

  // Obtener IDs de órdenes seleccionadas
  const getSelectedOrderIds = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    return selectedRows.map((row) => row.original.id)
  }

  // Obtener detalles de la orden actual
  const getCurrentOrder = () => {
    if (!currentOrderId) return null
    return orders.find((order) => order.id === currentOrderId)
  }

  // Manejar actualización de estado para múltiples órdenes
  const handleBulkStatusUpdate = (status: string) => {
    // Si es una ejecución, mostrar el diálogo de confirmación primero
    if (status === "Ejecutada") {
      setSelectedStatus(status)
      setExecutionConfirmOpen(true)
    } else {
      setSelectedStatus(status)
      setStatusDialogOpen(true)
    }
  }

  // Manejar actualización de estado para una sola orden
  const handleSingleStatusUpdate = async (orderId: string, status: string) => {
    // Seleccionar solo esta orden
    const rowIndex = orders.findIndex((order) => order.id === orderId)
    if (rowIndex >= 0) {
      const newSelection: Record<number, boolean> = {}
      newSelection[rowIndex] = true
      setRowSelection(newSelection)
    }

    // Si es una ejecución, mostrar el diálogo de confirmación primero
    if (status === "Ejecutada") {
      setSelectedStatus(status)
      setExecutionConfirmOpen(true)
    } else {
      setSelectedStatus(status)
      setStatusDialogOpen(true)
    }
  }

  // Manejar la respuesta del diálogo de confirmación de ejecución
  const handleExecutionConfirm = (completeInfo: boolean) => {
    setExecutionConfirmOpen(false)

    if (completeInfo) {
      // Si el usuario quiere completar información
      const orderIds = getSelectedOrderIds()

      if (orderIds.length > 1) {
        // Para múltiples órdenes, configurar el proceso secuencial
        setPendingOrderIds(orderIds)
        setCurrentOrderId(orderIds[0])
        setCurrentOrderIndex(0)
        setProcessingMultiple(true)
        setStatusDialogOpen(true)
      } else if (orderIds.length === 1) {
        // Para una sola orden, mostrar el diálogo normal
        setCurrentOrderId(orderIds[0])
        setProcessingMultiple(false)
        setStatusDialogOpen(true)
      }
    } else {
      // Si el usuario no quiere completar información, ejecutar directamente todas las órdenes
      processStatusUpdate({ observation: "Orden ejecutada sin información adicional" })
    }
  }

  // Procesar la actualización de estado para una orden individual o todas las órdenes
  const processStatusUpdate = async (params: {
    observation: string
    executedQuantity?: number
    executedPrice?: number
  }) => {
    if (processingMultiple) {
      // Actualizar la orden actual
      await updateSingleOrder(currentOrderId!, params)

      // Verificar si hay más órdenes pendientes
      if (currentOrderIndex < pendingOrderIds.length - 1) {
        // Pasar a la siguiente orden
        const nextIndex = currentOrderIndex + 1
        setCurrentOrderIndex(nextIndex)
        setCurrentOrderId(pendingOrderIds[nextIndex])

        // Mantener el diálogo abierto para la siguiente orden
        return
      } else {
        // Finalizar el proceso de múltiples órdenes
        setProcessingMultiple(false)
        setPendingOrderIds([])
        setCurrentOrderId(null)
        setCurrentOrderIndex(0)
        setStatusDialogOpen(false)

        // Mostrar mensaje de éxito
        toast({
          title: "Órdenes actualizadas",
          description: `Se han actualizado ${pendingOrderIds.length} órdenes correctamente.`,
        })

        // Limpiar selección y refrescar
        setRowSelection({})
        router.refresh()
        return
      }
    }

    // Proceso normal para una sola orden o todas las órdenes a la vez
    const orderIds = processingMultiple ? [currentOrderId!] : getSelectedOrderIds()

    if (orderIds.length === 0 || !selectedStatus) {
      toast({
        title: "Error",
        description: "No hay órdenes seleccionadas o estado definido",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdating(true)
      const result = await updateOrderStatus({
        orderIds: orderIds,
        status: selectedStatus,
        observation: params.observation,
        executedQuantity: params.executedQuantity,
        executedPrice: params.executedPrice,
      })

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: result.message,
        })
        // Limpiar selección
        setRowSelection({})
        // Forzar actualización de la página
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setStatusDialogOpen(false)
    }
  }

  // Función para actualizar una sola orden (usada en el proceso secuencial)
  const updateSingleOrder = async (
    orderId: string,
    params: {
      observation: string
      executedQuantity?: number
      executedPrice?: number
    },
  ) => {
    try {
      const result = await updateOrderStatus({
        orderIds: [orderId],
        status: selectedStatus!,
        observation: params.observation,
        executedQuantity: params.executedQuantity,
        executedPrice: params.executedPrice,
      })

      if (!result.success) {
        toast({
          title: "Error",
          description: `Error al actualizar la orden ${orderId}: ${result.error || "Error desconocido"}`,
          variant: "destructive",
        })
      }

      return result.success
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al actualizar la orden ${orderId}`,
        variant: "destructive",
      })
      return false
    }
  }

  // Función para marcar notificaciones como leídas
  const markOrderNotificationsAsRead = async (orderId: string) => {
    try {
      // Solo marcar como leída si tiene notificaciones no leídas
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
          disabled={readOnly}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          disabled={readOnly}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    },
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
      enableColumnFilter: true,
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
      enableColumnFilter: true,
    },
    {
      accessorKey: "ticker",
      header: "Ticker",
      cell: ({ row }) => <div className="font-medium">{row.getValue("ticker")}</div>,
      enableColumnFilter: true,
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
      enableColumnFilter: true,
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => <div className="text-right">{row.getValue("quantity")}</div>,
      enableColumnFilter: true,
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
      enableColumnFilter: true,
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
      enableColumnFilter: true,
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
          case "Tomada":
            variant = "blue"
            break
          case "Ejecutada parcial":
            variant = "yellow"
            break
          case "Ejecutada":
            variant = "green"
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
      enableColumnFilter: true,
    },
    {
      accessorKey: "trader",
      header: "Operador",
      cell: ({ row }) => {
        const trader = row.getValue("trader") as string | undefined
        return <div>{trader || "-"}</div>
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return <div>{date.toLocaleDateString()}</div>
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "commercial",
      header: "Comercial",
      cell: ({ row }) => <div>{row.getValue("commercial")}</div>,
      enableColumnFilter: true,
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
                disabled={readOnly || isUpdating}
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

              {!readOnly && availableActions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>

                  {availableActions.includes("tomar") && (
                    <DropdownMenuItem
                      onClick={() => handleSingleStatusUpdate(order.id, "Tomada")}
                      disabled={order.status === "Tomada"}
                    >
                      <Clock className="mr-2 h-4 w-4 text-blue-500" />
                      Tomar orden
                    </DropdownMenuItem>
                  )}

                  {availableActions.includes("ejecutar") && (
                    <DropdownMenuItem
                      onClick={() => handleSingleStatusUpdate(order.id, "Ejecutada")}
                      disabled={order.status === "Ejecutada" || order.status === "Cancelada"}
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Marcar ejecutada
                    </DropdownMenuItem>
                  )}

                  {availableActions.includes("ejecutarParcial") && (
                    <DropdownMenuItem
                      onClick={() => handleSingleStatusUpdate(order.id, "Ejecutada parcial")}
                      disabled={order.status === "Ejecutada" || order.status === "Cancelada"}
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                      Ejecutar parcialmente
                    </DropdownMenuItem>
                  )}

                  {availableActions.includes("revisar") && (
                    <DropdownMenuItem
                      onClick={() => handleSingleStatusUpdate(order.id, "Revisar")}
                      disabled={
                        order.status === "Revisar" || order.status === "Ejecutada" || order.status === "Cancelada"
                      }
                    >
                      <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                      Marcar para revisar
                    </DropdownMenuItem>
                  )}

                  {availableActions.includes("cancelar") && (
                    <DropdownMenuItem
                      onClick={() => handleSingleStatusUpdate(order.id, "Cancelada")}
                      disabled={order.status === "Ejecutada" || order.status === "Cancelada"}
                    >
                      <Ban className="mr-2 h-4 w-4 text-red-500" />
                      Cancelar orden
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableColumnFilter: false,
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

  // Verificar si hay filas seleccionadas
  const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  // Efecto para actualizar la tabla cuando cambian las órdenes
  useEffect(() => {
    // Resetear la selección cuando cambian las órdenes
    setRowSelection({})
  }, [orders])

  // Contar filtros activos
  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
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

          {!readOnly && hasSelection && (
            <div className="flex items-center space-x-2">
              {availableActions.includes("tomar") && (
                <Button variant="outline" onClick={() => handleBulkStatusUpdate("Tomada")} disabled={isUpdating}>
                  <Clock className="mr-2 h-4 w-4" />
                  Tomar seleccionadas
                </Button>
              )}

              {availableActions.includes("ejecutar") && (
                <Button variant="outline" onClick={() => handleBulkStatusUpdate("Ejecutada")} disabled={isUpdating}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Ejecutar seleccionadas
                </Button>
              )}

              {availableActions.includes("revisar") && (
                <Button variant="outline" onClick={() => handleBulkStatusUpdate("Revisar")} disabled={isUpdating}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Revisar seleccionadas
                </Button>
              )}

              {availableActions.includes("cancelar") && (
                <Button variant="outline" onClick={() => handleBulkStatusUpdate("Cancelada")} disabled={isUpdating}>
                  <Ban className="mr-2 h-4 w-4" />
                  Cancelar seleccionadas
                </Button>
              )}
            </div>
          )}
        </div>
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

      {/* Diálogo de confirmación para ejecución */}
      <ExecutionConfirmationDialog
        open={executionConfirmOpen}
        onOpenChange={setExecutionConfirmOpen}
        onConfirm={handleExecutionConfirm}
        orderCount={selectedCount}
      />

      {/* Diálogo para actualizar estado con observaciones */}
      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!open && processingMultiple) {
            // Si se cierra el diálogo durante el proceso de múltiples órdenes,
            // cancelar el proceso y limpiar el estado
            setProcessingMultiple(false)
            setPendingOrderIds([])
            setCurrentOrderId(null)
            setCurrentOrderIndex(0)
          }
          setStatusDialogOpen(open)
        }}
        status={selectedStatus || ""}
        onConfirm={processStatusUpdate}
        showExecutionFields={selectedStatus === "Ejecutada" || selectedStatus === "Ejecutada parcial"}
        currentOrder={getCurrentOrder()}
        isProcessingMultiple={processingMultiple}
        currentOrderIndex={currentOrderIndex}
        totalOrders={pendingOrderIds.length}
      />
    </div>
  )
}

