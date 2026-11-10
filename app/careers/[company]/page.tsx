
type CareersPageProps = {
    params: Promise<{ company: string }>
  }
  
  export default async function CareersPage({
    params,
  }: CareersPageProps) {
    const { company } = await params
  
    const companyName =
      company === 'hooked-on-coffee'
        ? 'Hooked On Coffee'
        : company.replace(/-/g, ' ')
  
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
          <h2 className="mb-3 text-2xl font-semibold">
            Current Openings
          </h2>
  
          <p className="text-gray-600">
            Job opportunities will appear here soon.
          </p>
        </section>
      </main>
    )
  }
  