import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  saveCompliance,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from '@/app/(internal)/employees/actions'

function formatDate(dateString: string | null) {
  if (!dateString) return '—'

  const [year, month, day] = dateString.slice(0, 10).split('-')
  if (!year || !month || !day) return dateString

  return `${month}/${day}/${year.slice(-2)}`
}

function getBanner(message?: string) {
  switch (message) {
    case 'compliance-saved':
      return {
        text: 'Compliance information was saved successfully.',
        className: 'border-green-200 bg-green-50 text-green-800',
      }
    case 'document-uploaded':
      return {
        text: 'Document uploaded successfully.',
        className: 'border-green-200 bg-green-50 text-green-800',
      }
    case 'document-deleted':
      return {
        text: 'Document deleted successfully.',
        className: 'border-green-200 bg-green-50 text-green-800',
      }
    case 'compliance-error':
      return {
        text: 'There was a problem saving compliance information.',
        className: 'border-red-200 bg-red-50 text-red-800',
      }
    case 'document-upload-error':
      return {
        text: 'There was a problem uploading the document.',
        className: 'border-red-200 bg-red-50 text-red-800',
      }
    case 'document-delete-error':
      return {
        text: 'There was a problem deleting the document.',
        className: 'border-red-200 bg-red-50 text-red-800',
      }
    default:
      return null
  }
}

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const banner = getBanner(resolvedSearchParams.message)

  const supabase = await createClient()

  const { data: employee, error } = await supabase
    .from('employees')
    .select(`
      *,
      employee_compliance (
        handbook_signed,
        handbook_signed_date,
        nda_signed,
        nda_signed_date,
        food_handler_current,
        food_handler_issue_date,
        food_handler_expiration_date
      ),
      employee_documents (
        id,
        document_type,
        file_name,
        file_path,
        file_size,
        mime_type,
        notes,
        uploaded_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !employee) {
    notFound()
  }

  const compliance = employee.employee_compliance?.[0]

  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)

  const todayStr = today.toISOString().split('T')[0]
  const in30DaysStr = in30Days.toISOString().split('T')[0]

  const certDate = compliance?.food_handler_expiration_date || null
  const isExpiringSoon =
    certDate && certDate >= todayStr && certDate <= in30DaysStr

  const documentsWithUrls = await Promise.all(
    (employee.employee_documents || []).map(async (doc: any) => {
      const { data } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(doc.file_path, 60)

      return {
        ...doc,
        signedUrl: data?.signedUrl || '#',
      }
    })
  )

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {banner && (
          <div
            className={`rounded-2xl border p-4 text-sm font-medium shadow-sm ${banner.className}`}
          >
            {banner.text}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h1>

                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    employee.is_active
                      ? 'border-green-200 bg-green-100 text-green-800'
                      : 'border-gray-200 bg-gray-100 text-gray-700'
                  }`}
                >
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>

                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    compliance?.handbook_signed
                      ? 'border-green-200 bg-green-100 text-green-800'
                      : 'border-red-200 bg-red-100 text-red-800'
                  }`}
                >
                  Handbook {compliance?.handbook_signed ? 'Complete' : 'Missing'}
                </span>

                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    compliance?.nda_signed
                      ? 'border-green-200 bg-green-100 text-green-800'
                      : 'border-red-200 bg-red-100 text-red-800'
                  }`}
                >
                  NDA {compliance?.nda_signed ? 'Complete' : 'Missing'}
                </span>

                {certDate ? (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isExpiringSoon
                        ? 'border-amber-200 bg-amber-100 text-amber-800'
                        : 'border-green-200 bg-green-100 text-green-800'
                    }`}
                  >
                    Food Handler {isExpiringSoon ? 'Expiring' : 'Valid'}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                    Food Handler Missing
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-gray-500">
                {employee.job_title || 'No job title'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/employees"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to Team
              </Link>

              <Link
                href={`/employees/${employee.id}/edit`}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Edit Employee
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Employee Information
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Home Address
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.home_address || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cell Phone
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.cell_phone || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.email || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hire Date
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(employee.hire_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Work Anniversary
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(employee.anniversary_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                    {employee.notes || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Compliance</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Track signed documents and food handler certificate status.
                  </p>
                </div>
              </div>

              <form action={saveCompliance} className="space-y-5">
                <input type="hidden" name="employee_id" value={employee.id} />

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="handbook_signed"
                        defaultChecked={compliance?.handbook_signed ?? false}
                        className="h-4 w-4"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        Signed Handbook
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="mb-1 block text-sm text-gray-600">
                        Handbook Signed Date
                      </label>
                      <input
                        type="date"
                        name="handbook_signed_date"
                        defaultValue={compliance?.handbook_signed_date || ''}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="nda_signed"
                        defaultChecked={compliance?.nda_signed ?? false}
                        className="h-4 w-4"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        Signed NDA
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="mb-1 block text-sm text-gray-600">
                        NDA Signed Date
                      </label>
                      <input
                        type="date"
                        name="nda_signed_date"
                        defaultValue={compliance?.nda_signed_date || ''}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="food_handler_current"
                      defaultChecked={compliance?.food_handler_current ?? false}
                      className="h-4 w-4"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Current Food Handler Certificate
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Food Handler Issue Date
                      </label>
                      <input
                        type="date"
                        name="food_handler_issue_date"
                        defaultValue={compliance?.food_handler_issue_date || ''}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Food Handler Expiration Date
                      </label>
                      <input
                        type="date"
                        name="food_handler_expiration_date"
                        defaultValue={compliance?.food_handler_expiration_date || ''}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Save Compliance
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload and manage employee-related files.
                </p>
              </div>

              <form action={uploadEmployeeDocument} className="space-y-4">
                <input type="hidden" name="employee_id" value={employee.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Document Type
                    </label>
                    <select
                      name="document_type"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      defaultValue="other"
                    >
                      <option value="resume">Resume</option>
                      <option value="corrective_action">Corrective Action</option>
                      <option value="signed_handbook">Signed Handbook</option>
                      <option value="signed_nda">Signed NDA</option>
                      <option value="food_handler_certificate">
                        Food Handler Certificate
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Notes
                    </label>
                    <input
                      name="notes"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="Optional note"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Choose File
                  </label>
                  <input
                    type="file"
                    name="file"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                    required
                  />
                </div>

                <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Upload Document
                </button>
              </form>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Uploaded Documents
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {documentsWithUrls.length} total
                  </span>
                </div>

                {documentsWithUrls.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <table className="w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            File Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Uploaded
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentsWithUrls.map((doc: any) => (
                          <tr
                            key={doc.id}
                            className="border-t border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {doc.document_type}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={doc.signedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 underline hover:text-blue-800"
                              >
                                {doc.file_name}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {doc.notes || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatDate(doc.uploaded_at)}
                            </td>
                            <td className="px-4 py-3">
                              <form action={deleteEmployeeDocument}>
                                <input
                                  type="hidden"
                                  name="document_id"
                                  value={doc.id}
                                />
                                <input
                                  type="hidden"
                                  name="employee_id"
                                  value={employee.id}
                                />
                                <button
                                  type="submit"
                                  className="text-sm font-medium text-red-600 underline hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}