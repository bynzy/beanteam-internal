import WeeklyAvailability from './weekly-availability'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApplicationForm from './application-form'
import SubmitButton from './submit-button'




type ApplyPageProps = {
  params: Promise<{ company: string }>
  searchParams: Promise<{ job?: string }>
}

export default async function ApplyPage({
  params,
  searchParams,
}: ApplyPageProps) {
  const { company } = await params
  const { job } = await searchParams

  if (!job) {
    notFound()
  }

  const supabase = await createClient()

  const { data: companyRecord, error: companyError } =
    await supabase
      .from('companies')
      .select('id')
      .eq('slug', company)
      .maybeSingle()

  if (companyError || !companyRecord) {
    notFound()
  }

  const { data: jobPosting, error: jobError } =
    await supabase
      .from('job_postings')
      .select('id')
      .eq('id', job)
      .eq('company_id', companyRecord.id)
      .eq('status', 'published')
      .maybeSingle()

  if (jobError || !jobPosting) {
    notFound()
  }



  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
        Powered by Personns
      </p>

      <h1 className="mb-4 text-4xl font-bold">
        Job Application
      </h1>

      <p className="mb-8 text-gray-600">
        Welcome! We're excited that you're interested
        in joining our team.
      </p>



      <ApplicationForm>




        <input
          type="hidden"
          name="company"
          value={company}
        />

        <input
          type="hidden"
          name="job_posting_id"
          value={job ?? ''}
        />


        <h2 className="mb-6 text-2xl font-semibold">
          Your Information
        </h2>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium"
              >
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium"
              >
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium"
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>
        </div>

        <p className="mt-4 text-gray-600">
          Company: {company}
        </p>
        <WeeklyAvailability />
        <div className="mt-8">
          <label
            htmlFor="cover_letter"
            className="mb-2 block text-lg font-semibold"
          >
            Tell Us About Yourself
          </label>

          <p className="mb-3 text-sm text-gray-600">
            Why would you like to join our team?
            Tell us a little about your experience,
            interests, or what makes you a great fit.
          </p>

          <textarea
            id="cover_letter"
            name="cover_letter"
            rows={5}
            placeholder="I'd love to join your team because..."
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>
        <div className="mt-8 flex justify-end">



          <SubmitButton />



        </div>
      </ApplicationForm>
    </main>
  )
}