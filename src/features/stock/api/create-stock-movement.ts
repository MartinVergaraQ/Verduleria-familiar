import { supabase } from '@/src/lib/supabase/client'
import type { StockMovementType } from '../types/stock-movement'

export async function createStockMovement(input: {
    productVariantId: string
    movementType: StockMovementType
    quantity: number
    note?: string
}) {
    if (!input.productVariantId) {
        throw new Error('Selecciona un producto')
    }

    if (input.quantity === 0 || Number.isNaN(input.quantity)) {
        throw new Error('Ingresa una cantidad válida')
    }

    if (input.movementType === 'entrada' && input.quantity < 0) {
        throw new Error('La entrada debe ser positiva')
    }

    const { error } = await supabase.rpc('apply_stock_movement', {
        p_product_variant_id: input.productVariantId,
        p_movement_type: input.movementType,
        p_quantity: input.quantity,
        p_reference_sale_id: null,
        p_note: input.note || null,
    })

    if (error) {
        throw new Error(error.message)
    }
}