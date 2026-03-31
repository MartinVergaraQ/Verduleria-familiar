'use client'

import { useEffect, useState } from 'react'
import { getProducts, type ProductBaseOption } from '@/src/features/products/api/get-products'
import { createProductVariant } from '@/src/features/products/api/create-product-variant'

type Props = {
    onCreated: () => Promise<void> | void
}

export function CreateProductVariantForm({ onCreated }: Props) {
    const [products, setProducts] = useState<ProductBaseOption[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        product_id: '',
        name: '',
        unit: 'kg' as 'kg' | 'unidad' | 'atado',
        sale_price: '',
        flexible_price: false,
        min_stock: '0',
        is_active: true,
    })

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts()
                setProducts(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando productos base')
            } finally {
                setLoadingProducts(false)
            }
        }

        loadProducts()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const parsedMinStock = Number(form.min_stock)
            const parsedSalePrice =
                form.sale_price.trim() === '' ? null : Number(form.sale_price)

            await createProductVariant({
                product_id: form.product_id,
                name: form.name,
                unit: form.unit,
                sale_price: parsedSalePrice,
                flexible_price: form.flexible_price,
                min_stock: parsedMinStock,
                is_active: form.is_active,
            })

            setForm({
                product_id: '',
                name: '',
                unit: 'kg',
                sale_price: '',
                flexible_price: false,
                min_stock: '0',
                is_active: true,
            })

            setSuccess('Variante creada correctamente')
            await onCreated()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creando variante')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div>
                <h2 className="text-lg font-bold">Nueva variante</h2>
                <p className="text-sm text-neutral-500">
                    Agrega un tipo nuevo sin entrar a Supabase.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-medium">Producto base</label>
                <select
                    value={form.product_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 p-3"
                    disabled={loadingProducts}
                >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Nombre de la variante</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Tomate oferta"
                    className="w-full rounded-xl border border-neutral-200 p-3"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Unidad</label>
                <select
                    value={form.unit}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            unit: e.target.value as 'kg' | 'unidad' | 'atado',
                        }))
                    }
                    className="w-full rounded-xl border border-neutral-200 p-3"
                >
                    <option value="kg">kg</option>
                    <option value="unidad">unidad</option>
                    <option value="atado">atado</option>
                </select>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                <input
                    type="checkbox"
                    checked={form.flexible_price}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, flexible_price: e.target.checked }))
                    }
                />
                <span className="text-sm font-medium">Precio flexible</span>
            </label>

            {!form.flexible_price && (
                <div>
                    <label className="mb-2 block text-sm font-medium">Precio</label>
                    <input
                        type="number"
                        min="0"
                        value={form.sale_price}
                        onChange={(e) => setForm((prev) => ({ ...prev, sale_price: e.target.value }))}
                        placeholder="Ej: 1300"
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
                    onChange={(e) => setForm((prev) => ({ ...prev, min_stock: e.target.value }))}
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
                <span className="text-sm font-medium">Crear como activa</span>
            </label>

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-green-600 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
                {saving ? 'Creando...' : 'Crear variante'}
            </button>
        </form>
    )
}