import WeeklyAvailability from './weekly-availability'
type ApplyPageProps = {
    params: Promise<{ company: string }>
  }
  
  export default async function ApplyPage({
    params,
  }: ApplyPageProps) {
    const { company } = await params
  
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
  
        <form className="rounded-xl border p-8">
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
        <button
          type="submit"
          disabled
          className="cursor-not-allowed rounded-lg bg-amber-600 px-8 py-3 font-semibold text-white opacity-60"
        >
          Submit Application
        </button>
      </div>
    </form>
      </main>
    )
  }