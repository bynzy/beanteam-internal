// components/schedule/shift-form-modal.tsx

'use client'

import { useState } from 'react'
import ShiftForm from './shift-form'

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
  title: string
  triggerLabel: string
  week: string
  employees: Employee[]
  action: (formData: FormData) => void
  initialValues?: InitialValues
  submitLabel: string
  triggerClassName?: string
}

export default function ShiftFormModal({
  title,
  triggerLabel,
  week,
  employees,
  action,
  initialValues,
  submitLabel,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ||
          'inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800'
        }
      >
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                <p className="text-sm text-neutral-500">
                  Fill out the shift details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 max-h-[calc(90vh-80px)]">
              <ShiftForm
                week={week}
                employees={employees}
                action={action}
                initialValues={initialValues}
                submitLabel={submitLabel}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}