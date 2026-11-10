// components/schedule/shift-card.tsx

import {
  formatTimeRange,
  getShiftHours,
  formatShiftHours,
  ScheduleShift,
} from '@/lib/schedule'
import { toDateFieldValue, toTimeFieldValue } from '@/lib/schedule-time'
import ShiftFormModal from './shift-form-modal'
import { deleteShift, updateShift } from '@/app/(internal)/schedule/actions'
import DeleteShiftButton from './delete-shift-button'

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

type Props = {
  shift: ScheduleShift
  employees: Employee[]
  week: string
}

export default function ShiftCard({ shift, employees, week }: Props) {
  const employeeName = shift.employee
    ? `${shift.employee.first_name} ${shift.employee.last_name}`
    : 'Unknown employee'

  const hours = getShiftHours(shift.starts_at, shift.ends_at)

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{employeeName}</p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {formatTimeRange(shift.starts_at, shift.ends_at)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatShiftHours(hours)}
          </p>
        </div>

        {shift.role_label ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {shift.role_label}
          </span>
        ) : null}
      </div>

      {shift.notes ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="line-clamp-2 text-xs leading-5 text-slate-500">
            {shift.notes}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <ShiftFormModal
          title="Edit Shift"
          triggerLabel="Edit"
          week={week}
          employees={employees}
          action={updateShift}
          submitLabel="Save Changes"
          initialValues={{
            shiftId: shift.id,
            employeeId: shift.employee_id,
            date: toDateFieldValue(shift.starts_at),
            startTime: toTimeFieldValue(shift.starts_at),
            endTime: toTimeFieldValue(shift.ends_at),
            roleLabel: shift.role_label || '',
            notes: shift.notes || '',
          }}
          triggerClassName="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        />

        <form action={deleteShift}>
          <input type="hidden" name="shiftId" value={shift.id} />
          <input type="hidden" name="week" value={week} />
          <DeleteShiftButton />
        </form>
      </div>
    </div>
  )
}