import type { Metadata } from 'next'
import { Archivo_Black, Oswald } from 'next/font/google'
import { app } from '@/lib/snippets'
import './globals.css'

const display = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo',
})

const panel = Oswald({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-oswald',
})

export const metadata: Metadata = {
  title: app.name,
  description: app.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`h-full antialiased ${display.variable} ${panel.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
