'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getDailyClosure } from '@/src/features/closure/api/get-daily-closure'
import type {
    DailyClosureSale,
    DailyClosureStats,
} from '@/src/features/closure/types/daily-closure'
import { getTopProductsToday } from '@/src/features/closure/api/get-top-products-today'
import type { TopProductItem } from '@/src/features/closure/types/top-products'
import { exportDailyClosureCsv } from '@/src/features/closure/utils/export-daily-closure-csv'

function getStatusStyles(status: string) {
    if (status === 'cancelled') {
        return 'border-red-200 bg-red-50 text-red-700'
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function formatMoney(value: number) {
    return `$${Math.round(value).toLocaleString('es-CL')}`
}

type SummaryCardProps = {
    title: string
    value: string
    subtitle?: string
    tone?: 'neutral' | 'green' | 'red'
}

function SummaryCard({
    title,
    value,
    subtitle,
    tone = 'neutral',
}: SummaryCardProps) {
    const toneClass =
        tone === 'green'
            ? 'border-emerald-100 bg-emerald-50/80'
            : tone === 'red'
                ? 'border-red-100 bg-red-50/80'
                : 'border-neutral-200 bg-white'

    return (
        <div className={`rounded-[26px] border p-5 shadow-sm ${toneClass}`}>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
                {value}
            </p>
            {subtitle ? (
                <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
            ) : null}
        </div>
    )
}

export default function CierrePage() {
    const [stats, setStats] = useState<DailyClosureStats | null>(null)
    const [sales, setSales] = useState<DailyClosureSale[]>([])
    const [topProducts, setTopProducts] = useState<TopProductItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                setError('')
                const [closureData, topProductsData] = await Promise.all([
                    getDailyClosure(),
                    getTopProductsToday(),
                ])

                setStats(closureData.stats)
                setSales(closureData.sales)
                setTopProducts(topProductsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando cierre')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const completedSales = useMemo(
        () => sales.filter((sale) => sale.status !== 'cancelled'),
        [sales]
    )

    return (
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 pb-10">
                <div className="space-y-6">
                    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126] md:text-4xl">
                                Cierre del día
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500 md:text-base">
                                Revisa ventas, montos del día y exporta el resumen cuando lo necesites.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/"
                                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm"
                            >
                                Volver
                            </Link>

                            <button
                                type="button"
                                onClick={() => exportDailyClosureCsv(sales)}
                                disabled={sales.length === 0}
                                className="rounded-2xl bg-[#234126] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50"
                            >
                                Exportar CSV
                            </button>
                        </div>
                    </header>

                    {loading && (
                        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                            Cargando cierre...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {!loading && stats && (
                        <>
                            <section className="rounded-[32px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-6 text-white shadow-[0_18px_40px_-16px_rgba(47,90,46,0.5)] md:p-7">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white/80">Resumen del día</p>
                                        <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                                            {formatMoney(stats.totalSales)}
                                        </p>
                                        <p className="mt-2 text-sm text-white/75">Total vendido hoy</p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                            <p className="text-xs uppercase tracking-wide text-white/70">
                                                Ventas completadas
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">{stats.salesCount}</p>
                                        </div>

                                        <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                            <p className="text-xs uppercase tracking-wide text-white/70">
                                                Ventas anuladas
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">{stats.cancelledCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard
                                    title="Total vendido hoy"
                                    value={formatMoney(stats.totalSales)}
                                    subtitle="Monto total acumulado"
                                    tone="green"
                                />

                                <SummaryCard
                                    title="Ventas completadas"
                                    value={stats.salesCount.toLocaleString('es-CL')}
                                    subtitle="Ventas cerradas del día"
                                />

                                <SummaryCard
                                    title="Efectivo"
                                    value={formatMoney(stats.totalCash)}
                                    subtitle="Ingresos en caja"
                                />

                                <SummaryCard
                                    title="Transferencia"
                                    value={formatMoney(stats.totalTransfer)}
                                    subtitle="Pagos digitales"
                                />
                            </section>

                            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
                                <div className="space-y-5">
                                    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                            Estado general
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Indicadores rápidos del cierre.
                                        </p>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            <SummaryCard
                                                title="Ventas anuladas"
                                                value={stats.cancelledCount.toLocaleString('es-CL')}
                                                subtitle="Registros anulados hoy"
                                                tone="red"
                                            />

                                            <SummaryCard
                                                title="Ventas activas"
                                                value={completedSales.length.toLocaleString('es-CL')}
                                                subtitle="Ventas válidas del día"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                                Productos más vendidos hoy
                                            </h2>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Lo que más salió durante la jornada.
                                            </p>
                                        </div>

                                        {topProducts.length === 0 ? (
                                            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                                <p className="font-semibold text-neutral-700">
                                                    Todavía no hay productos vendidos hoy.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {topProducts.map((item, index) => (
                                                    <div
                                                        key={`${item.product_name_snapshot}-${item.variant_name_snapshot}-${index}`}
                                                        className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                                    {item.product_name_snapshot}
                                                                </p>
                                                                <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                                                                    {item.variant_name_snapshot}
                                                                </p>
                                                                <p className="mt-2 text-base text-neutral-600">
                                                                    {Number(item.total_quantity).toLocaleString('es-CL')}{' '}
                                                                    {item.unit_snapshot} vendidos
                                                                </p>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-3xl font-extrabold tracking-tight text-neutral-900">
                                                                    {formatMoney(Number(item.total_amount))}
                                                                </p>
                                                                <p className="mt-1 text-xs text-neutral-500">recaudado</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                                Ventas del día
                                            </h2>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Historial de ventas registradas hoy.
                                            </p>
                                        </div>

                                        <span className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-600">
                                            {sales.length} registro{sales.length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {sales.length === 0 ? (
                                        <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                            <p className="font-semibold text-neutral-700">No hay ventas hoy.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sales.map((sale) => (
                                                <div
                                                    key={sale.id}
                                                    className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5"
                                                >
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <p className="text-4xl font-extrabold tracking-tight text-neutral-900">
                                                                {formatMoney(Number(sale.total))}
                                                            </p>
                                                            <p className="mt-2 text-base text-neutral-600">
                                                                {sale.payment_method} · {new Date(sale.sold_at).toLocaleString('es-CL')}
                                                            </p>

                                                            {sale.notes ? (
                                                                <p className="mt-2 text-sm text-neutral-500">{sale.notes}</p>
                                                            ) : null}
                                                        </div>

                                                        <span
                                                            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-bold ${getStatusStyles(
                                                                sale.status
                                                            )}`}
                                                        >
                                                            {sale.status === 'cancelled' ? 'Anulada' : 'Completada'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}