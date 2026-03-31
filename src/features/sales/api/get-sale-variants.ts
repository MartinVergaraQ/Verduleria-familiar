import { supabase } from '@/src/lib/supabase/client'
import type { SaleVariantOption } from '../types/sales.item'

export async function getSaleVariants(): Promise<SaleVariantOption[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id,
      name,
      unit,
      sale_price,
      flexible_price,
      stock,
      is_quick_access,
      products (
        name
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as SaleVariantOption[]
}