'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getDailyClosure } from '@/src/features/closure/api/get-daily-closure'
import type {
    DailyClosureSale,
    DailyClosureStats,
} from '@/src/features/closure/types/daily-closure'
import { getTopProductsToday } from '@/src/features/closure/api/get-top-products-today'
import type { TopProductItem } from '@/src/features/closure/types/top-products'
import { exportDailyClosureCsv } from '@/src/features/closure/utils/export-daily-closure-csv'

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

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cierre del día</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando cierre...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => exportDailyClosureCsv(sales)}
                    disabled={sales.length === 0}
                    className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    Exportar CSV
                </button>
            </div>

            {!loading && stats && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Total vendido hoy</p>
                            <p className="mt-2 text-2xl font-bold">
                                ${stats.totalSales.toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Ventas completadas</p>
                            <p className="mt-2 text-2xl font-bold">
                                {stats.salesCount}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Efectivo</p>
                            <p className="mt-2 text-2xl font-bold">
                                ${stats.totalCash.toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Transferencia</p>
                            <p className="mt-2 text-2xl font-bold">
                                ${stats.totalTransfer.toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-neutral-500">Ventas anuladas hoy</p>
                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {stats.cancelledCount}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Productos más vendidos hoy</h2>

                        {topProducts.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                Todavía no hay productos vendidos hoy.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.map((item, index) => (
                                    <div
                                        key={`${item.product_name_snapshot}-${item.variant_name_snapshot}-${index}`}
                                        className="rounded-xl border border-neutral-200 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase text-neutral-500">
                                                    {item.product_name_snapshot}
                                                </p>
                                                <p className="font-semibold">{item.variant_name_snapshot}</p>
                                                <p className="text-sm text-neutral-600">
                                                    {Number(item.total_quantity).toLocaleString('es-CL')} {item.unit_snapshot} vendidos
                                                </p>
                                            </div>

                                            <p className="text-right font-bold">
                                                ${Number(item.total_amount).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Ventas del día</h2>

                        {sales.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                No hay ventas hoy.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {sales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="rounded-xl border border-neutral-200 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">
                                                    ${Number(sale.total).toLocaleString('es-CL')}
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    {sale.payment_method} · {new Date(sale.sold_at).toLocaleString('es-CL')}
                                                </p>
                                                {sale.notes && (
                                                    <p className="mt-1 text-sm text-neutral-500">
                                                        {sale.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${sale.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {sale.status === 'cancelled' ? 'Anulada' : 'Completada'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}