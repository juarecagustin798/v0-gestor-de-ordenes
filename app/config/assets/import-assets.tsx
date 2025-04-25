// Modificar la función handleImport para asegurarse de que los activos importados se carguen correctamente
// Buscar la función handleImport y modificarla para que actualice mockAssets en memoria:

const handleImport = async () => {
  setIsImporting(true)
  try {
    // Parsear el JSON
    const assetsData = JSON.parse(jsonData)

    // Validar que sea un array
    if (!Array.isArray(assetsData)) {
      throw new Error("El formato no es válido. Se esperaba un array de activos.")
    }

    // Validar cada activo
    const validatedAssets: Asset[] = assetsData.map((asset: any) => {
      // Asegurarse de que tenga los campos requeridos
      if (!asset.ticker || !asset.name) {
        throw new Error(`Activo inválido: ${JSON.stringify(asset)}. Debe tener ticker y name.`)
      }

      // Crear un ID único si no tiene uno
      const id = asset.id || `ASSET-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Devolver un objeto Asset válido
      return {
        id,
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type || "Bono",
        market: asset.market || "Argentina",
        lastPrice: asset.lastPrice || 0,
        currency: asset.currency || "USD",
        change: asset.change || 0,
        volume: asset.volume || 0,
      }
    })

    // Guardar en localStorage
    localStorage.setItem("mockAssets", JSON.stringify(validatedAssets))

    // IMPORTANTE: Actualizar también mockAssets en memoria para uso inmediato
    // Esto asegura que los activos estén disponibles sin necesidad de recargar la página
    import("@/lib/data").then(({ mockAssets }) => {
      // Limpiar el array actual
      mockAssets.length = 0
      // Añadir los nuevos activos
      mockAssets.push(...validatedAssets)
      console.log("mockAssets actualizado en memoria con", validatedAssets.length, "activos")
    })

    // Mostrar mensaje de éxito
    toast({
      title: "Activos importados",
      description: `Se importaron ${validatedAssets.length} activos correctamente.`,
    })

    // Limpiar el textarea
    setJsonData("")

    // Recargar la lista de activos
    fetchAssets()
  } catch (error) {
    console.error("Error al importar activos:", error)
    toast({
      title: "Error al importar",
      description: error instanceof Error ? error.message : "Ocurrió un error al importar los activos.",
      variant: "destructive",
    })
  } finally {
    setIsImporting(false)
  }
}
