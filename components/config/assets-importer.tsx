"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { fetchAllInstruments, getExampleInstruments, loadAssetsFromStorage } from "@/lib/api-service"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  RefreshCw,
  CheckCircle,
  Database,
  WifiOff,
  AlertTriangle,
  Info,
  Server,
  Key,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Asset } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Función para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function AssetsImporter() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dataSource, setDataSource] = useState<"localStorage" | "example" | "api" | null>(null)
  const [apiStatus, setApiStatus] = useState<"checking" | "available" | "unavailable" | "error">("checking")

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalPages, setTotalPages] = useState(1)

  // Filtros avanzados
  const [marketFilter, setMarketFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [currencyFilter, setCurrencyFilter] = useState<string>("")

  // Debounce para la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Cargar activos desde localStorage al iniciar
  useEffect(() => {
    const storedAssets = loadAssetsFromStorage()
    if (storedAssets.length > 0) {
      setAssets(storedAssets)
      setSuccess(true)
      setDataSource("localStorage")
      setApiStatus("checking") // Mantener el estado de la API como "checking" hasta que se intente una conexión

      // Calcular el número total de páginas
      setTotalPages(Math.ceil(storedAssets.length / pageSize))
    }
  }, [pageSize])

  // Obtener valores únicos para los filtros
  const uniqueMarkets = useMemo(() => {
    const markets = new Set<string>()
    assets.forEach((asset) => {
      if (asset.market) markets.add(asset.market)
    })
    return Array.from(markets).sort()
  }, [assets])

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>()
    assets.forEach((asset) => {
      if (asset.type) types.add(asset.type)
    })
    return Array.from(types).sort()
  }, [assets])

  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set<string>()
    assets.forEach((asset) => {
      if (asset.currency) currencies.add(asset.currency)
    })
    return Array.from(currencies).sort()
  }, [assets])

  // Filtrar activos cuando cambia la búsqueda debounced o los filtros
  const filteredAssets = useMemo(() => {
    if (!assets.length) return []

    return assets.filter((asset) => {
      // Aplicar filtro de búsqueda
      const matchesSearch =
        !debouncedSearchQuery ||
        asset.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        asset.ticker.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        asset.market.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        asset.currency.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

      // Aplicar filtros adicionales
      const matchesMarket = !marketFilter || asset.market === marketFilter
      const matchesType = !typeFilter || asset.type === typeFilter
      const matchesCurrency = !currencyFilter || asset.currency === currencyFilter

      return matchesSearch && matchesMarket && matchesType && matchesCurrency
    })
  }, [assets, debouncedSearchQuery, marketFilter, typeFilter, currencyFilter])

  // Calcular el número total de páginas basado en los activos filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAssets.length / pageSize))
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }, [filteredAssets, pageSize])

  // Obtener los activos para la página actual
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAssets.slice(startIndex, startIndex + pageSize)
  }, [filteredAssets, currentPage, pageSize])

  const handleImportAssets = async () => {
    let progressInterval: NodeJS.Timeout
    try {
      setIsLoading(true)
      setProgress(10)
      setError(null)
      setErrorDetails(null)
      setSuccess(false)
      setDataSource(null)
      setApiStatus("checking")

      // Simular progreso
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Obtener los activos
      const importedAssets = await fetchAllInstruments()

      clearInterval(progressInterval)
      setProgress(100)

      setAssets(importedAssets)
      setSuccess(true)
      setDataSource("api")
      setApiStatus("available")

      // Calcular el número total de páginas
      setTotalPages(Math.ceil(importedAssets.length / pageSize))
      setCurrentPage(1) // Resetear a la primera página

      toast({
        title: "Importación exitosa",
        description: `Se han importado ${importedAssets.length} activos correctamente.`,
      })

      // Forzar revalidación de rutas para actualizar los datos
      router.refresh()
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval)
      setProgress(0)
      setApiStatus("unavailable")

      // Mostrar un error claro
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al importar activos"

      // Extraer detalles adicionales si están disponibles
      let details = ""
      if (error instanceof Error) {
        if (errorMessage.includes("token")) {
          details =
            "No se pudo obtener el token de autenticación. Verifique las credenciales y el formato de la solicitud."
        } else if (errorMessage.includes("HTML")) {
          details =
            "La API está devolviendo una página HTML en lugar de datos JSON. Esto indica que la autenticación ha fallado."
        } else if (errorMessage.includes("autenticación") || errorMessage.includes("autenticar")) {
          details = "Hay un problema con la autenticación. Verifique las credenciales y el formato de la solicitud."
        } else if (errorMessage.includes("CORS")) {
          details =
            "Hay un problema de CORS (Cross-Origin Resource Sharing). La API no permite solicitudes desde este origen."
        } else if (errorMessage.includes("timeout")) {
          details = "La solicitud excedió el tiempo de espera. El servidor podría estar sobrecargado o inaccesible."
        } else if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
          details = "Error de red. Verifique su conexión a Internet y que la API esté accesible."
        }
      }

      setError(`No se pudo conectar con la API: ${errorMessage}`)
      setErrorDetails(
        details || "Es posible que la API no sea accesible desde este entorno o que haya restricciones de seguridad.",
      )
      setSuccess(false)

      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la API. Utilice el botón 'Cargar Ejemplos' si necesita datos de prueba.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadExampleData = () => {
    try {
      setIsLoading(true)
      setProgress(50)
      setError(null)
      setErrorDetails(null)

      // Cargar datos de ejemplo
      const exampleAssets = getExampleInstruments()

      setProgress(100)
      setAssets(exampleAssets)
      setSuccess(true)
      setDataSource("example")

      // Calcular el número total de páginas
      setTotalPages(Math.ceil(exampleAssets.length / pageSize))
      setCurrentPage(1) // Resetear a la primera página

      toast({
        title: "Datos de ejemplo cargados",
        description: `Se han cargado ${exampleAssets.length} activos de ejemplo.`,
      })

      // Forzar revalidación de rutas para actualizar los datos
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar datos de ejemplo")
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ejemplo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para la paginación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("")
    setMarketFilter("")
    setTypeFilter("")
    setCurrencyFilter("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-medium">Importación de Activos</h3>
          <p className="text-sm text-muted-foreground">
            Importa activos financieros desde la API o utiliza datos de ejemplo
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleLoadExampleData} disabled={isLoading}>
            <Database className="mr-2 h-4 w-4" />
            Cargar Ejemplos
          </Button>
          <Button onClick={handleImportAssets} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Importar Activos
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {progress < 50 ? "Iniciando importación..." : "Procesando datos..."}
          </p>
        </div>
      )}

      {apiStatus === "checking" && dataSource === "localStorage" && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Usando datos almacenados localmente</AlertTitle>
          <AlertDescription>
            Se están mostrando datos almacenados previamente. Haga clic en "Importar Activos" para intentar actualizar
            desde la API o en "Cargar Ejemplos" para usar datos de prueba.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>
            {error}
            {errorDetails && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-900">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mt-0.5 mr-2" />
                  <span>{errorDetails}</span>
                </div>
              </div>
            )}
            <div className="mt-4">
              <Alert
                variant="warning"
                className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900"
              >
                <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Problemas de autenticación</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Se ha intentado utilizar autenticación basada en headers (X-Username, X-Password), pero se han
                    encontrado problemas:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Es posible que el navegador no pueda acceder al header X-Auth-Token en la respuesta</li>
                    <li>Las políticas de CORS pueden estar bloqueando el acceso a los headers de respuesta</li>
                    <li>La API podría requerir configuración adicional para permitir solicitudes desde este origen</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert
                variant="default"
                className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900"
              >
                <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Recomendación</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Para resolver este problema, considere estas opciones:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>
                      Implementar un proxy en el servidor de Next.js que maneje la autenticación y reenvíe las
                      solicitudes a la API
                    </li>
                    <li>
                      Solicitar a los administradores de la API que configuren los headers CORS adecuados para permitir
                      el acceso desde este origen
                    </li>
                    <li>
                      Utilizar los datos de ejemplo para desarrollo y pruebas mientras se resuelve el problema de
                      autenticación
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button variant="outline" size="sm" onClick={handleLoadExampleData} className="mt-4">
                <Database className="mr-2 h-4 w-4" />
                Cargar datos de ejemplo
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {success && !error && (
        <Alert
          variant={dataSource === "example" ? "warning" : "default"}
          className={
            dataSource === "example"
              ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900"
              : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
          }
        >
          <CheckCircle
            className={`h-4 w-4 ${
              dataSource === "example" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
            }`}
          />
          <AlertTitle>Datos cargados correctamente</AlertTitle>
          <AlertDescription>
            {dataSource === "api" && "Los datos se han importado correctamente desde la API."}
            {dataSource === "example" &&
              "Se están utilizando datos de ejemplo. Estos datos son ficticios y solo deben usarse para pruebas."}
            {dataSource === "localStorage" && "Se han cargado datos almacenados localmente."} Hay {assets.length}{" "}
            activos disponibles para crear órdenes.
          </AlertDescription>
        </Alert>
      )}

      {assets.length > 0 && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, ticker, mercado..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Select value={marketFilter} onValueChange={setMarketFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por mercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los mercados</SelectItem>
                  {uniqueMarkets.map((market) => (
                    <SelectItem key={market} value={market}>
                      {market}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las monedas</SelectItem>
                  {uniqueCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información de filtros y botón para limpiar */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedAssets.length} de {filteredAssets.length} activos filtrados (total: {assets.length})
            </p>

            {(searchQuery || marketFilter || typeFilter || currencyFilter) && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Selector de tamaño de página */}
          <div className="flex justify-end items-center space-x-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.ticker}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.market}</Badge>
                        </TableCell>
                        <TableCell>{asset.currency}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{asset.type}</Badge>
                        </TableCell>
                        <TableCell>{asset.maturityDate || "-"}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: asset.currency,
                          }).format(asset.lastPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No se encontraron activos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= totalPages}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
