"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { importClientsFromJSON } from "@/lib/client-service"

export function ImportClients() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      // Usar la nueva función de importación que limpia los clientes existentes
      const importResult = await importClientsFromJSON(file)
      setResult(importResult)
    } catch (error) {
      console.error("Error al importar clientes:", error)
      setResult({
        success: false,
        message: "Error al importar clientes. Consulta la consola para más detalles.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Clientes</CardTitle>
        <CardDescription>
          Importa clientes desde un archivo JSON. Esta acción reemplazará todos los clientes existentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input type="file" id="client-file" accept=".json" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor="client-file"
              className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              Seleccionar archivo
            </label>
            {file && <span className="text-sm">{file.name}</span>}
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!file || isUploading} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {isUploading ? "Importando..." : "Importar Clientes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
