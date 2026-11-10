// components/schedule/shift-form.tsx

'use client'



type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

type InitialValues = {
  shiftId?: string
  employeeId?: string
  date?: string
  startTime?: string
  endTime?: string
  roleLabel?: string
  notes?: string
}

type Props = {
  employees: Employee[]
  week: string
  action: (formData: FormData) => void
  initialValues?: InitialValues
  submitLabel: string
}

export default function ShiftForm({
  employees,
  week,
  action,
  initialValues,
  submitLabel,
}: Props) {
  return (
    <form action={action} className="space-y-4">
      {initialValues?.shiftId ? (
        <input type="hidden" name="shiftId" value={initialValues.shiftId} />
      ) : null}

      <input type="hidden" name="week" value={week} />

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Employee
        </label>
        <select
          name="employeeId"
          defaultValue={initialValues?.employeeId || ''}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          required
        >
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Date
        </label>
        <input
          type="date"
          name="date"
          defaultValue={initialValues?.date || ''}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Start time
          </label>
          <input
            type="time"
            name="startTime"
            defaultValue={initialValues?.startTime || ''}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            End time
          </label>
          <input
            type="time"
            name="endTime"
            defaultValue={initialValues?.endTime || ''}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Role label
        </label>
        <input
          type="text"
          name="roleLabel"
          defaultValue={initialValues?.roleLabel || ''}
          placeholder="Barista, Lead, Manager on Duty"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={initialValues?.notes || ''}
          rows={4}
          placeholder="Optional notes for this shift"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </div>

      <div className="flex justify-end">
  <button
    type="submit"
    style={{
      backgroundColor: '#2563eb',
      color: '#ffffff',
      padding: '10px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
    }}
  >
    {submitLabel}
  </button>
</div>
    </form>
  )
}