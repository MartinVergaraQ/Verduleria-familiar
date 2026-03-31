'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSalesHistory } from '@/src/features/sales/api/get-sales-history'
import type { SaleHistoryItem } from '@/src/features/sales/types/sale-history'
import { cancelSale } from '@/src/features/sales/api/cancel-sale'

export default function HistorialPage() {
    const [sales, setSales] = useState<SaleHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [processingSaleId, setProcessingSaleId] = useState('')
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'efectivo' | 'transferencia'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [paymentFilter, statusFilter])

    async function loadData() {
        try {
            setError('')
            const data = await getSalesHistory({
                paymentMethod: paymentFilter,
                status: statusFilter,
            })
            setSales(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando historial')
        } finally {
            setLoading(false)
        }
    }

    const filteredSales = sales.filter((sale) => {
        const term = search.trim().toLowerCase()
        if (!term) return true

        const noteMatch = sale.notes?.toLowerCase().includes(term) ?? false
        const itemMatch = (sale.sale_items ?? []).some((item) =>
            item.product_name_snapshot.toLowerCase().includes(term) ||
            item.variant_name_snapshot.toLowerCase().includes(term)
        )

        return noteMatch || itemMatch
    })

    async function handleCancelSale(saleId: string) {
        const confirmed = window.confirm('¿Seguro que quieres anular esta venta? Se devolverá el stock.')
        if (!confirmed) return

        try {
            setProcessingSaleId(saleId)
            setError('')
            await cancelSale(saleId)
            await loadData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error anulando venta')
        } finally {
            setProcessingSaleId('')
        }
    }

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Historial</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando historial...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && filteredSales.length === 0 && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Todavía no hay ventas registradas.
                </div>
            )}

            <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
                <div>
                    <label className="mb-2 block text-sm font-medium">Buscar</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ej: tomate, palta, nota..."
                        className="w-full rounded-xl border border-neutral-200 p-3"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Pago</label>
                        <select
                            value={paymentFilter}
                            onChange={(e) =>
                                setPaymentFilter(
                                    e.target.value as 'all' | 'efectivo' | 'transferencia'
                                )
                            }
                            className="w-full rounded-xl border border-neutral-200 p-3"
                        >
                            <option value="all">Todos</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Estado</label>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as 'all' | 'completed' | 'cancelled'
                                )
                            }
                            className="w-full rounded-xl border border-neutral-200 p-3"
                        >
                            <option value="all">Todos</option>
                            <option value="completed">Completadas</option>
                            <option value="cancelled">Anuladas</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredSales.map((sale) => (
                    <div key={sale.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-bold">
                                    ${Number(sale.total).toLocaleString('es-CL')}
                                </p>
                                <p className="text-sm text-neutral-600">
                                    {sale.payment_method} · {new Date(sale.sold_at).toLocaleString('es-CL')}
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${sale.status === 'cancelled'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}
                                    >
                                        {sale.status === 'cancelled' ? 'Anulada' : 'Completada'}
                                    </span>

                                    {sale.status !== 'cancelled' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelSale(sale.id)}
                                            disabled={processingSaleId === sale.id}
                                            className="text-sm font-semibold text-red-600 disabled:opacity-50"
                                        >
                                            {processingSaleId === sale.id ? 'Anulando...' : 'Anular venta'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {sale.notes && (
                            <p className="mt-2 text-sm text-neutral-500">
                                Nota: {sale.notes}
                            </p>
                        )}

                        <div className="mt-4 space-y-2">
                            {(sale.sale_items ?? []).map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-neutral-200 p-3"
                                >
                                    <p className="text-xs uppercase text-neutral-500">
                                        {item.product_name_snapshot}
                                    </p>
                                    <p className="font-semibold">{item.variant_name_snapshot}</p>
                                    <p className="text-sm text-neutral-600">
                                        {Number(item.quantity).toLocaleString('es-CL')} {item.unit_snapshot} × ${Number(item.unit_price).toLocaleString('es-CL')}
                                    </p>
                                    <p className="mt-1 text-right font-semibold">
                                        ${Number(item.subtotal).toLocaleString('es-CL')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}