'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-2xl font-bold">Personns Login</h1>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Log In
        </button>
      </form>
    </main>
  )
}