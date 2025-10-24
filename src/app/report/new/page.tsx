'use client'
import NavBar from '@/components/NavBar'
import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'

export default function ReportGlitch() {
  const [games, setGames] = useState<any[]>([])
  const [form, setForm] = useState({ gameId:'', title:'', description:'' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(()=>{
    const load = async ()=>{
      const q = query(collection(db,'games'))
      const snap = await getDocs(q)
      setGames(snap.docs.map(d=>({id:d.id, ...d.data()})))
    }
    load()
  },[])

  const submit = async ()=>{
    if(!form.gameId){ setErr('Please select a game'); return }
    try{
      setLoading(true); setErr(null)
      await addDoc(collection(db,'glitches'),{
        ...form,
        createdAt:serverTimestamp(),
        status:'open'
      })
      window.location.href='/games'
    }catch(e:any){
      setErr(e.message)
    }finally{
      setLoading(false)
    }
  }

  return(
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <NavBar/>
      <div className="mx-auto max-w-xl rounded-2xl bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold mb-4">Report a glitch</h2>
        <div className="grid gap-3">
          <select className="rounded-lg bg-zinc-800 p-2"
                  value={form.gameId}
                  onChange={e=>setForm({...form,gameId:e.target.value})}>
            <option value="">Select a game</option>
            {games.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}
          </select>

          <input className="rounded-lg bg-zinc-800 p-2"
                 placeholder="Short title"
                 value={form.title}
                 onChange={e=>setForm({...form,title:e.target.value})}/>

          <textarea className="rounded-lg bg-zinc-800 p-2"
                    placeholder="Describe the issue, platform, steps to reproduce"
                    value={form.description}
                    onChange={e=>setForm({...form,description:e.target.value})}/>

          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button onClick={submit}
                  disabled={loading}
                  className="rounded-lg bg-white text-black py-2 font-medium disabled:opacity-60">
            {loading?'Submitting...':'Submit report'}
          </button>
        </div>
      </div>
    </main>
  )
}
