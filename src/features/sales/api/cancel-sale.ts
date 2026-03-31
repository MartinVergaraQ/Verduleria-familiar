import { supabase } from '@/src/lib/supabase/client'

export async function cancelSale(saleId: string) {
    const { error } = await supabase.rpc('cancel_sale', {
        p_sale_id: saleId,
    })

    if (error) {
        throw new Error(error.message)
    }
}