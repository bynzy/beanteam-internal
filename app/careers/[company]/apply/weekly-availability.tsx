
'use client'

import { useState } from 'react'

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
]

const weekends = ['Saturday', 'Sunday']

const weekdayShifts = [
  '7 AM - 12 PM',
  '12 PM - 4 PM',
  '4 PM - 8 PM',
]

const weekendShifts = [
  '9 AM - 1 PM',
  '12 PM - 4 PM',
  '4 PM - 8 PM',
]

export default function WeeklyAvailability() {
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])

  const toggleShift = (day: string, shift: string) => {
    const key = `${day}|${shift}`

    setSelectedShifts((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    )
  }

  const renderDay = (day: string, shifts: string[]) => (
    <div key={day} className="border-b py-4 last:border-b-0">
      <h3 className="mb-3 font-medium">{day}</h3>

      <div className="grid gap-3 sm:grid-cols-3">
        {shifts.map((shift) => {
          const key = `${day}|${shift}`
          const checked = selectedShifts.includes(key)

          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${
                checked
                  ? 'border-amber-500 bg-amber-50 text-gray-900'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                name="weekly_availability"
                value={key}
                checked={checked}
                onChange={() => toggleShift(day, shift)}
                className="h-4 w-4 accent-amber-600"
              />

              <span>{shift}</span>
            </label>
          )
        })}
      </div>
    </div>
  )

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-2xl font-semibold">
        Weekly Availability
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        Select all shifts you are available to work.
        You may select multiple shifts per day.
      </p>

      <div className="rounded-xl border p-5">
        {weekdays.map((day) => renderDay(day, weekdayShifts))}
        {weekends.map((day) => renderDay(day, weekendShifts))}
      </div>
    </section>
  )
}
