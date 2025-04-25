import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientsImporter } from "@/components/config/clients-importer"
import { ClientsList } from "@/components/config/clients-list"
import { ClientsSupabaseSync } from "@/components/config/clients-supabase-sync"
import { AssetsImporter } from "@/components/config/assets-importer"
import { AssetsList } from "@/components/config/assets-list"

export default function ConfigPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Configuración</h1>

      <Tabs defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClientsImporter />
            <ClientsSupabaseSync />
          </div>
          <ClientsList />
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <AssetsImporter />
            <AssetsList />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-muted-foreground">Configuración de usuarios próximamente</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-muted-foreground">Ajustes generales próximamente</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
