// This file provides backward compatibility for code that imports OrdenService
import {
  crearOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  eliminarOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
} from "./orden-supabase-service"

// Re-export the OrdenService object for backward compatibility
export const OrdenService = {
  crearOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  actualizarOrden,
  eliminarOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
}
