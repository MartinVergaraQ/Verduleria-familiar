import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Verdulería Familiar</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sistema simple para ventas, stock y resumen.
        </p>
      </div>

      <nav className="grid gap-3">
        <Link
          href="/ventas"
          className="rounded-2xl bg-green-600 px-4 py-4 text-center text-lg font-semibold text-white"
        >
          Nueva venta
        </Link>

        <Link
          href="/productos"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Productos
        </Link>

        <Link
          href="/stock"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Stock
        </Link>

        <Link
          href="/resumen"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Resumen
        </Link>
        <Link
          href="/historial"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Historial
        </Link>
        <Link
          href="/admin/catalogo"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Admin catálogo
        </Link>
        <Link
          href="/cierre"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Cierre del día
        </Link>
        <Link
          href="/exportar"
          className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-semibold shadow-sm"
        >
          Exportar
        </Link>
      </nav>
    </div>
  )
}