'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getSaleVariants } from '@/src/features/sales/api/get-sale-variants'
import { createSale } from '@/src/features/sales/api/create-sale'
import type { CartItem, SaleVariantOption } from '@/src/features/sales/types/sales.item'

function getProductName(product: SaleVariantOption['products']): string {
    if (!product) return 'Sin producto'
    if (Array.isArray(product)) return product[0]?.name ?? 'Sin producto'
    return product.name
}

function getStockState(stock: number) {
    if (stock <= 0) {
        return {
            label: 'Sin stock',
            className: 'border-red-200 bg-red-50 text-red-700',
        }
    }

    if (stock <= 3) {
        return {
            label: 'Stock bajo',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
        }
    }

    return {
        label: 'Disponible',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
}

export default function VentasPage() {
    const [variants, setVariants] = useState<SaleVariantOption[]>([])
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [weightInput, setWeightInput] = useState('')
    const [manualPrice, setManualPrice] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')
    const [amountReceived, setAmountReceived] = useState('')
    const [notes, setNotes] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getSaleVariants()
                setVariants(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando variantes')
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

    const quantityKg = useMemo(() => {
        const grams = Number(weightInput)

        if (!grams || grams <= 0) return 0

        return grams / 1000
    }, [weightInput])

    const filteredVariants = useMemo(() => {
        const term = search.trim().toLowerCase()

        if (!term) return variants

        return variants.filter((item) => {
            const productName = getProductName(item.products).toLowerCase()
            const variantName = item.name.toLowerCase()
            const unit = item.unit.toLowerCase()

            return (
                productName.includes(term) ||
                variantName.includes(term) ||
                unit.includes(term)
            )
        })
    }, [variants, search])

    const frequentVariants = useMemo(() => {
        return variants.filter((item) => item.is_quick_access)
    }, [variants])

    const previewSubtotal = useMemo(() => {
        if (!selectedVariant || quantityKg <= 0) return 0

        const price = selectedVariant.flexible_price
            ? Number(manualPrice)
            : Number(selectedVariant.sale_price ?? 0)

        if (!price || price < 0) return 0

        return quantityKg * price
    }, [selectedVariant, quantityKg, manualPrice])

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.subtotal, 0)
    }, [cart])

    const amountReceivedNumber = useMemo(() => {
        const value = Number(amountReceived)
        return Number.isFinite(value) ? value : 0
    }, [amountReceived])

    const change = useMemo(() => {
        if (paymentMethod !== 'efectivo') return 0
        return Math.max(0, amountReceivedNumber - total)
    }, [paymentMethod, amountReceivedNumber, total])

    const missingAmount = useMemo(() => {
        if (paymentMethod !== 'efectivo') return 0
        return Math.max(0, total - amountReceivedNumber)
    }, [paymentMethod, amountReceivedNumber, total])

    const stockState = useMemo(() => {
        return getStockState(Number(selectedVariant?.stock ?? 0))
    }, [selectedVariant])

    function resetProductForm() {
        setSelectedVariantId('')
        setWeightInput('')
        setManualPrice('')
        setSearch('')
    }

    function handleSelectFrequent(variantId: string) {
        setSelectedVariantId(variantId)
        setSearch('')
        setError('')
        setSuccess('')
    }

    function handleAddItem() {
        setError('')
        setSuccess('')

        if (!selectedVariant) {
            setError('Selecciona un producto')
            return
        }

        const qty = quantityKg
        if (!qty || qty <= 0) {
            setError('Ingresa un peso válido')
            return
        }

        const unitPrice = selectedVariant.flexible_price
            ? Number(manualPrice)
            : Number(selectedVariant.sale_price ?? 0)

        if (!unitPrice || unitPrice < 0) {
            setError('Ingresa un precio válido')
            return
        }

        if (qty > Number(selectedVariant.stock)) {
            setError('No hay suficiente stock disponible')
            return
        }

        const productName = getProductName(selectedVariant.products)

        const existingIndex = cart.findIndex(
            (item) =>
                item.product_variant_id === selectedVariant.id &&
                item.unit_price === unitPrice
        )

        if (existingIndex >= 0) {
            const currentItem = cart[existingIndex]
            const newQty = currentItem.quantity + qty

            if (newQty > Number(selectedVariant.stock)) {
                setError('La suma supera el stock disponible')
                return
            }

            const updatedCart = [...cart]
            updatedCart[existingIndex] = {
                ...currentItem,
                quantity: newQty,
                subtotal: newQty * currentItem.unit_price,
            }

            setCart(updatedCart)
            resetProductForm()
            return
        }

        const item: CartItem = {
            product_variant_id: selectedVariant.id,
            product_name_snapshot: productName,
            variant_name_snapshot: selectedVariant.name,
            unit_snapshot: selectedVariant.unit,
            quantity: qty,
            unit_price: unitPrice,
            subtotal: qty * unitPrice,
        }

        setCart((prev) => [...prev, item])
        resetProductForm()
    }

    function handleRemoveItem(index: number) {
        setCart((prev) => prev.filter((_, i) => i !== index))
    }

    function handleQuickCash(value: number) {
        setAmountReceived(String(value))
    }

    async function handleSaveSale() {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            if (cart.length === 0) {
                throw new Error('Agrega al menos un producto')
            }

            if (paymentMethod === 'efectivo' && amountReceivedNumber < total) {
                throw new Error('El pago recibido es menor al total')
            }

            await createSale(cart, paymentMethod, notes)
            setCart([])
            setNotes('')
            setPaymentMethod('efectivo')
            setAmountReceived('')
            setSuccess('Venta guardada correctamente')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error guardando venta')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-lime-50 via-[#f8f6f1] to-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-28">
                <div className="space-y-5">
                    <header className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#234126]">
                                Nueva venta
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Pesa, agrega productos y cobra sin sacar la calculadora.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                        >
                            Volver
                        </Link>
                    </header>

                    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                            <div className="rounded-[28px] bg-gradient-to-br from-[#2f5a2e] via-[#2f5a2e] to-[#487445] p-5 text-white shadow-[0_18px_40px_-16px_rgba(47,90,46,0.5)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-white/80">Total acumulado</p>
                                        <p className="mt-1 text-4xl font-extrabold tracking-tight">
                                            ${total.toLocaleString('es-CL')}
                                        </p>
                                        <p className="mt-2 text-sm text-white/75">
                                            {cart.length} ítem{cart.length === 1 ? '' : 's'} en la venta
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur-sm">
                                        Caja activa
                                    </div>
                                </div>
                            </div>

                            {loading && (
                                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                    Cargando productos...
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
                                        {frequentVariants.length > 0 && (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                                                        Frecuentes
                                                    </h2>
                                                    <span className="text-xs text-neutral-400">Acceso rápido</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {frequentVariants.map((variant) => (
                                                        <button
                                                            key={variant.id}
                                                            type="button"
                                                            onClick={() => handleSelectFrequent(variant.id)}
                                                            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${selectedVariantId === variant.id
                                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                                                                : 'border-[#dce3bf] bg-[#eef3d3] text-[#596335]'
                                                                }`}
                                                        >
                                                            {variant.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Buscar producto
                                            </label>
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Ej: tomate, palta, cebolla..."
                                                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 outline-none transition focus:border-emerald-500 focus:bg-white"
                                            />
                                        </div>

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
                                                {filteredVariants.map((variant) => (
                                                    <option key={variant.id} value={variant.id}>
                                                        {getProductName(variant.products)} - {variant.name} · Stock:{' '}
                                                        {Number(variant.stock).toLocaleString('es-CL')}
                                                    </option>
                                                ))}
                                            </select>

                                            {search.trim() && filteredVariants.length === 0 && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    No se encontraron productos para esa búsqueda.
                                                </p>
                                            )}
                                        </div>

                                        {selectedVariant && (
                                            <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
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
                                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${stockState.className}`}
                                                    >
                                                        {stockState.label}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                                                            Stock
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {Number(selectedVariant.stock).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                            Precio
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {selectedVariant.flexible_price
                                                                ? 'Manual'
                                                                : `$${Number(selectedVariant.sale_price ?? 0).toLocaleString('es-CL')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                Peso en gramos
                                            </label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                value={weightInput}
                                                onChange={(e) => setWeightInput(e.target.value)}
                                                placeholder="Ej: 1010"
                                                className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 text-lg font-semibold outline-none transition focus:border-emerald-500"
                                            />
                                            <p className="mt-1 text-xs text-neutral-500">
                                                Ejemplo: 1010 = 1.010 kg
                                            </p>
                                        </div>

                                        {selectedVariant?.flexible_price && (
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    Precio manual
                                                </label>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min="0"
                                                    value={manualPrice}
                                                    onChange={(e) => setManualPrice(e.target.value)}
                                                    placeholder="Ej: 700"
                                                    className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                                />
                                            </div>
                                        )}

                                        <div className="rounded-[24px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                                            <p className="text-sm font-medium text-emerald-800">Subtotal</p>
                                            <p className="mt-1 text-3xl font-extrabold tracking-tight text-emerald-700">
                                                ${previewSubtotal.toLocaleString('es-CL')}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="w-full rounded-2xl bg-[#06b434] px-4 py-4 text-base font-bold text-white shadow-sm transition hover:brightness-95"
                                        >
                                            Agregar a la venta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-neutral-900">Detalle</h2>
                                    <span className="rounded-xl bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-600">
                                        {cart.length} ítem{cart.length === 1 ? '' : 's'}
                                    </span>
                                </div>

                                {cart.length === 0 ? (
                                    <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                                        <p className="font-semibold text-neutral-700">
                                            No hay productos agregados todavía.
                                        </p>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Agrega productos para armar la venta.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item, index) => (
                                            <div
                                                key={`${item.product_variant_id}-${index}`}
                                                className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                                            {item.product_name_snapshot}
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-neutral-900">
                                                            {item.variant_name_snapshot}
                                                        </p>
                                                        <p className="mt-1 text-sm text-neutral-600">
                                                            {item.quantity.toFixed(3)} {item.unit_snapshot} × $
                                                            {item.unit_price.toLocaleString('es-CL')}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-sm font-semibold text-red-600"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>

                                                <p className="mt-3 text-right text-xl font-extrabold text-neutral-900">
                                                    ${item.subtotal.toLocaleString('es-CL')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                            Método de pago
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value as 'efectivo' | 'transferencia')
                                            }
                                            className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                    </div>

                                    {paymentMethod === 'efectivo' && (
                                        <div className="space-y-4 rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                                                    Pago recibido
                                                </label>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min="0"
                                                    value={amountReceived}
                                                    onChange={(e) => setAmountReceived(e.target.value)}
                                                    placeholder="Ej: 20000"
                                                    className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {[2000, 5000, 10000, 20000].map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => handleQuickCash(value)}
                                                        className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                                                    >
                                                        ${value.toLocaleString('es-CL')}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl bg-white p-4 shadow-sm">
                                                    <p className="text-sm text-neutral-500">Pago recibido</p>
                                                    <p className="mt-1 text-xl font-extrabold text-neutral-900">
                                                        ${amountReceivedNumber.toLocaleString('es-CL')}
                                                    </p>
                                                </div>

                                                <div
                                                    className={`rounded-2xl p-4 shadow-sm ${missingAmount > 0
                                                        ? 'bg-amber-50 ring-1 ring-amber-100'
                                                        : 'bg-emerald-50 ring-1 ring-emerald-100'
                                                        }`}
                                                >
                                                    <p
                                                        className={`text-sm ${missingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'
                                                            }`}
                                                    >
                                                        {missingAmount > 0 ? 'Faltan' : 'Vuelto'}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-xl font-extrabold ${missingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'
                                                            }`}
                                                    >
                                                        $
                                                        {(missingAmount > 0 ? missingAmount : change).toLocaleString(
                                                            'es-CL'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                            Nota
                                        </label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Opcional"
                                            className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 outline-none transition focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="rounded-[24px] bg-neutral-100 p-5">
                                        <p className="text-sm text-neutral-500">Total</p>
                                        <p className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
                                            ${total.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/90 p-4 backdrop-blur">
                        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
                            <div className="hidden flex-1 rounded-2xl bg-neutral-100 px-4 py-3 sm:block">
                                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Total actual
                                </p>
                                <p className="text-2xl font-extrabold text-neutral-900">
                                    ${total.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveSale}
                                disabled={
                                    saving ||
                                    cart.length === 0 ||
                                    (paymentMethod === 'efectivo' && amountReceivedNumber < total)
                                }
                                className="w-full rounded-2xl bg-[#234126] px-5 py-4 text-base font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {saving ? 'Guardando...' : 'Guardar venta'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}