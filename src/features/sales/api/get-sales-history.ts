import { supabase } from '@/src/lib/supabase/client'
import type { SaleHistoryItem } from '../types/sale-history'

export async function getSalesHistory(filters?: {
    paymentMethod?: 'all' | 'efectivo' | 'transferencia'
    status?: 'all' | 'completed' | 'cancelled'
}): Promise<SaleHistoryItem[]> {
    let query = supabase
        .from('sales')
        .select(`
      id,
      sold_at,
      total,
      payment_method,
      status,
      notes,
      sale_items (
        id,
        product_name_snapshot,
        variant_name_snapshot,
        unit_snapshot,
        quantity,
        unit_price,
        subtotal
      )
    `)
        .order('sold_at', { ascending: false })
        .limit(50)

    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod)
    }

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as unknown as SaleHistoryItem[]
}