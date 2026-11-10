// components/schedule/week-grid.tsx

import { groupShiftsByDay, ScheduleShift, toDateInputValue } from '@/lib/schedule'
import DayColumn from './day-column'

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

type Props = {
  weekDates: Date[]
  shifts: ScheduleShift[]
  employees: Employee[]
}

export default function WeekGrid({ weekDates, shifts, employees }: Props) {
  const days = groupShiftsByDay(weekDates, shifts)
  const week = toDateInputValue(weekDates[0])

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
      {days.map((day) => (
        <DayColumn
          key={day.date.toISOString()}
          date={day.date}
          shifts={day.shifts}
          employees={employees}
          week={week}
        />
      ))}
    </div>
  )
}