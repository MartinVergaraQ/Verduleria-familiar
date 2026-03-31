export type StockVariantOption = {
    id: string
    name: string
    unit: 'kg' | 'unidad' | 'atado'
    stock: number
    products:
    | {
        name: string
    }
    | {
        name: string
    }[]
    | null
}

export type StockMovementType = 'entrada' | 'ajuste'