'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            router.push('/')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error iniciando sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 py-10">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Ingresar</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Entra al sistema de la verdulería.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-white p-5 shadow-sm space-y-4"
            >
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-medium">Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 p-3"
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 p-3"
                        placeholder="********"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-black px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
                >
                    {loading ? 'Ingresando...' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}