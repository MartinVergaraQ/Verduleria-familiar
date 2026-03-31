'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getProductVariants } from '@/src/features/products/api/get-product-variants'
import type { ProductVariantRow } from '@/src/features/products/types/product-variant'
import { ProductVariantEditCard } from '@/src/features/products/components/product-variant-edit-card'
import { CreateProductForm } from '@/src/features/products/components/create-product-form'
import { CreateProductVariantForm } from '@/src/features/products/components/create-product-variant-form'

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

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin catálogo</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

            {refreshing && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    Actualizando catálogo...
                </div>
            )}

            {loading && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    Cargando catálogo...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading && (
                <div className="space-y-4">
                    <CreateProductForm onCreated={() => loadData(false)} />
                    <CreateProductVariantForm onCreated={() => loadData(false)} />

                    <div className="space-y-3">
                        {items.map((item) => (
                            <ProductVariantEditCard
                                key={item.id}
                                item={item}
                                onUpdated={() => loadData(false)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}