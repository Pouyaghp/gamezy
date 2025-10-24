'use client'
import NavBar from '@/components/NavBar'
import { db, storage } from '@/lib/firebase'
import { addDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useState } from 'react'

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'games'))
    const unsub = onSnapshot(q, snap =>
      setGames(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return () => unsub()
  }, [])

  const createGame = async () => {
    try {
      setLoading(true)
      let coverUrl = ''
      if (file) {
        const r = ref(storage, `covers/${Date.now()}-${file.name}`)
        await uploadBytes(r, file)
        coverUrl = await getDownloadURL(r)
      }
      await addDoc(collection(db, 'games'), {
        title,
        coverUrl,
        platforms: [],
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <NavBar />
      <div className="grid gap-6">
        <div className="rounded-2xl bg-zinc-900 p-4 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Add a Game</h2>
          <input
            className="w-full rounded-lg bg-zinc-800 p-2 mb-2"
            placeholder="Game title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button
            onClick={createGame}
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-white text-black py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Adding...' : 'Create'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {games.map(g => (
            <div key={g.id} className="rounded-2xl bg-zinc-900 p-4">
              {g.coverUrl && (
                <img
                  src={g.coverUrl}
                  alt={g.title}
                  className="mb-3 h-40 w-full object-cover rounded-xl"
                />
              )}
              <h3 className="text-lg font-bold">{g.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
