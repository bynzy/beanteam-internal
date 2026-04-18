import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

    return (
        <main className="p-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Employees</h1>
            <Link
              href="/employees/new"
              className="rounded bg-black px-4 py-2 text-white"
            >
              Add Employee
            </Link>
          </div>

      {error && <p className="text-red-500">Error loading employees</p>}

      {!employees || employees.length === 0 ? (
        <p>No employees yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Job Title</th>
              <th className="p-2 text-left">Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="p-2">
                  <Link href={`/employees/${emp.id}`} className="underline">
                    {emp.first_name} {emp.last_name}
                  </Link> 
                </td>
               
                <td className="p-2">{emp.cell_phone}</td>
                <td className="p-2">{emp.email}</td>
                <td className="p-2">{emp.job_title}</td>
                <td className="p-2">{emp.hire_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}