import { createClient } from '@/src/lib/supabase/client'
import type { DashboardStats } from '../types/dashboard'

function startOfToday() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
}

function startOfWeek() {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    now.setDate(now.getDate() - diff)
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const todayStart = startOfToday()
    const weekStart = startOfWeek()
    const supabase = createClient()
    const [{ data: todaySales, error: todayError }, { data: weekSales, error: weekError }] =
        await Promise.all([
            supabase
                .from('sales')
                .select('total, sold_at')
                .eq('status', 'completed')
                .gte('sold_at', todayStart),
            supabase
                .from('sales')
                .select('total, sold_at')
                .eq('status', 'completed')
                .gte('sold_at', weekStart),
        ])

    if (todayError) throw new Error(todayError.message)
    if (weekError) throw new Error(weekError.message)

    const todaySalesTotal = (todaySales ?? []).reduce(
        (acc, sale) => acc + Number(sale.total ?? 0),
        0
    )

    const weekSalesTotal = (weekSales ?? []).reduce(
        (acc, sale) => acc + Number(sale.total ?? 0),
        0
    )

    return {
        todaySalesTotal,
        todaySalesCount: todaySales?.length ?? 0,
        weekSalesTotal,
        weekSalesCount: weekSales?.length ?? 0,
    }
}