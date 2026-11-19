
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createJobPosting } from './actions'


export default async function NewJobPostingPage() {

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

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link
        href="/recruiting/jobs"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Job Postings
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Create Job Posting
      </h1>

      <p className="mt-2 text-slate-600">
        Create a new job opening for your company.
      </p>


      <form
  id="create-job-form"
  action={createJobPosting}
  className="mt-8 rounded-xl border border-slate-200 p-6"
  >

  <h2 className="text-lg font-semibold text-slate-900">
    Job Details
  </h2>

  <div className="mt-6">
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
      placeholder="e.g. Junior Bobarista"
      required
      className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
    />
  </div>

  <div className="mt-6">
    <label
      htmlFor="description"
      className="block text-sm font-medium text-slate-700"
    >
      Job Description
    </label>

    <textarea
      id="description"
      name="description"
      rows={6}
      placeholder="Describe the position, responsibilities, and qualifications..."
      className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
    />
  </div>

  <div className="mt-6">
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
    placeholder="e.g. Whittier, CA"
    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
  />
</div>

<div className="mt-6">
  <label
    htmlFor="employment_type"
    className="block text-sm font-medium text-slate-700"
  >
    Employment Type
  </label>

  <select
    id="employment_type"
    name="employment_type"
    defaultValue=""
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
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

<div className="mt-6">
  <label
    htmlFor="status"
    className="block text-sm font-medium text-slate-700"
  >
    Job Posting Status
  </label>

  <select
    id="status"
    name="status"
    defaultValue="draft"
    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
  >
    <option value="draft">Draft — Not visible to applicants</option>
    <option value="published">Published — Visible to applicants</option>
  </select>

  <p className="mt-2 text-xs text-slate-500">
    You can save a job as a draft while preparing it for publication.
  </p>
</div>

<div className="mt-6 flex justify-end">
  
<button
  type="submit"
  form="create-job-form"
  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
>
  Save Job Posting
</button>

</div>

</form>

    </main>
  )
}
