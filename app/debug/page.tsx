"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, RefreshCw, Trash2 } from "lucide-react"
import { validateClientData, debugLocalStorage, resetClientData } from "@/lib/debug-utils"
import { getClients } from "@/lib/data"
import type { Client } from "@/lib/types"

export default function DebugPage() {
  const [clientValidation, setClientValidation] = useState<any>(null)
  const [storageData, setStorageData] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Validar datos de clientes
        const validation = validateClientData()
        setClientValidation(validation)

        // Obtener datos de localStorage
        const storage = debugLocalStorage()
        setStorageData(storage)

        // Cargar clientes usando la función normal
        const loadedClients = await getClients()
        setClients(loadedClients)
      } catch (e) {
        console.error("Error al cargar datos de depuración:", e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleResetClients = () => {
    if (confirm("¿Estás seguro de que deseas eliminar todos los clientes?")) {
      resetClientData()
    }
  }

  const handleClearAllData = () => {
    if (confirm("¿Estás seguro de que deseas eliminar TODOS los datos (clientes, órdenes, activos)?")) {
      localStorage.removeItem("mockClients")
      localStorage.removeItem("mockOrders")
      localStorage.removeItem("mockAssets")
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Página de Depuración</h1>

      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando datos...</div>
      ) : (
        <Tabs defaultValue="clients">
          <TabsList className="mb-4">
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="localStorage">LocalStorage</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Validación de Clientes</CardTitle>
                <CardDescription>Estado de los datos de clientes en la aplicación</CardDescription>
              </CardHeader>
              <CardContent>
                {clientValidation && (
                  <Alert variant={clientValidation.valid ? "default" : "destructive"} className="mb-4">
                    <div className="flex items-center gap-2">
                      {clientValidation.valid ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{clientValidation.valid ? "Datos válidos" : "Problema detectado"}</AlertTitle>
                    </div>
                    <AlertDescription>{clientValidation.message}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Clientes cargados ({clients.length})</h3>
                  {clients.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.slice(0, 10).map((client) => (
                            <tr key={client.id} className="border-t">
                              <td className="p-2">{client.id}</td>
                              <td className="p-2">{client.name}</td>
                              <td className="p-2">{client.email}</td>
                            </tr>
                          ))}
                          {clients.length > 10 && (
                            <tr className="border-t">
                              <td colSpan={3} className="p-2 text-center text-muted-foreground">
                                ... y {clients.length - 10} más
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No hay clientes cargados</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localStorage">
            <Card>
              <CardHeader>
                <CardTitle>Datos en LocalStorage</CardTitle>
                <CardDescription>Información almacenada en el navegador</CardDescription>
              </CardHeader>
              <CardContent>
                {storageData && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Clientes ({storageData.clients?.length || 0})</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40 mb-4">
                      {JSON.stringify(storageData.clients?.slice(0, 3) || [], null, 2)}
                      {storageData.clients?.length > 3 && "\n... y más"}
                    </pre>

                    <h3 className="text-lg font-medium mb-2">Órdenes ({storageData.orders?.length || 0})</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40 mb-4">
                      {JSON.stringify(storageData.orders?.slice(0, 2) || [], null, 2)}
                      {storageData.orders?.length > 2 && "\n... y más"}
                    </pre>

                    <h3 className="text-lg font-medium mb-2">Activos ({storageData.assets?.length || 0})</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40">
                      {JSON.stringify(storageData.assets?.slice(0, 3) || [], null, 2)}
                      {storageData.assets?.length > 3 && "\n... y más"}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Acciones de Depuración</CardTitle>
                <CardDescription>Herramientas para solucionar problemas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Reiniciar Datos</h3>
                  <div className="space-y-2">
                    <Button onClick={handleResetClients} variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Eliminar Clientes
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Elimina todos los clientes almacenados en localStorage.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Eliminar Todos los Datos</h3>
                  <div className="space-y-2">
                    <Button onClick={handleClearAllData} variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Eliminar Todo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Elimina todos los datos (clientes, órdenes, activos) almacenados en localStorage.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">Estas acciones no se pueden deshacer.</CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
