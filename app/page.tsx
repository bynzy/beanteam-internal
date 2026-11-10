import Link from "next/link";

const features = [
  {
    title: "Employee records in one place",
    description:
      "Keep employee details, documents, and compliance information organized in a clean, searchable workspace.",
  },
  {
    title: "Stay on top of compliance",
    description:
      "Track certificates, signed policies, and required items so nothing slips through the cracks.",
  },
  {
    title: "Scheduling, coming soon",
    description:
      "Create and manage employee schedules in the same system you use for records and compliance.",
  },
];

const steps = [
  {
    number: "01",
    title: "Add your team",
    description:
      "Create employee profiles with the details you need to manage your workforce clearly and consistently.",
  },
  {
    number: "02",
    title: "Upload documents",
    description:
      "Store handbooks, certificates, and other important files in each employee’s record.",
  },
  {
    number: "03",
    title: "Track compliance and scheduling",
    description:
      "Quickly see who is complete, what is missing, and soon manage schedules from the same polished workspace.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Background accents */}
      <div className="absolute inset-x-0 top-0 -z-10 overflow-hidden">
        <div className="mx-auto h-[420px] max-w-7xl">
          <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-[20%] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-[20px] h-[320px] w-[320px] -translate-x-[90%] rounded-full bg-violet-500/20 blur-3xl" />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 text-white shadow-sm">
              <span className="text-lg font-bold">P</span>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Personns</div>
              <div className="text-xs text-slate-500">
                Employee management, compliance, and scheduling
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#cta" className="text-sm text-slate-600 hover:text-slate-900">
              Get started
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:inline-flex"
            >
              View dashboard
            </Link>
            <Link
              href="/employees"
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              Built for organized operators
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Employee management that keeps your team
              <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                clear, compliant, and on schedule
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Personns helps you manage employee records, documents, compliance
              requirements, and soon scheduling, in one polished, easy-to-use
              system.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/employees"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Launch Personns
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Explore features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <div>✓ Employee records</div>
              <div>✓ Document storage</div>
              <div>✓ Compliance tracking</div>
              <div>✓ Scheduling soon</div>
            </div>
          </div>

          {/* Visual card */}
          <div className="relative">
            <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Team Overview</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      Compliance at a glance
                    </h3>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 px-3 py-1 text-xs font-semibold text-white">
                    Live
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Maria Gomez</p>
                        <p className="text-sm text-slate-500">Food Handler Certificate</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Complete
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Kevin Ramirez</p>
                        <p className="text-sm text-slate-500">Signed handbook</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Sofia Martinez</p>
                        <p className="text-sm text-slate-500">I-9 and ID documents</p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        Missing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
                    <div className="text-2xl font-semibold text-slate-950">24</div>
                    <div className="mt-1 text-xs text-slate-500">Employees</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
                    <div className="text-2xl font-semibold text-slate-950">19</div>
                    <div className="mt-1 text-xs text-slate-500">Complete</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
                    <div className="text-2xl font-semibold text-slate-950">5</div>
                    <div className="mt-1 text-xs text-slate-500">Need follow-up</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
              <p className="text-xs font-medium text-slate-500">Operations visibility</p>
              <p className="text-sm font-semibold text-slate-900">
                Records, compliance, and scheduling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            Built for business owners who want cleaner records, clearer follow-up,
            better compliance, and scheduling in one system.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Built for real-world employee management
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Personns gives you a practical, polished workspace for managing employee
            files, compliance, and soon scheduling, with clarity.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 text-white shadow-sm">
                <span className="text-base font-bold">P</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple flow. Strong control.
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Personns is designed to help operators move fast while staying organized.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="text-sm font-semibold text-cyan-300">{step.number}</div>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-8 shadow-sm sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
              Ready to organize your team?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Bring employee records, compliance, and scheduling into one clear system.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Personns helps you manage what matters without the clutter, confusion,
              or spreadsheet chaos.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/employees"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Personns
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <span className="font-semibold text-slate-700">Personns</span> — Employee
            management, compliance, and scheduling simplified.
          </div>
          <div>© 2026 Personns. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
           