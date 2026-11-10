// components/schedule/day-column.tsx

import {
  formatDayLabel,
  formatDayNumber,
  formatShiftHours,
  getShiftHours,
  ScheduleShift,
  toDateInputValue,
} from '@/lib/schedule'
import ShiftCard from './shift-card'
import ShiftFormModal from './shift-form-modal'
import { createShift } from '@/app/schedule/actions'

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

type Props = {
  date: Date
  shifts: ScheduleShift[]
  employees: Employee[]
  week: string
}

export default function DayColumn({ date, shifts, employees, week }: Props) {
  const totalHours = shifts.reduce(
    (sum, shift) => sum + getShiftHours(shift.starts_at, shift.ends_at),
    0
  )

  return (
    <div className="flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-950">
              {formatDayLabel(date)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {formatDayNumber(date)}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}
            </span>

            <p className="mt-1 text-xs text-slate-400">
              {formatShiftHours(totalHours)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ShiftFormModal
            title="Add Shift"
            triggerLabel="+ Add"
            week={week}
            employees={employees}
            action={createShift}
            submitLabel="Create Shift"
            initialValues={{ date: toDateInputValue(date) }}
            triggerClassName="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-100"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-slate-50/70 p-3">
        {shifts.length === 0 ? (
          <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-400">
              No shifts scheduled
            </p>
          </div>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              employees={employees}
              week={week}
            />
          ))
        )}
      </div>
    </div>
  )
}