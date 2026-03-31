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

export default function StockPage() {
    const [variants, setVariants] = useState<StockVariantOption[]>([])
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [movementType, setMovementType] = useState<StockMovementType>('entrada')
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

    async function handleSubmit() {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const qty = Number(quantity)

            if (!selectedVariant) {
                throw new Error('Selecciona un producto')
            }

            if (!qty || qty === 0) {
                throw new Error('Ingresa una cantidad válida')
            }

            if (movementType === 'entrada' && qty < 0) {
                throw new Error('La entrada debe ser positiva')
            }

            if (movementType === 'ajuste') {
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
            setSuccess('Movimiento registrado correctamente')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error registrando movimiento')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Stock</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando stock...
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
                            <select
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            >
                                <option value="">Selecciona una variante</option>
                                {variants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {getProductName(variant.products)} - {variant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedVariant && (
                            <div className="rounded-xl bg-neutral-50 p-3 text-sm">
                                <p><span className="font-medium">Unidad:</span> {selectedVariant.unit}</p>
                                <p><span className="font-medium">Stock actual:</span> {Number(selectedVariant.stock).toLocaleString('es-CL')}</p>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium">Tipo de movimiento</label>
                            <select
                                value={movementType}
                                onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            >
                                <option value="entrada">Entrada</option>
                                <option value="ajuste">Ajuste</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Cantidad
                            </label>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.001"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={movementType === 'ajuste' ? 'Ej: -2 o 3' : 'Ej: 10'}
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            />
                            <p className="mt-1 text-xs text-neutral-500">
                                {movementType === 'entrada'
                                    ? 'Usa un número positivo para ingresar mercadería.'
                                    : 'Usa positivo para subir stock o negativo para bajarlo.'}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Nota</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ej: compra de feria, corrección manual..."
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="w-full rounded-2xl bg-black px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar movimiento'}
                        </button>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold">Stock actual</h2>

                        <div className="space-y-3">
                            {variants.map((variant) => (
                                <div
                                    key={variant.id}
                                    className="rounded-xl border border-neutral-200 p-3"
                                >
                                    <p className="text-xs uppercase text-neutral-500">
                                        {getProductName(variant.products)}
                                    </p>
                                    <p className="font-semibold">{variant.name}</p>
                                    <p className="text-sm text-neutral-600">
                                        {Number(variant.stock).toLocaleString('es-CL')} {variant.unit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}