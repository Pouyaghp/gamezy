'use client'
import { useState } from 'react'
import Link from 'next/link'
import { auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submitEmail = async () => {
    try {
      setLoading(true); setErr(null)
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      window.location.href = '/'
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const submitGoogle = async () => {
    try {
      setLoading(true); setErr(null)
      await signInWithPopup(auth, googleProvider)
      window.location.href = '/'
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 p-6">
        <Link href="/" className="text-sm text-zinc-400 hover:underline">← Back</Link>
        <h1 className="mt-3 text-2xl font-bold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>

        <div className="mt-4 grid gap-3">
          <input
            className="rounded-lg bg-zinc-900 p-3"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            className="rounded-lg bg-zinc-900 p-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button
            onClick={submitEmail}
            disabled={loading}
            className="rounded-lg bg-white text-black py-2 font-medium disabled:opacity-60"
          >
            {mode === 'signin' ? 'Sign in with Email' : 'Sign up with Email'}
          </button>

          <button
            onClick={submitGoogle}
            disabled={loading}
            className="rounded-lg bg-white/10 py-2 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            onClick={()=>setMode(mode==='signin'?'signup':'signin')}
            className="text-sm text-zinc-300 underline mt-2"
          >
            {mode==='signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </main>
  )
}
