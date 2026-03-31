export type DailyClosureStats = {
    totalSales: number
    totalCash: number
    totalTransfer: number
    salesCount: number
    cancelledCount: number
}

export type DailyClosureSale = {
    id: string
    sold_at: string
    total: number
    payment_method: 'efectivo' | 'transferencia'
    status: 'completed' | 'cancelled'
    notes: string | null
}