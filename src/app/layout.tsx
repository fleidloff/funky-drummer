import type { Metadata } from 'next'
import { app } from '@/lib/snippets'
import './globals.css'

export const metadata: Metadata = {
  title: app.name,
  description: app.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
