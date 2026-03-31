export function downloadCsv(filename: string, rows: string[][]) {
    const csvContent = rows
        .map((row) =>
            row
                .map((cell) => {
                    const value = String(cell ?? '')
                    const escaped = value.replace(/"/g, '""')
                    return `"${escaped}"`
                })
                .join(',')
        )
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}