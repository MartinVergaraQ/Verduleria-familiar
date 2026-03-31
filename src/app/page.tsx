'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10l1.5-5A2 2 0 0 1 6.43 3h11.14a2 2 0 0 1 1.93 2L21 10" />
      <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
      <path d="M9 14h6" />
    </svg>
  )
}

function SaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 10.2a1 1 0 0 0 .98.8H18a1 1 0 0 0 .97-.76L21 7H7" />
    </svg>
  )
}

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="M4 7.5v9L12 21l8-4.5v-9" />
      <path d="M12 12v9" />
    </svg>
  )
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19h16" />
      <path d="M7 16v-4" />
      <path d="M12 16V8" />
      <path d="M17 16v-7" />
    </svg>
  )
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function TagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 13 13 20l-9-9V4h7l9 9Z" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 16V4" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 14v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

type MenuCardProps = {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}

function MenuCard({ href, title, description, icon }: MenuCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700 transition group-hover:bg-emerald-100">
        {icon}
      </div>

      <h3 className="text-base font-bold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
    </Link>
  )
}

export default function HomePage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-5">
        <div className="space-y-5">
          <header className="rounded-[28px] border border-emerald-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <StoreIcon className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#234126] sm:text-3xl">
                    Verdulería Familiar
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    Sistema simple para ventas, stock y control diario.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Salir
              </button>
            </div>
          </header>

          <section>
            <Link
              href="/ventas"
              className="relative block overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-6 text-white shadow-[0_20px_50px_-16px_rgba(47,90,46,0.45)] transition hover:-translate-y-0.5 hover:brightness-105 sm:p-8"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-lime-300/10" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-3xl bg-white/15 p-4 backdrop-blur-sm">
                    <SaleIcon className="h-8 w-8" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
                      Acción principal
                    </p>
                    <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                      Nueva venta
                    </h2>
                    <p className="mt-2 text-sm text-white/80">
                      Registra una venta rápida y sigue atendiendo.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#2f5a2e]">
                  Ir a ventas
                </div>
              </div>
            </Link>
          </section>

          <section className="space-y-4">
            <div className="px-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                Gestión y reportes
              </p>
            </div>

            <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MenuCard
                href="/productos"
                title="Productos"
                description="Administra el catálogo y revisa los productos disponibles."
                icon={<TagIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/stock"
                title="Stock"
                description="Controla existencias y actualiza mercadería."
                icon={<BoxIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/resumen"
                title="Resumen"
                description="Consulta cifras importantes del negocio."
                icon={<ChartIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/historial"
                title="Historial"
                description="Revisa ventas anteriores y movimientos recientes."
                icon={<HistoryIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/admin/catalogo"
                title="Admin catálogo"
                description="Gestiona categorías, variantes y configuración."
                icon={<TagIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/cierre"
                title="Cierre del día"
                description="Registra el cierre diario y controla caja."
                icon={<CashIcon className="h-6 w-6" />}
              />

              <MenuCard
                href="/exportar"
                title="Exportar"
                description="Descarga datos para respaldo o reportes."
                icon={<ShareIcon className="h-6 w-6" />}
              />
            </nav>
          </section>
        </div>
      </div>
    </main>
  )
}