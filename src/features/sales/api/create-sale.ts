import { createClient } from '@/src/lib/supabase/client'
import type { CartItem } from '../types/sales.item'

export async function createSale(
    items: CartItem[],
    paymentMethod: 'efectivo' | 'transferencia',
    notes?: string
) {

    const supabase = createClient()
    if (!items.length) {
        throw new Error('Agrega al menos un producto')
    }

    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
            payment_method: paymentMethod,
            notes: notes || null,
        })
        .select('id')
        .single()

    if (saleError) {
        throw new Error(saleError.message)
    }

    const saleId = saleData.id

    const saleItemsPayload = items.map((item) => ({
        sale_id: saleId,
        product_variant_id: item.product_variant_id,
        product_name_snapshot: item.product_name_snapshot,
        variant_name_snapshot: item.variant_name_snapshot,
        unit_snapshot: item.unit_snapshot,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsPayload)

    if (itemsError) {
        throw new Error(itemsError.message)
    }

    for (const item of items) {
        const { error: rpcError } = await supabase.rpc('apply_stock_movement', {
            p_product_variant_id: item.product_variant_id,
            p_movement_type: 'venta',
            p_quantity: item.quantity,
            p_reference_sale_id: saleId,
            p_note: 'Venta desde app',
        })

        if (rpcError) {
            throw new Error(rpcError.message)
        }
    }

    return { saleId }
}