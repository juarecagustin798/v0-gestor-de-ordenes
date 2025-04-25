import type React from "react"
import { cn } from "@/lib/utils"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className, "border-t")}>
      <div className="container flex flex-col items-center justify-between gap-4 py-4 md:h-16 md:flex-row md:py-0">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Gestor de Órdenes © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
