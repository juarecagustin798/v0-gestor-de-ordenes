"use client"

import { useState, useEffect } from "react"
import { FileSpreadsheet, Clock } from "lucide-react"
import { getFileInfo, type FileInfo } from "@/lib/services/db-service"

export function ClientFileStatus() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)

  useEffect(() => {
    const loadFileInfo = async () => {
      try {
        const info = await getFileInfo()
        setFileInfo(info)
      } catch (error) {
        console.error("Error al cargar información del archivo:", error)
      }
    }

    loadFileInfo()

    // Escuchar eventos de actualización de clientes
    const handleClientsUpdated = () => {
      loadFileInfo()
    }

    window.addEventListener("clientsUpdated", handleClientsUpdated)

    return () => {
      window.removeEventListener("clientsUpdated", handleClientsUpdated)
    }
  }, [])

  if (!fileInfo) return null

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="flex items-center text-sm text-muted-foreground mt-2">
      <FileSpreadsheet className="h-4 w-4 mr-1" />
      <span className="mr-2">{fileInfo.name}</span>
      <span className="mr-2">({formatFileSize(fileInfo.size)})</span>
      <Clock className="h-4 w-4 mr-1 ml-2" />
      <span>Importado: {formatDate(fileInfo.importedAt)}</span>
      <span className="ml-2">Clientes: {fileInfo.clientCount}</span>
    </div>
  )
}
