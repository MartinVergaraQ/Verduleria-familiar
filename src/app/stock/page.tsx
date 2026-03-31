'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getStockVariants } from '@/src/features/stock/api/get-stock-variants'
import { createStockMovement } from '@/src/features/stock/api/create-stock-movement'
import type {
    StockMovementType,
    StockVariantOption,
} from '@/src/features/stock/types/stock-movement'

function getProductName(product: StockVariantOption['products']): string {
    if (!product) return 'Sin producto'
    if (Array.isArray(product)) return product[0]?.name ?? 'Sin producto'
    return product.name
}

function getStockState(stock: number, minStock?: number | null) {
    const min = Number(minStock ?? 0)

    if (stock <= 0) {
        return {
            label: 'Sin stock',
            badgeClass: 'border-red-200 bg-red-50 text-red-700',
            cardClass: 'border-red-100 bg-red-50/50',
        }
    }

    if (min > 0 && stock <= min) {
        return {
            label: 'Stock bajo',
            badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
            cardClass: 'border-amber-100 bg-amber-50/50',
        }
    }

    return {
        label: 'Disponible',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        cardClass: 'border-emerald-100 bg-emerald-50/40',
    }
}

export default function StockPage() {
    const [variants, setVariants] = useState<StockVariantOption[]>([])
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [movementType, setMovementType] = useState<StockMovementType>('entrada')
    const [adjustMode, setAdjustMode] = useState<'sumar' | 'restar'>('sumar')
    const [quantity, setQuantity] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getStockVariants()
                setVariants(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando stock')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const selectedVariant = useMemo(
        () => variants.find((item) => item.id === selectedVariantId) ?? null,
        [variants, selectedVariantId]
    )

    const selectedState = useMemo(() => {
        if (!selectedVariant) return null
        return getStockState(
            Number(selectedVariant.stock),
            Number((selectedVariant as { min_stock?: number | string | null }).min_stock ?? 0)
        )
    }, [selectedVariant])

    async function handleSubmit() {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            let qty = Number(quantity)

            if (!selectedVariant) {
                throw new Error('Selecciona un producto')
            }

            if (!qty || qty === 0) {
                throw new Error('Ingresa una cantidad válida')
            }

            if (qty < 0) {
                throw new Error('Ingresa la cantidad sin signo negativo')
            }

            if (movementType === 'entrada') {
                if (qty < 0) {
                    throw new Error('La entrada debe ser positiva')
                }
            }

            if (movementType === 'ajuste') {
                qty = adjustMode === 'restar' ? -qty : qty

                const nextStock = Number(selectedVariant.stock) + qty
                if (nextStock < 0) {
                    throw new Error('El ajuste deja el stock negativo')
                }
            }

            await createStockMovement({
                productVariantId: selectedVariant.id,
                movementType,
                quantity: qty,
                note,
            })

            const updated = await getStockVariants()
            setVariants(updated)
            setSelectedVariantId('')
            setQuantity('')
            setNote('')
            setMovementType('entrada')
            setAdjustMode('sumar')
            setSuccess('Movimiento registrado correctamente')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error registrando movimiento')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-10">
                <div className="space-y-5">
                    <header className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126]">
                                Stock
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Registra entradas, ajustes y revisa el estado del inventario.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                        >
                            Volver
                        </Link>
                    </header>

                    <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
                        <div className="space-y-4">
                            <div className="rounded-[28px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-5 text-white shadow-[0_18px_40px_-16px_rgba(47,90,46,0.5)]">
                                <p className="text-sm font-medium text-white/80">Gestión de stock</p>
                                <p className="mt-1 text-3xl font-extrabold tracking-tight">
                                    {variants.length}
                                </p>
                                <p className="mt-2 text-sm text-white/75">
                                    variantes disponibles para controlar
                                </p>
                            </div>

                            {loading && (
                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    Cargando stock...
                                </div>
                            )}

                            {error && (
                                <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                                    {success}
                                </div>
                            )}

                            {!loading && (
                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Producto
                                            </label>
                                            <select
                                                value={selectedVariantId}
                                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                                className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                            >
                                                <option value="">Selecciona una variante</option>
                                                {variants.map((variant) => (
                                                    <option key={variant.id} value={variant.id}>
                                                        {getProductName(variant.products)} - {variant.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedVariant && selectedState && (
                                            <div
                                                className={`rounded-[24px] border p-4 ${selectedState.cardClass}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                            {getProductName(selectedVariant.products)}
                                                        </p>
                                                        <h3 className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
                                                            {selectedVariant.name}
                                                        </h3>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${selectedState.badgeClass}`}
                                                    >
                                                        {selectedState.label}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                            Unidad
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {selectedVariant.unit}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                            Stock actual
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {Number(selectedVariant.stock).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                            Stock mínimo
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {Number(
                                                                (selectedVariant as { min_stock?: number | string | null })
                                                                    .min_stock ?? 0
                                                            ).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Tipo de movimiento
                                            </label>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMovementType('entrada')
                                                        setAdjustMode('sumar')
                                                    }}
                                                    className={`rounded-2xl border p-4 text-sm font-bold transition ${movementType === 'entrada'
                                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                            : 'border-neutral-200 bg-white text-neutral-700'
                                                        }`}
                                                >
                                                    Entrada
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setMovementType('ajuste')}
                                                    className={`rounded-2xl border p-4 text-sm font-bold transition ${movementType === 'ajuste'
                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                            : 'border-neutral-200 bg-white text-neutral-700'
                                                        }`}
                                                >
                                                    Ajuste
                                                </button>
                                            </div>
                                        </div>

                                        {movementType === 'ajuste' && (
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    Tipo de ajuste
                                                </label>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAdjustMode('sumar')}
                                                        className={`rounded-2xl border p-4 text-sm font-bold transition ${adjustMode === 'sumar'
                                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                                : 'border-neutral-200 bg-white text-neutral-700'
                                                            }`}
                                                    >
                                                        Sumar stock
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAdjustMode('restar')}
                                                        className={`rounded-2xl border p-4 text-sm font-bold transition ${adjustMode === 'restar'
                                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                                : 'border-neutral-200 bg-white text-neutral-700'
                                                            }`}
                                                    >
                                                        Descontar stock
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Cantidad
                                            </label>
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                step="0.001"
                                                min="0"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder="Ej: 10"
                                                className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 text-lg font-semibold outline-none transition focus:border-emerald-500"
                                            />
                                            <p className="mt-1 text-xs text-neutral-500">
                                                {movementType === 'entrada'
                                                    ? 'Usa un número positivo para ingresar mercadería.'
                                                    : adjustMode === 'sumar'
                                                        ? 'Usa una cantidad positiva para aumentar stock.'
                                                        : 'Usa una cantidad positiva para descontar stock.'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Nota
                                            </label>
                                            <input
                                                type="text"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Ej: compra de feria, corrección manual..."
                                                className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="w-full rounded-2xl bg-[#234126] px-4 py-4 text-base font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar movimiento'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900">Stock actual</h2>
                                    <p className="text-sm text-neutral-500">
                                        Revisa rápido qué está bien, bajo o agotado.
                                    </p>
                                </div>

                                <span className="rounded-xl bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-600">
                                    {variants.length} ítems
                                </span>
                            </div>

                            {loading ? (
                                <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-neutral-500">
                                    Cargando listado...
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {variants.map((variant) => {
                                        const state = getStockState(
                                            Number(variant.stock),
                                            Number((variant as { min_stock?: number | string | null }).min_stock ?? 0)
                                        )

                                        return (
                                            <div
                                                key={variant.id}
                                                className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                            {getProductName(variant.products)}
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {variant.name}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${state.badgeClass}`}
                                                    >
                                                        {state.label}
                                                    </span>
                                                </div>

                                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-2xl bg-white p-3">
                                                        <p className="text-xs text-neutral-500">Stock</p>
                                                        <p className="mt-1 font-bold text-neutral-900">
                                                            {Number(variant.stock).toLocaleString('es-CL')} {variant.unit}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-3">
                                                        <p className="text-xs text-neutral-500">Mínimo</p>
                                                        <p className="mt-1 font-bold text-neutral-900">
                                                            {Number(
                                                                (variant as { min_stock?: number | string | null }).min_stock ?? 0
                                                            ).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-3">
                                                        <p className="text-xs text-neutral-500">Unidad</p>
                                                        <p className="mt-1 font-bold text-neutral-900">
                                                            {variant.unit}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}