
import { createClient } from '@/lib/supabase/server'

type CareersPageProps = {
  params: Promise<{ company: string }>
}

export default async function CareersPage({
  params,
}: CareersPageProps) {
  const { company } = await params
  const supabase = await createClient()

  // Look up the company using its URL slug.
  const {
    data: companyRecord,
    error: companyError,
  } = await supabase
    .from('companies')
    .select('id, name')
    .eq('slug', company)
    .single()

  // Temporary debugging for the company lookup.
  console.log('CAREERS COMPANY DEBUG:', {
    company,
    companyRecord,
    companyError,
  })

  if (companyError) {
    throw new Error(
      `Company lookup failed: ${companyError.message}`
    )
  }

  // Retrieve published jobs for this company.
  const {
    data: jobs,
    error: jobsError,
  } = await supabase
    .from('job_postings')
    .select(
      'id, title, description, location, employment_type'
    )
    .eq('company_id', companyRecord.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Temporary debugging for the jobs lookup.
  console.log('CAREERS JOBS DEBUG:', {
    jobs,
    jobsError,
  })

  if (jobsError) {
    throw new Error(
      `Job lookup failed: ${jobsError.message}`
    )
  }

  const companyName = companyRecord.name

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
        Powered by Personns
      </p>

      <h1 className="mb-4 text-4xl font-bold">
        Careers at {companyName}
      </h1>

      <p className="mb-8 text-lg text-gray-600">
        Great teams start with great people.
        Explore career opportunities and grow with us.
      </p>

      <section className="rounded-xl border p-8">
        <h2 className="mb-6 text-2xl font-semibold">
          Current Openings
        </h2>

        {jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-lg border p-5"
              >
                <h3 className="text-xl font-semibold">
                  {job.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {[
                    job.location,
                    job.employment_type,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                {job.description && (
                  <p className="mt-4 text-gray-600">
                    {job.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No current openings. Please check back soon.
          </p>
        )}
      </section>
    </main>
  )
}

