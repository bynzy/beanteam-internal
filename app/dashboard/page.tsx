import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function formatDate(dateString: string | null) {
  if (!dateString) return '—'

  const [year, month, day] = dateString.split('-')
  return `${Number(month)}/${Number(day)}/${year.slice(-2)}`
}

function getDaysUntil(dateString: string | null) {
  if (!dateString) return null

  const [year, month, day] = dateString.split('-').map(Number)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(year, month - 1, day)
  target.setHours(0, 0, 0, 0)

  const diffMs = target.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function formatTimeRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)

  return `${start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)

  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(todayStart.getDate() + 1)

  const thirtyDaysFromNow = new Date(todayStart)
  thirtyDaysFromNow.setDate(todayStart.getDate() + 30)

  const [{ data: employees }, { data: todayShifts }] = await Promise.all([
    supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        anniversary_date,
        is_active,
        employee_compliance (
          handbook_signed,
          nda_signed,
          food_handler_expiration_date
        )
      `),
    supabase
      .from('shifts')
      .select(`
        id,
        starts_at,
        ends_at,
        role_label,
        notes,
        employee:employees (
          id,
          first_name,
          last_name
        )
      `)
      .gte('starts_at', todayStart.toISOString())
      .lt('starts_at', tomorrowStart.toISOString())
      .order('starts_at', { ascending: true }),
  ])

  const activeEmployees = employees?.filter((emp) => emp.is_active).length ?? 0

  const missingHandbook =
    employees?.filter((emp) => !emp.employee_compliance?.[0]?.handbook_signed) ??
    []

  const missingNDA =
    employees?.filter((emp) => !emp.employee_compliance?.[0]?.nda_signed) ?? []

  const expiringFoodHandler =
    employees?.filter((emp) => {
      const expiration =
        emp.employee_compliance?.[0]?.food_handler_expiration_date

      if (!expiration) return false

      const [year, month, day] = expiration.split('-').map(Number)
      const expirationDate = new Date(year, month - 1, day)

      return expirationDate >= todayStart && expirationDate <= thirtyDaysFromNow
    }) ?? []

  const upcomingAnniversaries =
    employees?.filter((emp) => {
      if (!emp.anniversary_date) return false

      const [, month, day] = emp.anniversary_date.split('-').map(Number)

      const upcoming = new Date(today.getFullYear(), month - 1, day)

      if (upcoming < todayStart) {
        upcoming.setFullYear(today.getFullYear() + 1)
      }

      const diffMs = upcoming.getTime() - todayStart.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      return diffDays >= 0 && diffDays <= 30
    }) ?? []

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Personns
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Today at Hooked On Coffee
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Your daily people, schedule, and compliance command center.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/schedule"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                View Schedule
              </Link>

              <Link
                href="/employees"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                View Team
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Today’s Schedule
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Who is working today.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {todayShifts?.length ?? 0} shifts
              </span>
            </div>

            {!todayShifts || todayShifts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No shifts scheduled for today.
                </p>
                <Link
                  href="/schedule"
                  className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add Today’s Shift
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {todayShifts.map((shift: any) => {
                  const employee = Array.isArray(shift.employee)
                    ? shift.employee[0]
                    : shift.employee

                  return (
                    <li
                      key={shift.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {employee?.first_name} {employee?.last_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatTimeRange(shift.starts_at, shift.ends_at)}
                        </p>
                      </div>

                      {shift.role_label ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          {shift.role_label}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
            <div className="mt-5 space-y-3">
              <Link
                href="/schedule"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open weekly schedule →
              </Link>

              <Link
                href="/employees/new"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Add employee →
              </Link>

              <Link
                href="/employees"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Review team →
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/employees?status=active"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              Active Employees
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {activeEmployees}
            </p>
          </Link>

          <Link
            href="/employees?missing=handbook"
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              Missing Handbook
            </p>
            <p className="mt-3 text-3xl font-bold text-red-600">
              {missingHandbook.length}
            </p>
          </Link>

          <Link
            href="/employees?missing=nda"
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">Missing NDA</p>
            <p className="mt-3 text-3xl font-bold text-red-600">
              {missingNDA.length}
            </p>
          </Link>

          <Link
            href="/employees?cert=expiring"
            className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              Food Handler Expiring
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-600">
              {expiringFoodHandler.length}
            </p>
          </Link>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">
                Food Handler Expiring
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {expiringFoodHandler.length} soon
              </span>
            </div>

            {expiringFoodHandler.length === 0 ? (
              <p className="text-sm text-slate-500">
                No certificates expiring in the next 30 days.
              </p>
            ) : (
              <ul className="space-y-3">
                {expiringFoodHandler.map((emp) => {
                  const expiration =
                    emp.employee_compliance?.[0]
                      ?.food_handler_expiration_date ?? null
                  const daysLeft = getDaysUntil(expiration)

                  return (
                    <li
                      key={emp.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          {emp.first_name} {emp.last_name}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          Expires {formatDate(expiration)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-amber-700">
                        {daysLeft === 0
                          ? 'Today'
                          : daysLeft === 1
                          ? '1 day'
                          : `${daysLeft} days`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">
                Upcoming Anniversaries
              </h2>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {upcomingAnniversaries.length} upcoming
              </span>
            </div>

            {upcomingAnniversaries.length === 0 ? (
              <p className="text-sm text-slate-500">
                No anniversaries in the next 30 days.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcomingAnniversaries.map((emp) => (
                  <li
                    key={emp.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <Link
                      href={`/employees/${emp.id}`}
                      className="font-medium text-blue-600 underline hover:text-blue-800"
                    >
                      {emp.first_name} {emp.last_name}
                    </Link>
                    <span className="text-sm text-slate-500">
                      {formatDate(emp.anniversary_date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}