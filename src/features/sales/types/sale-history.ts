export type SaleHistoryItem = {
    id: string
    sold_at: string
    total: number
    payment_method: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'otro'
    status: 'completed' | 'cancelled'
    notes: string | null
    sale_items:
    | {
        id: string
        product_name_snapshot: string
        variant_name_snapshot: string
        unit_snapshot: 'kg' | 'unidad' | 'atado'
        quantity: number
        unit_price: number
        subtotal: number
    }[]
    | null
}