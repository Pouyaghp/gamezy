'use client'
import NavBar from '@/components/NavBar'
import useAuthUser from '@/lib/useAuthUser'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

type Glitch = { id:string; gameId:string; title:string; description:string; status:'open'|'triaged'|'fixed'; createdAt?:any }

export default function AdminPage() {
  const user = useAuthUser()
  const [glitches, setGlitches] = useState<Glitch[]>([])
  const isAdmin = useMemo(
    () => user?.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase(),
    [user]
  )

  useEffect(() => {
    const q = query(collection(db, 'glitches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setGlitches(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    })
    return () => unsub()
  }, [])

  const updateStatus = async (id: string, status: Glitch['status']) => {
    if (!isAdmin) return alert('Admins only')
    await updateDoc(doc(db, 'glitches', id), { status })
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <NavBar />
      <h1 className="text-2xl font-bold mb-6">Admin — Glitch Triage</h1>
      {!isAdmin && <p className="text-red-300">Sign in as admin to edit statuses.</p>}
      <div className="grid gap-4">
        {glitches.map(g => (
          <div key={g.id} className="rounded-2xl bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{g.title}</h3>
              <select
                className="rounded bg-zinc-800 px-2 py-1"
                value={g.status}
                onChange={e => updateStatus(g.id, e.target.value as any)}
                disabled={!isAdmin}
              >
                <option value="open">open</option>
                <option value="triaged">triaged</option>
                <option value="fixed">fixed</option>
              </select>
            </div>
            <p className="text-zinc-300 text-sm mt-2">{g.description}</p>
            <p className="text-zinc-500 text-xs mt-1">Game: {g.gameId}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
