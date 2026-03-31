import { createClient } from '@/src/lib/supabase/client'

export async function createProductVariant(input: {
    product_id: string
    name: string
    unit: 'kg' | 'unidad' | 'atado'
    sale_price: number | null
    flexible_price: boolean
    min_stock: number
    is_active: boolean
}) {
    const supabase = createClient()
    if (!input.product_id) {
        throw new Error('Selecciona un producto base')
    }

    if (!input.name.trim()) {
        throw new Error('Ingresa el nombre de la variante')
    }

    if (input.min_stock < 0 || Number.isNaN(input.min_stock)) {
        throw new Error('El stock mínimo debe ser 0 o más')
    }

    if (!input.flexible_price) {
        if (input.sale_price === null || Number.isNaN(input.sale_price) || input.sale_price < 0) {
            throw new Error('El precio debe ser 0 o más')
        }
    }

    const { error } = await supabase
        .from('product_variants')
        .insert({
            product_id: input.product_id,
            name: input.name.trim(),
            unit: input.unit,
            sale_price: input.flexible_price ? null : input.sale_price,
            flexible_price: input.flexible_price,
            min_stock: input.min_stock,
            is_active: input.is_active,
            stock: 0,
        })

    if (error) {
        throw new Error(error.message)
    }
}