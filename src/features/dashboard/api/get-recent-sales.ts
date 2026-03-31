import { createClient } from '@/src/lib/supabase/client'
import type { RecentSale } from '../types/dashboard'

export async function getRecentSales(): Promise<RecentSale[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('sales')
        .select('id, sold_at, total, payment_method, notes, status')
        .order('sold_at', { ascending: false })
        .limit(5)

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as RecentSale[]
}