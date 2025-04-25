// Este archivo es necesario para que el paquete xlsx funcione correctamente en el cliente
// Proporciona un shim para el objeto global 'process' que xlsx espera

if (typeof window !== "undefined" && !window.process) {
  ;(window as any).process = {
    env: {},
  }
}
