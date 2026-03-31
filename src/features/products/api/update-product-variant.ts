import { supabase } from '@/src/lib/supabase/client'

export async function updateProductVariant(input: {
    id: string
    sale_price: number | null
    min_stock: number
    is_active: boolean
    is_quick_access: boolean
}) {
    const { error } = await supabase
        .from('product_variants')
        .update({
            sale_price: input.sale_price,
            min_stock: input.min_stock,
            is_active: input.is_active,
            is_quick_access: input.is_quick_access,
        })
        .eq('id', input.id)

    if (error) {
        throw new Error(error.message)
    }
}