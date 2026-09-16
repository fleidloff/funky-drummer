import { app } from '@/lib/snippets'

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">{app.name}</h1>
      <p className="max-w-prose text-muted">{app.description}</p>
    </main>
  )
}
