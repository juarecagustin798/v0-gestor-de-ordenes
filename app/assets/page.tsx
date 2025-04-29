import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AssetsList } from "@/components/assets/assets-list"
import { AssetsLoading } from "@/components/assets/assets-loading"

export default function AssetsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Assets</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Assets</CardTitle>
          <CardDescription>View all available assets in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <Suspense fallback={<AssetsLoading />}>
              <AssetsList />
            </Suspense>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
