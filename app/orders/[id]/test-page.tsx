export default function TestPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Página de prueba</h1>
      <p>ID de la orden: {params.id}</p>
    </div>
  )
}
