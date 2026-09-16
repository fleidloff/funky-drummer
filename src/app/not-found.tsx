import Link from 'next/link'
import { notFound } from '@/lib/snippets'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">{notFound.title}</h1>
      <p className="max-w-prose text-muted">{notFound.body}</p>
      <Link href="/" className="rounded-control border border-border px-3 py-2 text-accent">
        {notFound.home}
      </Link>
    </main>
  )
}
