'use client'

import { useState } from 'react'
import { createProduct } from '@/src/features/products/api/create-product'

type Props = {
    onCreated: () => Promise<void> | void
}

export function CreateProductForm({ onCreated }: Props) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({
        name: '',
        description: '',
        is_active: true,
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            await createProduct({
                name: form.name,
                description: form.description,
                is_active: form.is_active,
            })

            setForm({
                name: '',
                description: '',
                is_active: true,
            })

            setSuccess('Producto creado correctamente')
            await onCreated()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creando producto')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div>
                <h2 className="text-lg font-bold">Nuevo producto base</h2>
                <p className="text-sm text-neutral-500">
                    Crea productos como Papa, Ajo o Lechuga desde la app.
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
                <label className="mb-2 block text-sm font-medium">Nombre</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Papa"
                    className="w-full rounded-xl border border-neutral-200 p-3"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Descripción</label>
                <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Opcional"
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
                <span className="text-sm font-medium">Crear como activo</span>
            </label>

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-black px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
                {saving ? 'Creando...' : 'Crear producto'}
            </button>
        </form>
    )
}