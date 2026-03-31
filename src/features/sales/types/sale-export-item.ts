export type SaleExportItem = {
    sale_id: string
    sold_at: string
    payment_method: 'efectivo' | 'transferencia'
    status: 'completed' | 'cancelled'
    notes: string | null
    product_name_snapshot: string
    variant_name_snapshot: string
    unit_snapshot: 'kg' | 'unidad' | 'atado'
    quantity: number
    unit_price: number
    subtotal: number
}