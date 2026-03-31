import { supabase } from '@/src/lib/supabase/client'
import type { DailyClosureSale, DailyClosureStats } from '../types/daily-closure'

function startOfToday() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
}

export async function getDailyClosure(): Promise<{
    stats: DailyClosureStats
    sales: DailyClosureSale[]
}> {
    const todayStart = startOfToday()

    const { data, error } = await supabase
        .from('sales')
        .select('id, sold_at, total, payment_method, status, notes')
        .gte('sold_at', todayStart)
        .order('sold_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    const sales = (data ?? []) as DailyClosureSale[]

    const completedSales = sales.filter((sale) => sale.status === 'completed')
    const cancelledSales = sales.filter((sale) => sale.status === 'cancelled')

    const totalSales = completedSales.reduce(
        (acc, sale) => acc + Number(sale.total ?? 0),
        0
    )

    const totalCash = completedSales
        .filter((sale) => sale.payment_method === 'efectivo')
        .reduce((acc, sale) => acc + Number(sale.total ?? 0), 0)

    const totalTransfer = completedSales
        .filter((sale) => sale.payment_method === 'transferencia')
        .reduce((acc, sale) => acc + Number(sale.total ?? 0), 0)

    return {
        stats: {
            totalSales,
            totalCash,
            totalTransfer,
            salesCount: completedSales.length,
            cancelledCount: cancelledSales.length,
        },
        sales,
    }
}