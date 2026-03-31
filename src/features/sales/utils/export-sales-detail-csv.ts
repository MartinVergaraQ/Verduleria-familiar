import type { SaleExportItem } from '../types/sale-export-item'
import { downloadCsv } from '@/src/features/closure/utils/download-csv'

export function exportSalesDetailCsv(items: SaleExportItem[]) {
    const rows: string[][] = [
        [
            'Venta ID',
            'Fecha',
            'Método de pago',
            'Estado',
            'Producto',
            'Variante',
            'Unidad',
            'Cantidad',
            'Precio unitario',
            'Subtotal',
            'Nota',
        ],
        ...items.map((item) => [
            item.sale_id,
            new Date(item.sold_at).toLocaleString('es-CL'),
            item.payment_method,
            item.status,
            item.product_name_snapshot,
            item.variant_name_snapshot,
            item.unit_snapshot,
            String(item.quantity),
            String(item.unit_price),
            String(item.subtotal),
            item.notes ?? '',
        ]),
    ]

    const today = new Date().toISOString().slice(0, 10)
    downloadCsv(`ventas-detalle-${today}.csv`, rows)
}