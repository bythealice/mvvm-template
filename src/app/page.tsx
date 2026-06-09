import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold text-brand-dark">
        MVVM <span className="text-brand-green">by-feature</span>
      </h1>
      <p className="text-text-muted">Template de arquitetura Next.js · Volix</p>
      <Link
        href="/orders"
        className="mt-4 rounded-md bg-brand-green px-5 py-2.5 text-sm font-semibold text-brand-dark hover:opacity-90 transition-opacity"
      >
        Ver exemplo: Orders →
      </Link>
    </main>
  )
}
