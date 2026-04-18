import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  saveCompliance,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from '@/app/employees/actions'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    <main className="p-10 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="mt-2 text-gray-600">
              {employee.job_title || 'No job title'}
            </p>
          </div>

          <Link href="/employees" className="underline">
            Back to Employees
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href={`/employees/${employee.id}/edit`}
            className="text-blue-600 underline"
          >
            Edit Employee
          </Link>
        </div>
      </div>

      <div className="space-y-4 rounded border p-6">
        <div>
          <p className="text-sm text-gray-500">Home Address</p>
          <p>{employee.home_address || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Cell Phone</p>
          <p>{employee.cell_phone || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{employee.email || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Hire Date</p>
          <p>{employee.hire_date || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Work Anniversary</p>
          <p>{employee.anniversary_date || '—'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Notes</p>
          <p>{employee.notes || '—'}</p>
        </div>
      </div>

      <div className="mt-8 rounded border p-6">
        <h2 className="mb-4 text-2xl font-bold">Compliance</h2>

        <form action={saveCompliance} className="space-y-4">
          <input type="hidden" name="employee_id" value={employee.id} />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="handbook_signed"
              defaultChecked={compliance?.handbook_signed ?? false}
            />
            <label>Signed Handbook</label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Handbook Signed Date
            </label>
            <input
              type="date"
              name="handbook_signed_date"
              defaultValue={compliance?.handbook_signed_date || ''}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="nda_signed"
              defaultChecked={compliance?.nda_signed ?? false}
            />
            <label>Signed NDA</label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              NDA Signed Date
            </label>
            <input
              type="date"
              name="nda_signed_date"
              defaultValue={compliance?.nda_signed_date || ''}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="food_handler_current"
              defaultChecked={compliance?.food_handler_current ?? false}
            />
            <label>Current Food Handler Certificate</label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Food Handler Issue Date
            </label>
            <input
              type="date"
              name="food_handler_issue_date"
              defaultValue={compliance?.food_handler_issue_date || ''}
              className="w-full rounded border px-3 py-2"
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
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button className="rounded bg-black px-4 py-2 text-white">
            Save Compliance
          </button>
        </form>
      </div>

      <div className="mt-8 rounded border p-6">
        <h2 className="mb-4 text-2xl font-bold">Documents</h2>

        <form action={uploadEmployeeDocument} className="space-y-4">
          <input type="hidden" name="employee_id" value={employee.id} />

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Document Type
            </label>
            <select
              name="document_type"
              className="w-full rounded border px-3 py-2"
              defaultValue="other"
            >
              <option value="resume">Resume</option>
              <option value="corrective_action">Corrective Action</option>
              <option value="signed_handbook">Signed Handbook</option>
              <option value="signed_nda">Signed NDA</option>
              <option value="food_handler_certificate">Food Handler Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Notes</label>
            <input
              name="notes"
              className="w-full rounded border px-3 py-2"
              placeholder="Optional note"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Choose File</label>
            <input
              type="file"
              name="file"
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <button className="rounded bg-black px-4 py-2 text-white">
            Upload Document
          </button>
        </form>

        <div className="mt-8">
          <h3 className="mb-3 text-lg font-semibold">Uploaded Documents</h3>

          {documentsWithUrls.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">File Name</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2 text-left">Uploaded</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {documentsWithUrls.map((doc: any) => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-2">{doc.document_type}</td>
                    <td className="p-2">
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {doc.file_name}
                      </a>
                    </td>
                    <td className="p-2">{doc.notes || '—'}</td>
                    <td className="p-2">{doc.uploaded_at || '—'}</td>
<td className="p-2">
  <form action={deleteEmployeeDocument}>
    <input type="hidden" name="document_id" value={doc.id} />
    <input type="hidden" name="employee_id" value={employee.id} />
    <button
      type="submit"
      className="text-red-600 underline"
    >
      Delete
    </button>
  </form>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}