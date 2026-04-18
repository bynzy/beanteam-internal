import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">BeanTeam Internal</h1>
      <p className="mt-4">Supabase connection test page.</p>
      <p className="mt-2">
        Current user: {user ? user.email : 'Not signed in'}
      </p>
    </main>
  )
}
           