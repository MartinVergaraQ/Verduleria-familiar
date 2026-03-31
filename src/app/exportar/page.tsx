'use client'

import Link from 'next/link'
import { useState } from 'react'
import { getSalesExportItems } from '@/src/features/sales/api/get-sales-export-items'
import { exportSalesDetailCsv } from '@/src/features/sales/utils/export-sales-detail-csv'

export default function ExportarPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function handleExport() {
        try {
            setLoading(true)
            setError('')
            setSuccess('')

            const items = await getSalesExportItems()
            exportSalesDetailCsv(items)

            setSuccess('CSV exportado correctamente')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error exportando CSV')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Exportar</h1>
                <Link href="/" className="text-sm font-medium text-green-700">
                    Volver
                </Link>
            </div>

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

            <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
                <div>
                    <h2 className="text-lg font-bold">Ventas detalladas</h2>
                    <p className="text-sm text-neutral-500">
                        Exporta todas las líneas de venta con producto, cantidad y subtotal.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={loading}
                    className="w-full rounded-2xl bg-black px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
                >
                    {loading ? 'Exportando...' : 'Exportar ventas detalladas'}
                </button>
            </div>
        </div>
    )
}