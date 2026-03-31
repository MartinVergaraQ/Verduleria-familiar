import { createClient } from '@/src/lib/supabase/client'
import type { SaleExportItem } from '../types/sale-export-item'

export async function getSalesExportItems(): Promise<SaleExportItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('sale_items')
        .select(`
      product_name_snapshot,
      variant_name_snapshot,
      unit_snapshot,
      quantity,
      unit_price,
      subtotal,
      sales!inner (
        id,
        sold_at,
        payment_method,
        status,
        notes
      )
    `)

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []).map((item: any) => ({
        sale_id: item.sales.id,
        sold_at: item.sales.sold_at,
        payment_method: item.sales.payment_method,
        status: item.sales.status,
        notes: item.sales.notes,
        product_name_snapshot: item.product_name_snapshot,
        variant_name_snapshot: item.variant_name_snapshot,
        unit_snapshot: item.unit_snapshot,
        quantity: Number(item.quantity ?? 0),
        unit_price: Number(item.unit_price ?? 0),
        subtotal: Number(item.subtotal ?? 0),
    }))
}