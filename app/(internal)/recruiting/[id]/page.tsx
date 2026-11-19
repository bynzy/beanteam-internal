
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import {
  addHiringNote,
  updateApplicationStatus,
} from './actions'



type ApplicantJobPosting = {
  company_id: string
  title: string
}

type WeeklyAvailability = Record<string, string[]>

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Verify the user is authenticated
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verify company ownership or admin access
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

  // Retrieve application belonging to the authorized company
  const { data: application, error: applicationError } =
    await supabase
      .from('job_applications')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        status,
        created_at,
        cover_letter,
        weekly_availability,
        job_postings!inner (
          company_id,
          title
        )
      `)
      .eq('id', id)
      .eq('job_postings.company_id', companyId)
      .maybeSingle()

  if (applicationError) {
    throw new Error('Unable to retrieve applicant details.')
  }

  if (!application) {
    notFound()
  }
  
const { data: hiringNotes, error: notesError } =
await supabase
  .from('job_application_notes')
  .select('id, note, author_id, created_at')
  .eq('application_id', application.id)
  .order('created_at', { ascending: false })

if (notesError) {
throw new Error('Unable to retrieve hiring notes.')
}

  const jobPosting =
    application.job_postings as unknown as ApplicantJobPosting | null

  const weeklyAvailability =
    application.weekly_availability as WeeklyAvailability | null

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Back Navigation */}
        <Link
          href="/recruiting"
          className="text-sm font-medium text-gray-600 hover:underline"
        >
          ← Back to Recruiting
        </Link>

        {/* Applicant Profile Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* Applicant Header */}
          <h1 className="text-3xl font-bold text-gray-900">
            {application.first_name} {application.last_name}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Position Applied For:{' '}
            <span className="font-semibold text-gray-900">
              {jobPosting?.title ?? 'Unknown position'}
            </span>
          </p>

          {/* Application Status */}
          <div className="mt-3">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-800">
              
{({
  new: 'New',
  reviewing: 'Reviewing',
  interview: 'Interviewing',
  not_hired: 'Not Hired',
  offered: 'Offered',
  hired: 'Hired',
  withdrawn: 'Withdrawn',
} as Record<string, string>)[application.status] ?? application.status}

            </span>
          </div>

<form
  action={updateApplicationStatus}
  className="mt-4 flex flex-wrap items-end gap-3"
>
  <input
    type="hidden"
    name="application_id"
    value={application.id}
  />

  <div>
    <label
      htmlFor="application-status"
      className="mb-2 block text-sm font-semibold text-gray-700"
    >
      Change Application Status
    </label>

    <select
      id="application-status"
      name="status"
      defaultValue={application.status}
      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900"
    >
      <option value="new">New</option>
      <option value="reviewing">Reviewing</option>
      <option value="interview">Interviewing</option>
      <option value="not_hired">Not Hired</option>
      <option value="offered">Offered</option>
      <option value="hired">Hired</option>
      <option value="withdrawn">Withdrawn</option>
    </select>
  </div>

  <button
    type="submit"
    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Update Status
  </button>
</form>


          {/* Application Date */}
          <p className="mt-3 text-sm text-gray-500">
            Applied on:{' '}
            {new Date(application.created_at).toLocaleDateString(
              'en-US',
              {
                timeZone: 'America/Los_Angeles',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }
            )}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Applicant ID: {id}
          </p>

          {/* Contact Information */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="mt-4 space-y-4">

              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email Address
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {application.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone Number
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {application.phone || 'Not provided'}
                </p>
              </div>

            </div>
          </div>

          {/* Cover Letter */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Cover Letter
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {application.cover_letter || 'No cover letter provided.'}
            </p>
          </div>

          {/* Weekly Availability */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Weekly Availability
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Days and shifts the applicant is available to work.
            </p>

            <div className="mt-4 space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const availability =
                  weeklyAvailability?.[day] ?? []

                return (
                  <div
                    key={day}
                    className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {day}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {availability.length > 0 ? (
                        availability.map((shift) => (
                          <span
                            key={shift}
                            className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800"
                          >
                            {shift}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          Not available
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hiring Notes - Outside Weekly Availability */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Hiring Notes
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Internal notes about interviews, follow-ups,
              and the hiring process.
            </p>

<form action={addHiringNote} className="mt-5 space-y-3">
  <input
    type="hidden"
    name="application_id"
    value={application.id}
  />

  <label
    htmlFor="hiring-note"
    className="block text-sm font-semibold text-gray-900"
  >
    Add a Hiring Note
  </label>

  <textarea
    id="hiring-note"
    name="note"
    rows={4}
    maxLength={5000}
    required
    placeholder="Enter interview notes, follow-up details, or hiring observations..."
    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
  />

  <button
    type="submit"
    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Save Hiring Note
  </button>
</form>

            
<div className="mt-4 space-y-3">
  {hiringNotes && hiringNotes.length > 0 ? (
    hiringNotes.map((hiringNote) => (
      <div
        key={hiringNote.id}
        className="rounded-xl border border-gray-200 bg-gray-50 p-5"
      >
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-900">
          {hiringNote.note}
        </p>

        <p className="mt-3 text-xs text-gray-500">
          Added on{' '}
          {new Date(hiringNote.created_at).toLocaleDateString(
            'en-US',
            {
              timeZone: 'America/Los_Angeles',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          )}
        </p>
      </div>
    ))
  ) : (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        No hiring notes yet.
      </p>
    </div>
  )}
</div>

            
          </div>
        </div>
      </div>
    </main>
  )
}

