import Link from 'next/link'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateJobPosting } from './actions'

type PageProps = {
    params: Promise<{ id: string }>
  }
  
  export default async function EditJobPostingPage({
    params,
  }: PageProps) {
    const { id: jobId } = await params
  

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

  if (membershipError) {
    throw new Error('Unable to verify company access.')
  }

  if (!memberships || memberships.length === 0) {
    redirect('/dashboard')
  }

  const authorizedCompanyIds = memberships.map(
    (membership) => membership.company_id
  )

  const { data: job, error: jobError } = await supabase
    .from('job_postings')
    .select(
      'id, company_id, title, description, location, employment_type, status'
    )
    .eq('id', jobId)
    .in('company_id', authorizedCompanyIds)
    .maybeSingle()

  if (jobError) {
    throw new Error('Unable to load job posting.')
  }

  if (!job) {
    notFound()
  }



  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link
        href="/recruiting/jobs"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Job Postings
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">
  Edit Job Posting
</h1>

<p className="mt-2 text-lg font-semibold text-slate-700">
  {job.title}
</p>


      <p className="mt-2 text-slate-600">
        Update an existing job opening.
      </p>
      <form id="edit-job-form" action={updateJobPosting}>
      
<input
  type="hidden"
  name="job_id"
  value={job.id}
/>
  
<div className="mt-8 max-w-2xl">
  <label
    htmlFor="title"
    className="block text-sm font-medium text-slate-700"
  >
    Job Title
  </label>

  <input
    id="title"
    name="title"
    type="text"
    defaultValue={job.title}
    maxLength={200}
    required
    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
  />
</div>

<div className="mt-6 max-w-2xl">
  <label
    htmlFor="description"
    className="block text-sm font-medium text-slate-700"
  >
    Job Description
  </label>

  <textarea
    id="description"
    name="description"
    defaultValue={job.description ?? ''}
    rows={8}
    maxLength={10000}
    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    placeholder="Describe the position, responsibilities, and qualifications..."
  />
</div>

<div className="mt-6 max-w-2xl">
  <label
    htmlFor="location"
    className="block text-sm font-medium text-slate-700"
  >
    Job Location
  </label>

  <input
    id="location"
    name="location"
    type="text"
    defaultValue={job.location ?? ''}
    maxLength={200}
    placeholder="e.g. Whittier, CA"
    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
  />
</div>

<div className="mt-6 max-w-2xl">
  <label
    htmlFor="employment_type"
    className="block text-sm font-medium text-slate-700"
  >
    Employment Type
  </label>

  <select
    id="employment_type"
    name="employment_type"
    defaultValue={job.employment_type ?? ''}
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="">Select employment type</option>
    <option value="full_time">Full-Time</option>
    <option value="part_time">Part-Time</option>
    <option value="temporary">Temporary</option>
    <option value="seasonal">Seasonal</option>
    <option value="contract">Contract</option>
    <option value="internship">Internship</option>
  </select>
</div>

<div className="mt-6 max-w-2xl">
  <label
    htmlFor="status"
    className="block text-sm font-medium text-slate-700"
  >
    Job Status
  </label>

  <select
    id="status"
    name="status"
    defaultValue={job.status}
    required
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="draft">Draft</option>
    <option value="published">Published</option>
    <option value="closed">Closed</option>
  </select>
</div>

<div className="mt-8">
  
<button
  type="submit"
  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
>
  Save Changes
</button>

</div>

</form>
    </main>
  )
}
