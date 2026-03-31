import { supabase } from '@/src/lib/supabase/client'
import type { TopProductItem } from '../types/top-products'

function startOfToday() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
}

export async function getTopProductsToday(): Promise<TopProductItem[]> {
    const todayStart = startOfToday()

    const { data, error } = await supabase
        .from('sale_items')
        .select(`
      product_name_snapshot,
      variant_name_snapshot,
      unit_snapshot,
      quantity,
      subtotal,
      sales!inner (
        sold_at,
        status
      )
    `)
        .gte('sales.sold_at', todayStart)
        .eq('sales.status', 'completed')

    if (error) {
        throw new Error(error.message)
    }

    const grouped = new Map<string, TopProductItem>()

    for (const item of data ?? []) {
        const key = `${item.product_name_snapshot}__${item.variant_name_snapshot}__${item.unit_snapshot}`

        const current = grouped.get(key)

        if (current) {
            current.total_quantity += Number(item.quantity ?? 0)
            current.total_amount += Number(item.subtotal ?? 0)
        } else {
            grouped.set(key, {
                product_name_snapshot: item.product_name_snapshot,
                variant_name_snapshot: item.variant_name_snapshot,
                unit_snapshot: item.unit_snapshot,
                total_quantity: Number(item.quantity ?? 0),
                total_amount: Number(item.subtotal ?? 0),
            })
        }
    }

    return Array.from(grouped.values()).sort(
        (a, b) => b.total_amount - a.total_amount
    )
}