export async function POST(request: Request) {
  const data = await request.json()

  // Asegurarse de que esta línea no esté sobrescribiendo el tipo:
  // data.type = "Venta"; // <-- Eliminar o comentar esta línea si existe

  // Agregar un log para depuración:
  console.log("Tipo de operación en API antes de guardar:", data.type)
}
