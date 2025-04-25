import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Orden no encontrada</h1>
      <p className="text-lg text-muted-foreground mb-8">La orden que estás buscando no existe o ha sido eliminada.</p>
      <Link href="/orders">
        <Button>Volver a la lista de órdenes</Button>
      </Link>
    </div>
  )
}
