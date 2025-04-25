export const metadata = {
  title: "Órdenes | Gestor de Órdenes",
  description: "Gestión de órdenes de compra y venta",
}

import OrdenesPageClient from "./ordenes-page-client"

export default async function OrdenesPage() {
  return <OrdenesPageClient />
}
