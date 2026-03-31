'use client'

import { useState } from 'react'
import type { ProductVariantRow } from '@/src/features/products/types/product-variant'
import { updateProductVariant } from '@/src/features/products/api/update-product-variant'

type Props = {
    item: ProductVariantRow
    onUpdated: () => Promise<void> | void
}

function getProductName(product: ProductVariantRow['products']): string {
    if (!product) return 'Sin producto'
    if (Array.isArray(product)) return product[0]?.name ?? 'Sin producto'
    return product.name
}

export function ProductVariantEditCard({ item, onUpdated }: Props) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        sale_price: item.sale_price !== null ? String(item.sale_price) : '',
        min_stock: String(item.min_stock),
        is_active: item.is_active,
        is_quick_access: item.is_quick_access,
    })

    async function handleSave() {
        setSaving(true)
        setError('')

        try {
            const minStock = Number(form.min_stock)
            if (Number.isNaN(minStock) || minStock < 0) {
                throw new Error('El stock mínimo debe ser 0 o más')
            }

            let salePrice: number | null = null

            if (!item.flexible_price) {
                const parsedPrice = Number(form.sale_price)
                if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
                    throw new Error('El precio debe ser 0 o más')
                }
                salePrice = parsedPrice
            }

            await updateProductVariant({
                id: item.id,
                sale_price: salePrice,
                min_stock: minStock,
                is_active: form.is_active,
                is_quick_access: form.is_quick_access,
            })

            setEditing(false)
            await onUpdated()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error guardando cambios')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                        {getProductName(item.products)}
                    </p>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${form.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-200 text-neutral-600'
                        }`}
                >
                    {form.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {!editing ? (
                <>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-neutral-500">Unidad</p>
                            <p className="font-semibold">{item.unit}</p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-neutral-500">Stock</p>
                            <p className="font-semibold">
                                {Number(item.stock).toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-neutral-500">Precio</p>
                            <p className="font-semibold">
                                {item.flexible_price
                                    ? 'Flexible'
                                    : `$${Number(item.sale_price ?? 0).toLocaleString('es-CL')}`}
                            </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-neutral-500">Stock mínimo</p>
                            <p className="font-semibold">
                                {Number(item.min_stock).toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="mt-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 font-semibold"
                    >
                        Editar
                    </button>
                </>
            ) : (
                <div className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {!item.flexible_price && (
                        <div>
                            <label className="mb-2 block text-sm font-medium">Precio</label>
                            <input
                                type="number"
                                min="0"
                                value={form.sale_price}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, sale_price: e.target.value }))
                                }
                                className="w-full rounded-xl border border-neutral-200 p-3"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium">Stock mínimo</label>
                        <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.min_stock}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, min_stock: e.target.value }))
                            }
                            className="w-full rounded-xl border border-neutral-200 p-3"
                        />
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                            }
                        />
                        <span className="text-sm font-medium">Variante activa</span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                        <input
                            type="checkbox"
                            checked={form.is_quick_access}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, is_quick_access: e.target.checked }))
                            }
                        />
                        <span className="text-sm font-medium">Acceso rápido</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false)
                                setError('')
                                setForm({
                                    sale_price: item.sale_price !== null ? String(item.sale_price) : '',
                                    min_stock: String(item.min_stock),
                                    is_active: item.is_active,
                                    is_quick_access: item.is_quick_access,
                                })
                            }}
                            className="rounded-2xl border border-neutral-200 px-4 py-3 font-semibold"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}