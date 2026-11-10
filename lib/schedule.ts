// lib/schedule.ts

export type ScheduleEmployee = {
    id: string
    first_name: string
    last_name: string
    email: string | null
  }
  
  export type ScheduleShift = {
    id: string
    employee_id: string
    starts_at: string
    ends_at: string
    role_label: string | null
    notes: string | null
    employee: ScheduleEmployee | null
  }
  
  export function getStartOfWeek(input?: string) {
    const base = input ? new Date(`${input}T12:00:00`) : new Date()
    const day = base.getDay() // 0 = Sun, 1 = Mon
    const diff = day === 0 ? -6 : 1 - day
  
    const start = new Date(base)
    start.setDate(base.getDate() + diff)
    start.setHours(0, 0, 0, 0)
    return start
  }
  
  export function getEndOfWeek(weekStart: Date) {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 7)
    return end
  }
  
  export function getWeekDates(weekStart: Date) {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })
  }
  
  export function toDateInputValue(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  export function formatWeekRange(weekStart: Date) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
  
    const startLabel = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  
    const endLabel = weekEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  
    return `${startLabel} – ${endLabel}`
  }
  
  export function formatDayLabel(date: Date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
    })
  }
  
  export function formatDayNumber(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
  
  export function formatTimeRange(startsAt: string, endsAt: string) {
    const start = new Date(startsAt)
    const end = new Date(endsAt)
  
    const startLabel = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  
    const endLabel = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  
    return `${startLabel} – ${endLabel}`
  }
  
  export function isSameLocalDay(date: Date, iso: string) {
    const value = new Date(iso)
    return (
      value.getFullYear() === date.getFullYear() &&
      value.getMonth() === date.getMonth() &&
      value.getDate() === date.getDate()
    )
  }
  
  export function groupShiftsByDay(weekDates: Date[], shifts: ScheduleShift[]) {
    return weekDates.map((date) => ({
      date,
      shifts: shifts.filter((shift) => isSameLocalDay(date, shift.starts_at)),
    }))
  }
  export function getShiftHours(startsAt: string, endsAt: string) {
    const start = new Date(startsAt)
    const end = new Date(endsAt)
  
    const diffMs = end.getTime() - start.getTime()
    const hours = diffMs / 1000 / 60 / 60
  
    return Math.max(0, hours)
  }
  
  export function formatShiftHours(hours: number) {
    if (hours === 1) return '1 hr'
    if (Number.isInteger(hours)) return `${hours} hrs`
    return `${hours.toFixed(1)} hrs`
  }