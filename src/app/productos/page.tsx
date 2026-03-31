'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProductVariants } from '@/src/features/products/api/get-product-variants'
import type { ProductVariantRow } from '@/src/features/products/types/product-variant'

function getProductName(product: ProductVariantRow['products']): string {
    if (!product) return 'Sin producto'
    if (Array.isArray(product)) return product[0]?.name ?? 'Sin producto'
    return product.name
}

export default function ProductosPage() {
    const [items, setItems] = useState<ProductVariantRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getProductVariants()
                setItems(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error cargando productos')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Productos</h1>
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

            {!loading && !error && items.length === 0 && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    No hay productos cargados.
                </div>
            )}

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-neutral-500">
                                    {getProductName(item.products)}
                                </p>
                                <h2 className="text-lg font-semibold">{item.name}</h2>
                            </div>
                            {item.is_quick_access && (
                                <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Acceso rápido
                                </span>
                            )}

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-neutral-200 text-neutral-600'
                                    }`}
                            >
                                {item.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

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
                    </div>
                ))}
            </div>
        </div>
    )
}