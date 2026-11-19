
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'


export default async function RecruitingJobsPage() {

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

  const { data: jobPostings, error: jobsError } =
    await supabase
      .from('job_postings')
      .select(`
        id,
        title,
        location,
        employment_type,
        status,
        created_at
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

  if (jobsError) {
    throw new Error('Unable to retrieve job postings.')
  }


  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link
        href="/recruiting"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Recruiting
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Job Postings
      </h1>

<Link
  href="/recruiting/jobs/new"
  className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
>
  + Create Job Posting
</Link>


      <p className="mt-2 text-slate-600">
        Create and manage your company's job openings.
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Your Job Postings
        </h2>

        
{jobPostings?.length ? (
  <div className="mt-5 space-y-3">
    {jobPostings.map((job) => (
      <div
        key={job.id}
        className="rounded-lg border border-slate-200 p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">
            {job.title}
          </h3>

<Link
  href={`/recruiting/jobs/${job.id}/edit`}
  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
>
  Edit Job Posting
</Link>


          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-800">
            {job.status}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Location: {job.location || 'Not specified'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Employment Type: {job.employment_type || 'Not specified'}
        </p>
      </div>
    ))}
  </div>
) : (
  <p className="mt-3 text-sm text-slate-500">
    No job postings yet.
  </p>
)}

      </div>
    </main>
  )
}
