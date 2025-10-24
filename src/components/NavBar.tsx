'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useAuthUser from '@/lib/useAuthUser'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

const links = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/review/new', label: 'Write Review' },
  { href: '/report/new', label: 'Report Glitch' },
]

export default function NavBar() {
  const pathname = usePathname()
  const user = useAuthUser()

  return (
    <header className="mb-8 border-b border-white/10 pb-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Gamezy Logo" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-bold text-xl text-white">Gamezy</span>
        </Link>

        <nav className="flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:underline ${pathname === l.href ? 'text-white' : 'text-zinc-300'}`}
            >
              {l.label}
            </Link>
          ))}

          {!user ? (
            <Link href="/auth" className="rounded-lg bg-white/10 px-3 py-1 hover:bg-white/20">
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="rounded-lg bg-white/10 px-3 py-1 hover:bg-white/20"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
