'use client'
import NavBar from '@/components/NavBar'
import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'

export default function NewReview(){
  const [games, setGames] = useState<any[]>([])
  const [gameId, setGameId] = useState('')
  const [technicalScore, setTechnicalScore] = useState(7)
  const [storyScore, setStoryScore] = useState(7)
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(()=>{
    const load = async () => {
      const q = query(collection(db, 'games'))
      const snap = await getDocs(q)
      setGames(snap.docs.map(d=>({id:d.id, ...d.data()})))
    }
    load()
  },[])

  const submit = async () => {
    if (!gameId) { setErr('Please select a game'); return }
    try {
      setLoading(true); setErr(null)
      await addDoc(collection(db, 'reviews'), {
        gameId, technicalScore, storyScore, pros, cons,
        createdAt: serverTimestamp()
      })
      window.location.href = '/games'
    } catch (e:any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <NavBar />
      <div className="mx-auto max-w-xl rounded-2xl bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold mb-4">Write a review</h2>
        <div className="grid gap-3">
          <select className="rounded-lg bg-zinc-800 p-2" value={gameId} onChange={e=>setGameId(e.target.value)}>
            <option value="">Select a game</option>
            {games.map(g=> <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>

          <label>Technical score: {technicalScore}
            <input type="range" min={0} max={10} value={technicalScore}
                   onChange={e=>setTechnicalScore(Number(e.target.value))}
                   className="w-full" />
          </label>

          <label>Story score: {storyScore}
            <input type="range" min={0} max={10} value={storyScore}
                   onChange={e=>setStoryScore(Number(e.target.value))}
                   className="w-full" />
          </label>

          <textarea className="rounded-lg bg-zinc-800 p-2" placeholder="Pros (what you liked)"
                    value={pros} onChange={e=>setPros(e.target.value)} />
          <textarea className="rounded-lg bg-zinc-800 p-2" placeholder="Cons (what needs work)"
                    value={cons} onChange={e=>setCons(e.target.value)} />
          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button onClick={submit} disabled={loading}
                  className="rounded-lg bg-white text-black py-2 font-medium disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      </div>
    </main>
  )
}
