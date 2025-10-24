'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/review/new', label: 'Write Review' },
  { href: '/report/new', label: 'Report Glitch' },
]

export default function NavBar() {
  const pathname = usePathname()
  return (
    <header className="mb-8 border-b border-white/10 pb-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-white">Gamezy</Link>
        <nav className="flex gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:underline ${pathname === l.href ? 'text-white' : 'text-zinc-300'}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="rounded-lg bg-white/10 px-3 py-1 hover:bg-white/20"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  )
}
