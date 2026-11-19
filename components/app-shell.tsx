
import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Personns
          </h1>
          <p className="text-xs text-gray-500">
            Employee management and compliance simplified
          </p>
        </div>

        <nav className="flex gap-6 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/employees" className="hover:underline">
            Team
          </Link>
          <Link href="/schedule" className="hover:underline">
            Schedule
          </Link>
          <Link href="/recruiting" className="hover:underline">
            Recruiting
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
