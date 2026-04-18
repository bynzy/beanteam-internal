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

  return (
    <main className="p-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Employee</h1>

      <form action={updateEmployee} className="space-y-4">
        <input type="hidden" name="id" value={employee.id} />

        <input
          name="first_name"
          defaultValue={employee.first_name}
          className="w-full border p-2"
        />

        <input
          name="last_name"
          defaultValue={employee.last_name}
          className="w-full border p-2"
        />

        <input
          name="job_title"
          defaultValue={employee.job_title || ''}
          className="w-full border p-2"
        />

        <input
          name="home_address"
          defaultValue={employee.home_address || ''}
          className="w-full border p-2"
        />

        <input
          name="cell_phone"
          defaultValue={employee.cell_phone || ''}
          className="w-full border p-2"
        />

        <input
          name="email"
          defaultValue={employee.email || ''}
          className="w-full border p-2"
        />

        <input
          type="date"
          name="hire_date"
          defaultValue={employee.hire_date || ''}
          className="w-full border p-2"
        />

        <input
          type="date"
          name="anniversary_date"
          defaultValue={employee.anniversary_date || ''}
          className="w-full border p-2"
        />

        <textarea
          name="notes"
          defaultValue={employee.notes || ''}
          className="w-full border p-2"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </main>
  )
}