import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { RolePermissionsInfo } from "@/components/admin/role-permissions-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Administración de Usuarios"
        text="Gestiona los usuarios y sus permisos en el sistema."
      />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Administra los usuarios, sus roles y permisos. Puedes crear, editar y desactivar usuarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RolePermissionsInfo />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
