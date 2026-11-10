import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EmployeeFilters from './employee-filters'
import { formatDateOnly } from "@/lib/format";

type SearchParams = Promise<{
  status?: string
  missing?: string
  cert?: string
  query?: string
}>

function buildEmployeesHref(
  currentParams: {
    status?: string
    missing?: string
    cert?: string
    query?: string
  },
  updates: {
    status?: string | null
    missing?: string | null
    cert?: string | null
    query?: string | null
  }
) {
  const params = new URLSearchParams()

  const nextStatus =
    updates.status === undefined ? currentParams.status : updates.status
  const nextMissing =
    updates.missing === undefined ? currentParams.missing : updates.missing
  const nextCert =
    updates.cert === undefined ? currentParams.cert : updates.cert
  const nextQuery =
    updates.query === undefined ? currentParams.query : updates.query

  if (nextStatus) params.set('status', nextStatus)
  if (nextMissing) params.set('missing', nextMissing)
  if (nextCert) params.set('cert', nextCert)
  if (nextQuery) params.set('query', nextQuery)

  const queryString = params.toString()
  return queryString ? `/employees?${queryString}` : '/employees'
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await createClient()

  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)

  const todayStr = today.toISOString().split('T')[0]
  const in30DaysStr = in30Days.toISOString().split('T')[0]

  let employeeQuery = supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status === 'active') {
    employeeQuery = employeeQuery.eq('is_active', true)
  }

  if (params.status === 'inactive') {
    employeeQuery = employeeQuery.eq('is_active', false)
  }

  if (params.query) {
    const q = params.query.trim()

    employeeQuery = employeeQuery.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,job_title.ilike.%${q}%`
    )
  }

  const { data: employees, error: employeesError } = await employeeQuery

  if (employeesError) {
    return (
      <main className="p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage employees and compliance records
            </p>
          </div>

          <Link
            href="/employees/new"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add Employee
          </Link>
        </div>

        <EmployeeFilters />

        <p className="mt-4 text-red-500">Error loading employees</p>
        <p className="mt-2 text-sm text-gray-500">{employeesError.message}</p>
      </main>
    )
  }

  const employeeIds = (employees ?? []).map((emp) => emp.id)

  let complianceRows: any[] = []
  let complianceError: any = null

  if (employeeIds.length > 0) {
    const complianceQuery = supabase
      .from('employee_compliance')
      .select(`
        employee_id,
        handbook_signed,
        handbook_signed_date,
        nda_signed,
        nda_signed_date,
        food_handler_current,
        food_handler_issue_date,
        food_handler_expiration_date
      `)
      .in('employee_id', employeeIds)

    const complianceResult = await complianceQuery
    complianceRows = complianceResult.data ?? []
    complianceError = complianceResult.error
  }

  if (complianceError) {
    return (
      <main className="p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage employees and compliance records
            </p>
          </div>

          <Link
            href="/employees/new"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add Employee
          </Link>
        </div>

        <EmployeeFilters />

        <p className="mt-4 text-red-500">Error loading compliance records</p>
        <p className="mt-2 text-sm text-gray-500">{complianceError.message}</p>
      </main>
    )
  }

  const complianceMap = new Map(
    complianceRows.map((row) => [row.employee_id, row])
  )

  let mergedEmployees = (employees ?? []).map((emp) => ({
    ...emp,
    compliance: complianceMap.get(emp.id) ?? null,
  }))

  if (params.missing === 'handbook') {
    mergedEmployees = mergedEmployees.filter(
      (emp) => !emp.compliance?.handbook_signed
    )
  }

  if (params.missing === 'nda') {
    mergedEmployees = mergedEmployees.filter(
      (emp) => !emp.compliance?.nda_signed
    )
  }

  if (params.cert === 'expiring') {
    mergedEmployees = mergedEmployees.filter((emp) => {
      const exp = emp.compliance?.food_handler_expiration_date
      return exp && exp >= todayStr && exp <= in30DaysStr
    })
  }

  return (
    <main className="p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employees and compliance records
          </p>
        </div>

        <Link
          href="/employees/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add Employee
        </Link>
      </div>

      <EmployeeFilters />

      {params.query && (
        <p className="mt-4 text-sm text-gray-600">
          Showing results for{' '}
          <span className="font-semibold">"{params.query}"</span>
        </p>
      )}

      {mergedEmployees.length === 0 ? (
        <p className="mt-4">No employees found.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Job Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Hire Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Handbook
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  NDA
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Food Handler Cert
                </th>
              </tr>
            </thead>
            <tbody>
              {mergedEmployees.map((emp) => {
                const compliance = emp.compliance
                const certDate = compliance?.food_handler_expiration_date
                const isExpiringSoon =
                  certDate && certDate >= todayStr && certDate <= in30DaysStr

                const activeHref = buildEmployeesHref(params, {
                  status: 'active',
                })
                const inactiveHref = buildEmployeesHref(params, {
                  status: 'inactive',
                })
                const handbookMissingHref = buildEmployeesHref(params, {
                  missing: 'handbook',
                })
                const ndaMissingHref = buildEmployeesHref(params, {
                  missing: 'nda',
                })
                const certExpiringHref = buildEmployeesHref(params, {
                  cert: 'expiring',
                })

                return (
                  <tr
                    key={emp.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 ${
                      isExpiringSoon ? 'bg-amber-100/70' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="font-medium text-blue-600 underline hover:text-blue-800"
                      >
                        {emp.first_name} {emp.last_name}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={emp.is_active ? activeHref : inactiveHref}
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${
                          emp.is_active
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : 'border-gray-200 bg-gray-100 text-gray-700'
                        }`}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </Link>
                    </td>

                    <td className="px-4 py-3">{emp.cell_phone}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.job_title}</td>
                    <td className="px-4 py-3">{formatDateOnly(emp.hire_date)}</td>

                    <td className="px-4 py-3">
                      {compliance?.handbook_signed ? (
                        <span className="inline-flex rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          Complete
                        </span>
                      ) : (
                        <Link
                          href={handbookMissingHref}
                          className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:opacity-80"
                        >
                          Missing
                        </Link>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {compliance?.nda_signed ? (
                        <span className="inline-flex rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          Complete
                        </span>
                      ) : (
                        <Link
                          href={ndaMissingHref}
                          className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:opacity-80"
                        >
                          Missing
                        </Link>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {certDate ? (
                        certDate >= todayStr && certDate <= in30DaysStr ? (
                          <Link
                            href={certExpiringHref}
                            className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:opacity-80"
                          >
                            Expiring
                          </Link>
                        ) : (
                          <span className="inline-flex rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                            Valid
                          </span>
                        )
                      ) : (
                        <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                          Missing
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}