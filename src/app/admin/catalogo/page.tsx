'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getProductVariants } from '@/src/features/products/api/get-product-variants'
import type { ProductVariantRow } from '@/src/features/products/types/product-variant'
import { ProductVariantEditCard } from '@/src/features/products/components/product-variant-edit-card'
import { CreateProductForm } from '@/src/features/products/components/create-product-form'
import { CreateProductVariantForm } from '@/src/features/products/components/create-product-variant-form'

type SummaryCardProps = {
    title: string
    value: string
    subtitle?: string
}

function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
    return (
        <div className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">
                {value}
            </p>
            {subtitle ? <p className="mt-2 text-xs text-neutral-500">{subtitle}</p> : null}
        </div>
    )
}

function getUnitLabel(unit: string | null | undefined) {
    if (!unit) return 'Sin unidad'
    return unit
}

export default function AdminCatalogoPage() {
    const [items, setItems] = useState<ProductVariantRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    async function loadData(showInitialLoader = false) {
        try {
            setError('')
            if (showInitialLoader) setLoading(true)
            else setRefreshing(true)

            const data = await getProductVariants()
            setItems(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando catálogo')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadData(true)
    }, [])

    const activeItemsCount = useMemo(() => {
        return items.filter((item) => item.is_active !== false).length
    }, [items])

    const flexiblePriceCount = useMemo(() => {
        return items.filter((item) => item.flexible_price).length
    }, [items])

    const unitsSummary = useMemo(() => {
        const units = new Set(items.map((item) => getUnitLabel(item.unit)))
        return units.size
    }, [items])

    return (
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 pb-10">
                <div className="space-y-5">
                    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126]">
                                Admin catálogo
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Crea productos, variantes y mantén ordenado el catálogo del negocio.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="w-fit rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                        >
                            Volver
                        </Link>
                    </header>

                    <section className="rounded-[32px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-6 text-white shadow-[0_18px_40px_-16px_rgba(47,90,46,0.5)]">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-white/80">Panel de catálogo</p>
                                <p className="mt-2 text-4xl font-extrabold tracking-tight">
                                    {items.length}
                                </p>
                                <p className="mt-2 text-sm text-white/75">
                                    variantes registradas en el sistema
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Activas</p>
                                    <p className="mt-1 text-2xl font-bold">{activeItemsCount}</p>
                                </div>

                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Precio flexible</p>
                                    <p className="mt-1 text-2xl font-bold">{flexiblePriceCount}</p>
                                </div>

                                <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Unidades</p>
                                    <p className="mt-1 text-2xl font-bold">{unitsSummary}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {refreshing && (
                        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 shadow-sm">
                            Actualizando catálogo...
                        </div>
                    )}

                    {loading && (
                        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                            Cargando catálogo...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {!loading && (
                        <>
                            <section className="grid gap-5 xl:grid-cols-2">
                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                            Crear producto
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Agrega una nueva familia o base de producto al catálogo.
                                        </p>
                                    </div>

                                    <CreateProductForm onCreated={() => loadData(false)} />
                                </div>

                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                            Crear variante
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Agrega una versión vendible con unidad, precio y configuración.
                                        </p>
                                    </div>

                                    <CreateProductVariantForm onCreated={() => loadData(false)} />
                                </div>
                            </section>

                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard
                                    title="Variantes totales"
                                    value={items.length.toLocaleString('es-CL')}
                                    subtitle="Total cargado en catálogo"
                                />
                                <SummaryCard
                                    title="Variantes activas"
                                    value={activeItemsCount.toLocaleString('es-CL')}
                                    subtitle="Disponibles para usar"
                                />
                                <SummaryCard
                                    title="Precio flexible"
                                    value={flexiblePriceCount.toLocaleString('es-CL')}
                                    subtitle="Se definen al vender"
                                />
                                <SummaryCard
                                    title="Tipos de unidad"
                                    value={unitsSummary.toLocaleString('es-CL')}
                                    subtitle="kg, unidad, atado, etc."
                                />
                            </section>

                            <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                                            Variantes del catálogo
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Edita precios, stock mínimo, estado y configuraciones de venta.
                                        </p>
                                    </div>

                                    <span className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-600">
                                        {items.length} registro{items.length === 1 ? '' : 's'}
                                    </span>
                                </div>

                                {items.length === 0 ? (
                                    <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                        <p className="font-semibold text-neutral-700">
                                            Todavía no hay variantes registradas.
                                        </p>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Crea un producto y luego su variante para empezar.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4"
                                            >
                                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                            {item.name ?? 'Producto'}
                                                        </p>
                                                        <h3 className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
                                                            {item.name ?? item.name ?? 'Variante'}
                                                        </h3>

                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                                                                Unidad: {getUnitLabel(item.unit)}
                                                            </span>

                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.is_active !== false
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                    : 'border-red-200 bg-red-50 text-red-700'
                                                                    }`}
                                                            >
                                                                {item.is_active !== false ? 'Activa' : 'Inactiva'}
                                                            </span>

                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.flexible_price
                                                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                                    : 'border-sky-200 bg-sky-50 text-sky-700'
                                                                    }`}
                                                            >
                                                                {item.flexible_price ? 'Precio flexible' : 'Precio fijo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <ProductVariantEditCard
                                                    item={item}
                                                    onUpdated={() => loadData(false)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}