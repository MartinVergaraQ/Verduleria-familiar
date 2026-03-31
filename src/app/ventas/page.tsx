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

export default function VentasPage() {
    const [variants, setVariants] = useState<SaleVariantOption[]>([])
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [quantity, setQuantity] = useState('')
    const [manualPrice, setManualPrice] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')
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
        const qty = Number(quantity)
        if (!selectedVariant || !qty || qty <= 0) return 0

        const price = selectedVariant.flexible_price
            ? Number(manualPrice)
            : Number(selectedVariant.sale_price ?? 0)

        if (!price || price < 0) return 0

        return qty * price
    }, [selectedVariant, quantity, manualPrice])

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.subtotal, 0)
    }, [cart])

    function resetProductForm() {
        setSelectedVariantId('')
        setQuantity('')
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

        const qty = Number(quantity)
        if (!qty || qty <= 0) {
            setError('Ingresa una cantidad válida')
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

    async function handleSaveSale() {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            await createSale(cart, paymentMethod, notes)
            setCart([])
            setNotes('')
            setPaymentMethod('efectivo')
            setSuccess('Venta guardada correctamente')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error guardando venta')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Nueva venta</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando productos...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
                    {success}
                </div>
            )}

            {!loading && (
                <>
                    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Producto</label>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-neutral-700">Frecuentes</h2>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {frequentVariants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() => handleSelectFrequent(variant.id)}
                                            className={`rounded-xl border px-3 py-3 text-left text-sm font-medium ${selectedVariantId === variant.id
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-neutral-200 bg-white'
                                                }`}
                                        >
                                            <span className="block">{variant.name}</span>
                                            <span className="mt-1 block text-xs text-neutral-500">
                                                Stock: {Number(variant.stock).toLocaleString('es-CL')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Buscar producto</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Ej: tomate, palta, cebolla..."
                                    className="w-full rounded-xl border border-neutral-200 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Producto</label>
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-3"
                                >
                                    <option value="">Selecciona una variante</option>
                                    {filteredVariants.map((variant) => (
                                        <option key={variant.id} value={variant.id}>
                                            {getProductName(variant.products)} - {variant.name} · Stock: {Number(variant.stock).toLocaleString('es-CL')}
                                        </option>
                                    ))}
                                </select>

                                {search.trim() && filteredVariants.length === 0 && (
                                    <p className="mt-2 text-sm text-red-600">
                                        No se encontraron productos para esa búsqueda.
                                    </p>
                                )}
                            </div>
                        </div>

                        {selectedVariant && (
                            <div className="rounded-xl bg-neutral-50 p-3 text-sm">
                                <p><span className="font-medium">Unidad:</span> {selectedVariant.unit}</p>
                                <p><span className="font-medium">Stock:</span> {Number(selectedVariant.stock).toLocaleString('es-CL')}</p>
                                <p>
                                    <span className="font-medium">Precio:</span>{' '}
                                    {selectedVariant.flexible_price
                                        ? 'Flexible'
                                        : `$${Number(selectedVariant.sale_price ?? 0).toLocaleString('es-CL')}`}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium">Cantidad</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.001"
                                min="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Ej: 1.5"
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            />
                        </div>

                        {selectedVariant?.flexible_price && (
                            <div>
                                <label className="mb-2 block text-sm font-medium">Precio manual</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    value={manualPrice}
                                    onChange={(e) => setManualPrice(e.target.value)}
                                    placeholder="Ej: 700"
                                    className="w-full rounded-xl border border-neutral-200 p-3"
                                />
                            </div>
                        )}

                        <div className="rounded-xl bg-green-50 p-3">
                            <p className="text-sm text-green-800">Subtotal</p>
                            <p className="text-xl font-bold text-green-700">
                                ${previewSubtotal.toLocaleString('es-CL')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full rounded-2xl bg-green-600 px-4 py-4 text-lg font-semibold text-white"
                        >
                            Agregar a la venta
                        </button>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold">Detalle</h2>

                        {cart.length === 0 ? (
                            <p className="text-sm text-neutral-500">No hay productos agregados todavía.</p>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item, index) => (
                                    <div key={`${item.product_variant_id}-${index}`} className="rounded-xl border border-neutral-200 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase text-neutral-500">{item.product_name_snapshot}</p>
                                                <p className="font-semibold">{item.variant_name_snapshot}</p>
                                                <p className="text-sm text-neutral-600">
                                                    {item.quantity} {item.unit_snapshot} × ${item.unit_price.toLocaleString('es-CL')}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-sm font-medium text-red-600"
                                            >
                                                Quitar
                                            </button>
                                        </div>

                                        <p className="mt-2 text-right text-lg font-bold">
                                            ${item.subtotal.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium">Método de pago</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value as 'efectivo' | 'transferencia'
                                    )
                                }
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Nota</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opcional"
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            />
                        </div>

                        <div className="rounded-xl bg-neutral-100 p-4">
                            <p className="text-sm text-neutral-500">Total</p>
                            <p className="text-2xl font-bold">${total.toLocaleString('es-CL')}</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleSaveSale}
                            disabled={saving || cart.length === 0}
                            className="w-full rounded-2xl bg-black px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar venta'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}