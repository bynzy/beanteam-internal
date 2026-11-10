// app/schedule/page.tsx

import WeekGrid from '@/components/schedule/week-grid'
import WeekNavigation from '@/components/schedule/week-navigation'
import {
  getEndOfWeek,
  getStartOfWeek,
  getWeekDates,
  ScheduleShift,
} from '@/lib/schedule'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  searchParams: Promise<{ week?: string; success?: string; error?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const params = await searchParams
  const weekStart = getStartOfWeek(params.week)
  const weekEnd = getEndOfWeek(weekStart)
  const weekDates = getWeekDates(weekStart)

  const supabase = await createClient()

  const [{ data: shiftsData, error: shiftsError }, { data: employeesData, error: employeesError }] =
    await Promise.all([
      supabase
        .from('shifts')
        .select(`
          id,
          employee_id,
          starts_at,
          ends_at,
          role_label,
          notes,
          employee:employees (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .gte('starts_at', weekStart.toISOString())
        .lt('starts_at', weekEnd.toISOString())
        .order('starts_at', { ascending: true }),
      supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true }),
    ])

  if (shiftsError) {
    throw new Error(`Failed to load schedule: ${shiftsError.message}`)
  }

  if (employeesError) {
    throw new Error(`Failed to load employees: ${employeesError.message}`)
  }

  const shifts = (shiftsData ?? []) as unknown as ScheduleShift[]
  const employees = employeesData ?? []

  return (
    <div className="space-y-6">
      {params.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {params.success}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      <WeekNavigation weekStart={weekStart} employees={employees} />
      <WeekGrid weekDates={weekDates} shifts={shifts} employees={employees} />
    </div>
  )
}