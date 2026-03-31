'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getSalesHistory } from '@/src/features/sales/api/get-sales-history'
import type { SaleHistoryItem } from '@/src/features/sales/types/sale-history'
import { cancelSale } from '@/src/features/sales/api/cancel-sale'

function formatMoney(value: number | string) {
    return `$${Math.round(Number(value)).toLocaleString('es-CL')}`
}

function getStatusClasses(status: 'completed' | 'cancelled') {
    return status === 'cancelled'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function getPaymentClasses(paymentMethod: 'efectivo' | 'transferencia') {
    return paymentMethod === 'efectivo'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-sky-200 bg-sky-50 text-sky-700'
}

type FilterButtonProps = {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${active
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
        >
            {children}
        </button>
    )
}

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

    const filteredSales = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return sales

        return sales.filter((sale) => {
            const noteMatch = sale.notes?.toLowerCase().includes(term) ?? false
            const paymentMatch = sale.payment_method.toLowerCase().includes(term)
            const statusMatch = sale.status.toLowerCase().includes(term)
            const totalMatch = String(sale.total).includes(term)

            const itemMatch = (sale.sale_items ?? []).some((item) =>
                item.product_name_snapshot.toLowerCase().includes(term) ||
                item.variant_name_snapshot.toLowerCase().includes(term)
            )

            return noteMatch || paymentMatch || statusMatch || totalMatch || itemMatch
        })
    }, [sales, search])

    const totalCompleted = useMemo(() => {
        return filteredSales
            .filter((sale) => sale.status === 'completed')
            .reduce((acc, sale) => acc + Number(sale.total), 0)
    }, [filteredSales])

    const completedCount = useMemo(() => {
        return filteredSales.filter((sale) => sale.status === 'completed').length
    }, [filteredSales])

    const cancelledCount = useMemo(() => {
        return filteredSales.filter((sale) => sale.status === 'cancelled').length
    }, [filteredSales])

    async function handleCancelSale(saleId: string) {
        const confirmed = window.confirm(
            '¿Seguro que quieres anular esta venta? Se devolverá el stock.'
        )
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
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-10">
                <div className="space-y-5">
                    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126]">
                                Historial
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Revisa ventas registradas, busca productos y anula si hace falta.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="w-fit rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                        >
                            Volver
                        </Link>
                    </header>

                    <section className="rounded-[28px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-5 text-white shadow-[0_18px_40px_-16px_rgba(47,90,46,0.5)]">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-medium text-white/80">Resumen del historial</p>
                                <p className="mt-2 text-4xl font-extrabold tracking-tight">
                                    {formatMoney(totalCompleted)}
                                </p>
                                <p className="mt-2 text-sm text-white/75">
                                    total vendido en los registros filtrados
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Ventas</p>
                                    <p className="mt-1 text-2xl font-bold">{filteredSales.length}</p>
                                </div>

                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Completadas</p>
                                    <p className="mt-1 text-2xl font-bold">{completedCount}</p>
                                </div>

                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Anuladas</p>
                                    <p className="mt-1 text-2xl font-bold">{cancelledCount}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {loading && (
                        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                            Cargando historial...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                    Buscar
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Ej: tomate, palta, nota..."
                                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 outline-none transition focus:border-emerald-500 focus:bg-white"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-neutral-700">Pago</p>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterButton
                                            active={paymentFilter === 'all'}
                                            onClick={() => setPaymentFilter('all')}
                                        >
                                            Todos
                                        </FilterButton>
                                        <FilterButton
                                            active={paymentFilter === 'efectivo'}
                                            onClick={() => setPaymentFilter('efectivo')}
                                        >
                                            Efectivo
                                        </FilterButton>
                                        <FilterButton
                                            active={paymentFilter === 'transferencia'}
                                            onClick={() => setPaymentFilter('transferencia')}
                                        >
                                            Transferencia
                                        </FilterButton>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-semibold text-neutral-700">Estado</p>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterButton
                                            active={statusFilter === 'all'}
                                            onClick={() => setStatusFilter('all')}
                                        >
                                            Todos
                                        </FilterButton>
                                        <FilterButton
                                            active={statusFilter === 'completed'}
                                            onClick={() => setStatusFilter('completed')}
                                        >
                                            Completadas
                                        </FilterButton>
                                        <FilterButton
                                            active={statusFilter === 'cancelled'}
                                            onClick={() => setStatusFilter('cancelled')}
                                        >
                                            Anuladas
                                        </FilterButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {!loading && !error && filteredSales.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-6 text-center shadow-sm">
                            <p className="font-semibold text-neutral-700">
                                Todavía no hay ventas registradas.
                            </p>
                        </div>
                    )}

                    <section className="space-y-4">
                        {filteredSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-3xl font-extrabold tracking-tight text-neutral-900">
                                            {formatMoney(sale.total)}
                                        </p>
                                        <p className="mt-1 text-sm text-neutral-600">
                                            {new Date(sale.sold_at).toLocaleString('es-CL')}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                    sale.status
                                                )}`}
                                            >
                                                {sale.status === 'cancelled' ? 'Anulada' : 'Completada'}
                                            </span>

                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${getPaymentClasses(
                                                    sale.payment_method
                                                )}`}
                                            >
                                                {sale.payment_method === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                                            </span>
                                        </div>
                                    </div>

                                    {sale.status !== 'cancelled' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelSale(sale.id)}
                                            disabled={processingSaleId === sale.id}
                                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                        >
                                            {processingSaleId === sale.id ? 'Anulando...' : 'Anular venta'}
                                        </button>
                                    )}
                                </div>

                                {sale.notes && (
                                    <div className="mt-4 rounded-2xl bg-neutral-50 p-3">
                                        <p className="text-sm text-neutral-600">
                                            <span className="font-semibold text-neutral-800">Nota:</span> {sale.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5 space-y-3">
                                    {(sale.sale_items ?? []).map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                        {item.product_name_snapshot}
                                                    </p>
                                                    <p className="mt-1 text-lg font-bold text-neutral-900">
                                                        {item.variant_name_snapshot}
                                                    </p>
                                                    <p className="mt-1 text-sm text-neutral-600">
                                                        {Number(item.quantity).toLocaleString('es-CL')} {item.unit_snapshot} ×{' '}
                                                        {formatMoney(item.unit_price)}
                                                    </p>
                                                </div>

                                                <p className="text-xl font-extrabold text-neutral-900">
                                                    {formatMoney(item.subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </main>
    )
}