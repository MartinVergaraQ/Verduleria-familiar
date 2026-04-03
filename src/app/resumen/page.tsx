'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getDashboardStats } from '@/src/features/dashboard/api/get-dashboard-stats'
import { getLowStockItems } from '@/src/features/dashboard/api/get-low-stock-items'
import { getRecentSales } from '@/src/features/dashboard/api/get-recent-sales'
import { getRecentStockMovements } from '@/src/features/dashboard/api/get-recent-stock-movements'
import type {
    DashboardStats,
    LowStockItem,
    RecentSale,
    RecentStockMovement,
} from '@/src/features/dashboard/types/dashboard'

function getProductName(
    product: { name: string } | { name: string }[] | null
): string {
    if (!product) return 'Sin producto'
    if (Array.isArray(product)) return product[0]?.name ?? 'Sin producto'
    return product.name
}

function getMovementProductLabel(movement: RecentStockMovement): string {
    const variantData = movement.product_variants

    if (!variantData) return 'Sin variante'

    const variant = Array.isArray(variantData) ? variantData[0] : variantData
    if (!variant) return 'Sin variante'

    return `${getProductName(variant.products)} - ${variant.name}`
}

function formatMoney(value: number | string) {
    return `$${Math.round(Number(value)).toLocaleString('es-CL')}`
}

