import type { DailyClosureSale } from '../types/daily-closure'
import { downloadCsv } from './download-csv'

export function exportDailyClosureCsv(sales: DailyClosureSale[]) {
    const rows: string[][] = [
        ['Fecha', 'Total', 'Método de pago', 'Estado', 'Nota'],
        ...sales.map((sale) => [
            new Date(sale.sold_at).toLocaleString('es-CL'),
            String(Number(sale.total)),
            sale.payment_method,
            sale.status,
            sale.notes ?? '',
        ]),
    ]

    const today = new Date().toISOString().slice(0, 10)
    downloadCsv(`cierre-${today}.csv`, rows)
}