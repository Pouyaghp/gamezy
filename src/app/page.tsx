import NavBar from '@/components/NavBar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <NavBar />
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">From Glitches to Glory — Every Game Matters</h1>
        <p className="text-zinc-300 mb-6">
          Review games by their <b>Technical</b> and <b>Story</b> quality.
          Report bugs, share feedback, and help the community rank fairly.
        </p>
        <div className="flex justify-center gap-3">
          <a href="/review/new" className="bg-white text-black px-4 py-2 rounded-lg font-medium">Write a review</a>
          <a href="/report/new" className="bg-white/10 px-4 py-2 rounded-lg">Report a glitch</a>
        </div>
      </div>
    </main>
  )
}
