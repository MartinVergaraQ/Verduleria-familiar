export type DashboardStats = {
    todaySalesTotal: number
    todaySalesCount: number
    weekSalesTotal: number
    weekSalesCount: number
}

export type LowStockItem = {
    id: string
    name: string
    unit: 'kg' | 'unidad' | 'atado'
    stock: number
    min_stock: number
    products:
    | {
        name: string
    }
    | {
        name: string
    }[]
    | null
}

export type RecentSale = {
    id: string
    sold_at: string
    total: number
    payment_method: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'otro'
    notes: string | null
}

export type RecentStockMovement = {
    id: string
    movement_type: 'entrada' | 'venta' | 'ajuste'
    quantity: number
    note: string | null
    created_at: string
    product_variants:
    | {
        name: string
        unit: 'kg' | 'unidad' | 'atado'
        products:
        | {
            name: string
        }
        | {
            name: string
        }[]
        | null
    }
    | {
        name: string
        unit: 'kg' | 'unidad' | 'atado'
        products:
        | {
            name: string
        }
        | {
            name: string
        }[]
        | null
    }[]
    | null
}