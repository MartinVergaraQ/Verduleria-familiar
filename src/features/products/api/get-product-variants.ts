import { createClient } from '@/src/lib/supabase/client'
import type { ProductVariantRow } from '../types/product-variant'

export async function getProductVariants(): Promise<ProductVariantRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id, 
      name,
      unit,
      sale_price,
      flexible_price,
      stock,
      min_stock,
      is_active,
      is_quick_access,
      products (
        name
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as ProductVariantRow[]
}