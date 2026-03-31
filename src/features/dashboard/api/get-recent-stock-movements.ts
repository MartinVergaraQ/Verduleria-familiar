import { createClient } from '@/src/lib/supabase/client'
import type { RecentStockMovement } from '../types/dashboard'

export async function getRecentStockMovements(): Promise<RecentStockMovement[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('stock_movements')
        .select(`
      id,
      movement_type,
      quantity,
      note,
      created_at,
      product_variants (
        name,
        unit,
        products (
          name
        )
      )
    `)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as unknown as RecentStockMovement[]
}