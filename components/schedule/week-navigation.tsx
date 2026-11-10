// components/schedule/week-navigation.tsx

import Link from 'next/link'
import { formatWeekRange, toDateInputValue } from '@/lib/schedule'
import ShiftFormModal from './shift-form-modal'
import { createShift } from '@/app/schedule/actions'
import { copyPreviousWeek } from '@/app/schedule/actions'

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

type Props = {
  weekStart: Date
  employees: Employee[]
}

export default function WeekNavigation({ weekStart, employees }: Props) {
  const prevWeek = new Date(weekStart)
  prevWeek.setDate(prevWeek.getDate() - 7)

  const nextWeek = new Date(weekStart)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const currentWeek = new Date()
  const currentWeekStart = new Date(currentWeek)
  const day = currentWeekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  currentWeekStart.setDate(currentWeekStart.getDate() + diff)
  currentWeekStart.setHours(0, 0, 0, 0)

  const week = toDateInputValue(weekStart)

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Weekly Schedule
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Schedule
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {formatWeekRange(weekStart)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/schedule?week=${toDateInputValue(prevWeek)}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Previous
          </Link>

          <Link
            href={`/schedule?week=${toDateInputValue(currentWeekStart)}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Current Week
          </Link>

          <Link
            href={`/schedule?week=${toDateInputValue(nextWeek)}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Next →
          </Link>

          <ShiftFormModal
            title="Add Shift"
            triggerLabel="+ Add Shift"
            week={week}
            employees={employees}
            action={createShift}
            submitLabel="Create Shift"
            triggerClassName="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          />
          <form action={copyPreviousWeek}>
  <input type="hidden" name="week" value={week} />
  <button
    type="submit"
    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
  >
    Copy Previous Week
  </button>
</form>
        </div>
      </div>
    </div>
  )
}