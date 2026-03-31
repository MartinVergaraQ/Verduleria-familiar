import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verdulería Familiar',
  description: 'Sistema simple de ventas e inventario',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  )
}