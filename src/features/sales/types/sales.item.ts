export type SaleVariantOption = {
    id: string
    name: string
    unit: 'kg' | 'unidad' | 'atado'
    sale_price: number | null
    flexible_price: boolean
    stock: number
    is_quick_access: boolean
    products:
    | {
        name: string
    }
    | {
        name: string
    }[]
    | null
}

export type CartItem = {
    product_variant_id: string
    product_name_snapshot: string
    variant_name_snapshot: string
    unit_snapshot: 'kg' | 'unidad' | 'atado'
    quantity: number
    unit_price: number
    subtotal: number
}