function getLowStockState(item: LowStockItem) {
    const stock = Number(item.stock)
    const min = Number(item.min_stock)

    if (stock <= 0) {
        return 'border-red-200 bg-red-50 text-red-700'
    }

    if (stock <= min) {
        return 'border-amber-200 bg-amber-50 text-amber-700'
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function getMovementBadge(movementType: string) {
    if (movementType === 'entrada') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }

    if (movementType === 'ajuste') {
        return 'border-amber-200 bg-amber-50 text-amber-700'
    }

    if (movementType === 'venta') {
        return 'border-sky-200 bg-sky-50 text-sky-700'
    }

    return 'border-neutral-200 bg-neutral-100 text-neutral-700'
}

type SummaryCardProps = {
    title: string
    value: string
    subtitle?: string
    tone?: 'neutral' | 'green'
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
            : 'border-neutral-200 bg-white'

    return (
        <div className={`rounded-[24px] border p-5 shadow-sm ${toneClass}`}>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">
                {value}
            </p>
            {subtitle ? <p className="mt-2 text-sm text-neutral-500">{subtitle}</p> : null}
        </div>
    )
}

export default function ResumenPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [lowStock, setLowStock] = useState<LowStockItem[]>([])
    const [recentSales, setRecentSales] = useState<RecentSale[]>([])
    const [recentMovements, setRecentMovements] = useState<RecentStockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [statsData, lowStockData, salesData, movementsData] =
                    await Promise.all([
                        getDashboardStats(),
                        getLowStockItems(),
                        getRecentSales(),
                        getRecentStockMovements(),
                    ])

                setStats(statsData)
                setLowStock(lowStockData)
                setRecentSales(salesData)
                setRecentMovements(movementsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando resumen')
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const totalLowStock = useMemo(() => lowStock.length, [lowStock])

    return (
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 pb-10">
                <div className="space-y-6">
                    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126] md:text-4xl">
                                Resumen
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500 md:text-base">
                                Mira ventas, alertas de stock y actividad reciente del negocio.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="w-fit rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm"
                        >
                            Volver
                        </Link>
                    </header>

                    {loading && (
                        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                            Cargando resumen...
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
                                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                                    <div>
                                        <p className="text-sm font-medium text-white/80">
                                            Resumen general
                                        </p>
                                        <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                                            {formatMoney(stats.todaySalesTotal)}
                                        </p>
                                        <p className="mt-2 text-sm text-white/75">
                                            vendido hoy en {stats.todaySalesCount} venta
                                            {stats.todaySalesCount === 1 ? '' : 's'}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                            <p className="text-xs uppercase tracking-wide text-white/70">
                                                Semana
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">
                                                {formatMoney(stats.weekSalesTotal)}
                                            </p>
                                            <p className="mt-1 text-xs text-white/70">
                                                {stats.weekSalesCount} ventas
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                            <p className="text-xs uppercase tracking-wide text-white/70">
                                                Alertas stock
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">{totalLowStock}</p>
                                            <p className="mt-1 text-xs text-white/70">
                                                productos bajo mínimo
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard
                                    title="Ventas hoy"
                                    value={formatMoney(stats.todaySalesTotal)}
                                    subtitle={`${stats.todaySalesCount} ventas`}
                                    tone="green"
                                />

                                <SummaryCard
                                    title="Ventas semana"
                                    value={formatMoney(stats.weekSalesTotal)}
                                    subtitle={`${stats.weekSalesCount} ventas`}
                                />

                                <SummaryCard
                                    title="Stock bajo"
                                    value={totalLowStock.toLocaleString('es-CL')}
                                    subtitle="Productos para revisar"
                                />

                                <SummaryCard
                                    title="Movimientos recientes"
                                    value={recentMovements.length.toLocaleString('es-CL')}
                                    subtitle="Actividad visible en stock"
                                />
                            </section>

                            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                                <div className="space-y-5">
                                    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                                Stock bajo
                                            </h2>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Productos que están cerca o debajo del mínimo.
                                            </p>
                                        </div>

                                        {lowStock.length === 0 ? (
                                            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                                <p className="font-semibold text-neutral-700">
                                                    No hay productos con stock bajo.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {lowStock.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                                    {getProductName(item.products)}
                                                                </p>
                                                                <p className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
                                                                    {item.name}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${getLowStockState(
                                                                    item
                                                                )}`}
                                                            >
                                                                {Number(item.stock) <= 0 ? 'Sin stock' : 'Bajo mínimo'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-2xl bg-white p-3">
                                                                <p className="text-xs text-neutral-500">Stock actual</p>
                                                                <p className="mt-1 font-bold text-neutral-900">
                                                                    {Number(item.stock).toLocaleString('es-CL')} {item.unit}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl bg-white p-3">
                                                                <p className="text-xs text-neutral-500">Stock mínimo</p>
                                                                <p className="mt-1 font-bold text-neutral-900">
                                                                    {Number(item.min_stock).toLocaleString('es-CL')} {item.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                                Últimos movimientos de stock
                                            </h2>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Entradas, ajustes y ventas recientes.
                                            </p>
                                        </div>

                                        {recentMovements.length === 0 ? (
                                            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                                <p className="font-semibold text-neutral-700">
                                                    Todavía no hay movimientos.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {recentMovements.map((movement) => (
                                                    <div
                                                        key={movement.id}
                                                        className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4"
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <p className="text-lg font-bold text-neutral-900">
                                                                    {getMovementProductLabel(movement)}
                                                                </p>
                                                                <p className="mt-1 text-sm text-neutral-600">
                                                                    {new Date(movement.created_at).toLocaleString('es-CL')}
                                                                </p>
                                                                {movement.note ? (
                                                                    <p className="mt-2 text-sm text-neutral-500">
                                                                        {movement.note}
                                                                    </p>
                                                                ) : null}
                                                            </div>

                                                            <div className="sm:text-right">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getMovementBadge(
                                                                        movement.movement_type
                                                                    )}`}
                                                                >
                                                                    {movement.movement_type}
                                                                </span>
                                                                <p className="mt-2 text-xl font-extrabold text-neutral-900">
                                                                    {Number(movement.quantity).toLocaleString('es-CL')}
                                                                </p>
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
                                                Últimas ventas
                                            </h2>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Ventas recientes registradas en el sistema.
                                            </p>
                                        </div>

                                        <span className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-600">
                                            {recentSales.length} registro{recentSales.length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {recentSales.length === 0 ? (
                                        <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                            <p className="font-semibold text-neutral-700">
                                                Todavía no hay ventas.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentSales.map((sale) => (
                                                <div
                                                    key={sale.id}
                                                    className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5"
                                                >
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <p className="text-4xl font-extrabold tracking-tight text-neutral-900">
                                                                {formatMoney(sale.total)}
                                                            </p>
                                                            <p className="mt-2 text-base text-neutral-600">
                                                                {sale.payment_method} ·{' '}
                                                                {new Date(sale.sold_at).toLocaleString('es-CL')}
                                                            </p>
                                                            {sale.notes ? (
                                                                <p className="mt-2 text-sm text-neutral-500">
                                                                    {sale.notes}
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                                                            Reciente
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