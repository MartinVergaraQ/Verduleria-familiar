export type ProductVariantRow = {
    id: string
    name: string
    unit: 'kg' | 'unidad' | 'atado'
    sale_price: number | null
    flexible_price: boolean
    stock: number
    min_stock: number
    is_active: boolean
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