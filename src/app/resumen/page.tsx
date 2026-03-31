'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
    product:
        | { name: string }
        | { name: string }[]
        | null
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

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Resumen</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando resumen...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading && stats && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Ventas hoy</p>
                            <p className="mt-2 text-2xl font-bold">
                                ${stats.todaySalesTotal.toLocaleString('es-CL')}
                            </p>
                            <p className="mt-1 text-sm text-neutral-600">
                                {stats.todaySalesCount} ventas
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm text-neutral-500">Ventas semana</p>
                            <p className="mt-2 text-2xl font-bold">
                                ${stats.weekSalesTotal.toLocaleString('es-CL')}
                            </p>
                            <p className="mt-1 text-sm text-neutral-600">
                                {stats.weekSalesCount} ventas
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Stock bajo</h2>

                        {lowStock.length === 0 ? (
                            <p className="text-sm text-neutral-500">No hay productos con stock bajo.</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStock.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border border-orange-200 bg-orange-50 p-3"
                                    >
                                        <p className="text-xs uppercase text-neutral-500">
                                            {getProductName(item.products)}
                                        </p>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-neutral-700">
                                            Stock: {Number(item.stock).toLocaleString('es-CL')} {item.unit}
                                        </p>
                                        <p className="text-sm text-neutral-700">
                                            Mínimo: {Number(item.min_stock).toLocaleString('es-CL')} {item.unit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Últimas ventas</h2>

                        {recentSales.length === 0 ? (
                            <p className="text-sm text-neutral-500">Todavía no hay ventas.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="rounded-xl border border-neutral-200 p-3">
                                        <p className="font-semibold">
                                            ${Number(sale.total).toLocaleString('es-CL')}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {sale.payment_method} · {new Date(sale.sold_at).toLocaleString('es-CL')}
                                        </p>
                                        {sale.notes && (
                                            <p className="mt-1 text-sm text-neutral-500">{sale.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Últimos movimientos de stock</h2>

                        {recentMovements.length === 0 ? (
                            <p className="text-sm text-neutral-500">Todavía no hay movimientos.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentMovements.map((movement) => (
                                    <div key={movement.id} className="rounded-xl border border-neutral-200 p-3">
                                        <p className="font-semibold">{getMovementProductLabel(movement)}</p>
                                        <p className="text-sm text-neutral-600">
                                            {movement.movement_type} · {Number(movement.quantity).toLocaleString('es-CL')}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {new Date(movement.created_at).toLocaleString('es-CL')}
                                        </p>
                                        {movement.note && (
                                            <p className="mt-1 text-sm text-neutral-500">{movement.note}</p>
                                        )}
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