import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
} from "./orden-supabase-service"

// Este archivo proporciona compatibilidad con el antiguo OrdenService
// para que los componentes existentes sigan funcionando sin cambios
export const OrdenService = {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
  agregarObservacion,
  actualizarEstadoOrden,
  obtenerOrdenesPorCliente,
  obtenerOrdenesPorEstado,
}
