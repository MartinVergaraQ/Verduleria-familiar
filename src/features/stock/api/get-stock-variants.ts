import { createClient } from '@/src/lib/supabase/client'
import type { StockVariantOption } from '../types/stock-movement'

export async function getStockVariants(): Promise<StockVariantOption[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('product_variants')
        .select(`
      id,
      name,
      unit,
      stock,
      products (
        name
      )
    `)
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as unknown as StockVariantOption[]
}