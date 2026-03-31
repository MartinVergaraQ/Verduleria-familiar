import { createClient } from '@/src/lib/supabase/client'

export async function createProduct(input: {


    name: string
    description?: string
    is_active: boolean
}) {
    const supabase = createClient()
    const name = input.name.trim()
    const description = input.description?.trim() || null

    if (!name) {
        throw new Error('Ingresa el nombre del producto')
    }

    const { error } = await supabase
        .from('products')
        .insert({
            name,
            description,
            is_active: input.is_active,
        })

    if (error) {
        if (error.message.toLowerCase().includes('duplicate')) {
            throw new Error('Ya existe un producto con ese nombre')
        }

        throw new Error(error.message)
    }
}