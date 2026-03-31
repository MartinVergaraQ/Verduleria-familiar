import { supabase } from '@/src/lib/supabase/client'
import type { LowStockItem } from '../types/dashboard'

export async function getLowStockItems(): Promise<LowStockItem[]> {
    const { data, error } = await supabase
        .from('product_variants')
        .select(`
      id,
      name,
      unit,
      stock,
      min_stock,
      products (
        name
      )
    `)
        .eq('is_active', true)
        .order('stock', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    const items = ((data ?? []) as unknown as LowStockItem[]).filter(
        (item) => Number(item.stock) <= Number(item.min_stock)
    )

    return items
}