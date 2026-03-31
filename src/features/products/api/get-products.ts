import { createClient } from '@/src/lib/supabase/client'

export type ProductBaseOption = {
    id: string
    name: string
    is_active: boolean
}

export async function getProducts(): Promise<ProductBaseOption[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as ProductBaseOption[]
}