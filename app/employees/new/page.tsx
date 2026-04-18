import { addEmployee } from '@/app/employees/actions'

export default function NewEmployeePage() {
  return (
    <main className="p-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Add Employee</h1>

      <form action={addEmployee} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            name="first_name"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            name="last_name"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Job Title</label>
          <input
            name="job_title"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Home Address</label>
          <input
            name="home_address"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Cell Phone</label>
          <input
            name="cell_phone"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Hire Date</label>
          <input
            name="hire_date"
            type="date"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Work Anniversary Date</label>
          <input
            name="anniversary_date"
            type="date"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            name="notes"
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black text-white px-4 py-2"
        >
          Save Employee
        </button>
      </form>
    </main>
  )
}