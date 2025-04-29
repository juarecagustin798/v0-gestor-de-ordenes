import { getAssets } from "@/lib/services/asset-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export async function AssetsList() {
  const assets = await getAssets()

  if (!assets || assets.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No assets found</AlertTitle>
        <AlertDescription>
          No assets are currently available in the system. Please check the configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{asset.name}</CardTitle>
            <CardDescription>{asset.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Symbol:</div>
              <div>{asset.symbol}</div>
              {asset.isin && (
                <>
                  <div className="font-medium">ISIN:</div>
                  <div>{asset.isin}</div>
                </>
              )}
              {asset.currency && (
                <>
                  <div className="font-medium">Currency:</div>
                  <div>{asset.currency}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
