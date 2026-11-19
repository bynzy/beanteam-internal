
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RecruitingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

const { data: memberships, error: membershipError } =
await supabase
  .from('company_members')
  .select('company_id, role')
  .eq('user_id', user.id)
  .in('role', ['owner', 'admin'])
  .limit(1)

if (membershipError) {
throw new Error('Unable to verify company access.')
}

if (!memberships || memberships.length === 0) {
redirect('/dashboard')
}
const companyId = memberships[0].company_id

const { count: applicationCount, error: applicationsError } =
  await supabase
    .from('job_applications')
    .select('id, job_postings!inner(company_id)', {
      count: 'exact',
      head: true,
    })
    .eq('job_postings.company_id', companyId)

if (applicationsError) {
  throw new Error('Unable to retrieve applications.')
}


const { data: applications, error: applicationListError } =
  await supabase
    .from('job_applications')
    .select(`
      id,
      first_name,
      last_name,
      status,
      created_at,
      job_postings!inner (
        company_id,
        title
      )
    `)
    .eq('job_postings.company_id', companyId)
    .order('created_at', { ascending: false })

if (applicationListError) {
  throw new Error('Unable to retrieve applicant list.')
}

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold">
        Recruiting
      </h1>

      <p className="mt-2 text-gray-600">
        Manage job postings and review applications
        from your company's candidates.
      </p>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">
          Welcome to Personns Recruiting!
        </h2>

<p className="mt-4 text-3xl font-bold text-slate-900">
  {applicationCount ?? 0}
</p>

<p className="mt-1 text-sm text-slate-500">
  Total Job Applications
</p>


        <p className="mt-2 text-sm text-gray-500">
          Your recruiting dashboard is coming together.
        </p>

<div className="mt-6 space-y-3">
  <h3 className="text-lg font-semibold">
    Recent Applications
  </h3>

  {applications?.length ? (
    applications.map((application) => (
      <div
        key={application.id}
        className="rounded-lg border border-slate-200 p-4"
      >
        
<a
  href={`/recruiting/${application.id}`}
  className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
>
  {application.first_name} {application.last_name}
</a>
    

        
<p className="mt-1 text-sm text-slate-500">
  Position: {
    (
      application.job_postings as unknown as {
        title: string
        company_id: string
      } | null
    )?.title ?? 'Unknown position'
  }
</p>

        
<p className="mt-1 text-sm text-slate-500">
  Status: {
    ({
      new: 'New',
      reviewing: 'Reviewing',
      interview: 'Interviewing',
      not_hired: 'Not Hired',
      offered: 'Offered',
      hired: 'Hired',
      withdrawn: 'Withdrawn',
    } as Record<string, string>)[application.status] ?? application.status
  }
</p>


        <p className="mt-1 text-sm text-slate-500">
          Applied: {new Date(application.created_at).toLocaleDateString()}
        </p>
      </div>
    ))
  ) : (
    <p className="text-sm text-slate-500">
      No applications yet.
    </p>
  )}
</div>

      </div>
    </main>
  )
}

