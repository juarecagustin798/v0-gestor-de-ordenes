"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import * as XLSX from "xlsx"
import type { Client } from "@/lib/types"
import { saveClients, saveFileInfo } from "@/lib/services/db-service"

export function ClientsImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const processExcelInChunks = async (data: any[]) => {
    const chunkSize = 1000
    const totalChunks = Math.ceil(data.length / chunkSize)
    const clients: Client[] = []

    for (let i = 0; i < totalChunks; i++) {
      const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize)

      // Procesar cada elemento del chunk
      const processedChunk = chunk.map((row) => {
        // Usar el ID de la tabla como identificador principal
        const clientId = row["ID"] || ""

        // Mapear las columnas del Excel a propiedades del cliente
        return {
          // Usar el ID de la tabla como identificador principal en lugar de generar un UUID
          id: clientId,
          // Mapeo directo de las columnas específicas
          idCliente: clientId,
          tipoCuenta: row["Tipo de cuenta"] || "",
          estado: row["Estado"] || "",
          denominacion: row["Denominación"] || "",
          cuentaEspecial: row["Cuenta Especial (CNV RG5528/2024)"] || "",
          alias: row["Alias"] || "",
          titular: row["Titular"] || "",
          tipoTitular: row["Tipo Titular"] || "",
          cartera: row["Cartera"] || "",
          categoria: row["Categoría"] || "",
          administrador: row["Administrador"] || "",
          operador: row["Operador"] || "",
          sucursal: row["Sucursal"] || "",
          claseCuenta: row["Clase de cuenta"] || "",
          cuit: row["CUIT"] || "",
          ganancias: row["Ganancias"] || "",
          iva: row["IVA"] || "",

          // Mapeo a campos genéricos para compatibilidad
          name: row["Denominación"] || row["Titular"] || "",
          documentType: "CUIT",
          documentNumber: row["CUIT"] || "",
          accountNumber: clientId,
        }
      })

      clients.push(...processedChunk)

      // Actualizar progreso
      setProgress(Math.round(((i + 1) / totalChunks) * 100))

      // Pausa para permitir que la UI se actualice
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    return clients
  }

  const handleImport = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo Excel")
      return
    }

    try {
      setIsUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(null)

      // Leer el archivo Excel
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            throw new Error("El archivo no contiene datos")
          }

          // Verificar si las columnas esperadas están presentes
          const firstRow = jsonData[0] as any
          if (!firstRow["ID"] && !firstRow["Denominación"] && !firstRow["CUIT"]) {
            throw new Error(
              "El formato del archivo no es válido. Asegúrate de que contenga las columnas esperadas (ID, Denominación, CUIT, etc.)",
            )
          }

          // Procesar los datos en chunks para evitar bloquear la UI
          const clients = await processExcelInChunks(jsonData)

          // Guardar en IndexedDB
          await saveClients(clients)

          // Guardar la información del archivo
          const fileInfo = {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            importedAt: new Date().toISOString(),
            clientCount: clients.length,
          }
          await saveFileInfo(fileInfo)

          setSuccess(`Se importaron ${clients.length} clientes correctamente`)

          // Limpiar el input de archivo
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          setFile(null)

          // Disparar un evento personalizado para notificar que los clientes han sido actualizados
          window.dispatchEvent(new CustomEvent("clientsUpdated"))
        } catch (error) {
          console.error("Error al procesar el archivo:", error)
          setError(`Error al procesar el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`)
        } finally {
          setIsUploading(false)
        }
      }

      reader.onerror = () => {
        setError("Error al leer el archivo")
        setIsUploading(false)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("Error al importar clientes:", error)
      setError(`Error al importar clientes: ${error instanceof Error ? error.message : "Error desconocido"}`)
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Clientes</CardTitle>
        <CardDescription>Importa tus clientes desde un archivo Excel (.xlsx)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="clientFile">Archivo de Clientes</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="clientFile"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {file && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando clientes...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Importación exitosa</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setFile(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }}
          disabled={isUploading || !file}
        >
          Cancelar
        </Button>
        <Button onClick={handleImport} disabled={isUploading || !file}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar Clientes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
