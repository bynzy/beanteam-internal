import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateEmployee } from '../../actions'

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !employee) {
    notFound()
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400'

  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1'

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-500">Employee Profile</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Edit Employee
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update employee contact, employment, and notes information.
        </p>
      </div>

      <form
        action={updateEmployee}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="id" value={employee.id} />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              name="first_name"
              defaultValue={employee.first_name}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Last Name</label>
            <input
              name="last_name"
              defaultValue={employee.last_name}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Job Title</label>
          <input
            name="job_title"
            defaultValue={employee.job_title || ''}
            className={fieldClass}
          />
        </div>
        <div>
  <label className={labelClass}>Status</label>
  <select
    name="is_active"
    defaultValue={employee.is_active ? 'true' : 'false'}
    className={fieldClass}
  >
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select>
</div>
        <div>
          <label className={labelClass}>Home Address</label>
          <input
            name="home_address"
            defaultValue={employee.home_address || ''}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Cell Phone</label>
            <input
              name="cell_phone"
              defaultValue={employee.cell_phone || ''}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={employee.email || ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Hire Date</label>
            <input
              type="date"
              name="hire_date"
              defaultValue={employee.hire_date || ''}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Anniversary Date</label>
            <input
              type="date"
              name="anniversary_date"
              defaultValue={employee.anniversary_date || ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            defaultValue={employee.notes || ''}
            rows={5}
            className={fieldClass}
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  )
}