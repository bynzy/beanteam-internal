// app/schedule/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildShiftDateTimes } from '@/lib/schedule-time'

function buildScheduleRedirect(
  week: string,
  params: { success?: string; error?: string }
) {
  const search = new URLSearchParams()

  if (week) search.set('week', week)
  if (params.success) search.set('success', params.success)
  if (params.error) search.set('error', params.error)

  return `/schedule?${search.toString()}`
}

async function upsertShiftReminder(
  shiftId: string,
  startsAtIso: string,
  week: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const reminderAt = new Date(startsAtIso)
  reminderAt.setHours(reminderAt.getHours() - 24)

  if (reminderAt <= new Date()) {
    await supabase
      .from('shift_reminders')
      .delete()
      .eq('shift_id', shiftId)
      .eq('reminder_type', 'shift_24h_email')

    return
  }

  const { error } = await supabase
    .from('shift_reminders')
    .upsert(
      {
        shift_id: shiftId,
        reminder_type: 'shift_24h_email',
        scheduled_for: reminderAt.toISOString(),
        status: 'pending',
        sent_at: null,
        error_message: null,
      },
      {
        onConflict: 'shift_id,reminder_type',
      }
    )

  if (error) {
    redirect(
      buildScheduleRedirect(week, {
        error: `Reminder could not be scheduled: ${error.message}`,
      })
    )
  }
}

export async function createShift(formData: FormData) {
  const supabase = await createClient()

  const week = String(formData.get('week') || '')
  const employeeId = String(formData.get('employeeId') || '')
  const date = String(formData.get('date') || '')
  const startTime = String(formData.get('startTime') || '')
  const endTime = String(formData.get('endTime') || '')
  const roleLabel = String(formData.get('roleLabel') || '')
  const notes = String(formData.get('notes') || '')

  if (!employeeId || !date || !startTime || !endTime) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'Employee, date, start time, and end time are required.',
      })
    )
  }

  const { startsAt, endsAt } = buildShiftDateTimes(date, startTime, endTime)

  if (!(endsAt > startsAt)) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'End time must be after start time.',
      })
    )
  }

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, email')
    .eq('id', employeeId)
    .single()

  if (employeeError || !employee) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'Employee not found.',
      })
    )
  }

  if (!employee.email) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'This employee needs an email address before scheduling reminders.',
      })
    )
  }

  const { data: conflicts, error: conflictError } = await supabase
    .from('shifts')
    .select('id, starts_at, ends_at')
    .eq('employee_id', employeeId)
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())

  if (conflictError) {
    redirect(
      buildScheduleRedirect(week, {
        error: conflictError.message,
      })
    )
  }

  if (conflicts && conflicts.length > 0) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'This employee already has an overlapping shift.',
      })
    )
  }

  const { data: insertedShift, error: insertError } = await supabase
    .from('shifts')
    .insert({
      employee_id: employeeId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      role_label: roleLabel || null,
      notes: notes || null,
    })
    .select('id, starts_at')
    .single()

  if (insertError || !insertedShift) {
    redirect(
      buildScheduleRedirect(week, {
        error: insertError?.message || 'Failed to create shift.',
      })
    )
  }

  await upsertShiftReminder(insertedShift.id, insertedShift.starts_at, week, supabase)

  revalidatePath('/schedule')
  redirect(
    buildScheduleRedirect(week, {
      success: 'Shift created successfully.',
    })
  )
}

export async function updateShift(formData: FormData) {
  const supabase = await createClient()

  const week = String(formData.get('week') || '')
  const shiftId = String(formData.get('shiftId') || '')
  const employeeId = String(formData.get('employeeId') || '')
  const date = String(formData.get('date') || '')
  const startTime = String(formData.get('startTime') || '')
  const endTime = String(formData.get('endTime') || '')
  const roleLabel = String(formData.get('roleLabel') || '')
  const notes = String(formData.get('notes') || '')

  if (!shiftId || !employeeId || !date || !startTime || !endTime) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'Missing required fields.',
      })
    )
  }

  const { startsAt, endsAt } = buildShiftDateTimes(date, startTime, endTime)

  if (!(endsAt > startsAt)) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'End time must be after start time.',
      })
    )
  }

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, email')
    .eq('id', employeeId)
    .single()

  if (employeeError || !employee) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'Employee not found.',
      })
    )
  }

  if (!employee.email) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'This employee needs an email address before scheduling reminders.',
      })
    )
  }

  const { data: conflicts, error: conflictError } = await supabase
    .from('shifts')
    .select('id')
    .eq('employee_id', employeeId)
    .neq('id', shiftId)
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())

  if (conflictError) {
    redirect(
      buildScheduleRedirect(week, {
        error: conflictError.message,
      })
    )
  }

  if (conflicts && conflicts.length > 0) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'This employee already has an overlapping shift.',
      })
    )
  }

  const { data: updatedShift, error: updateError } = await supabase
    .from('shifts')
    .update({
      employee_id: employeeId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      role_label: roleLabel || null,
      notes: notes || null,
    })
    .eq('id', shiftId)
    .select('id, starts_at')
    .single()

  if (updateError || !updatedShift) {
    redirect(
      buildScheduleRedirect(week, {
        error: updateError?.message || 'Failed to update shift.',
      })
    )
  }

  await upsertShiftReminder(updatedShift.id, updatedShift.starts_at, week, supabase)

  revalidatePath('/schedule')
  redirect(
    buildScheduleRedirect(week, {
      success: 'Shift updated successfully.',
    })
  )
}

export async function deleteShift(formData: FormData) {
  const supabase = await createClient()

  const week = String(formData.get('week') || '')
  const shiftId = String(formData.get('shiftId') || '')

  if (!shiftId) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'Shift id is required.',
      })
    )
  }

  const { error } = await supabase.from('shifts').delete().eq('id', shiftId)

  if (error) {
    redirect(
      buildScheduleRedirect(week, {
        error: error.message,
      })
    )
  }

  revalidatePath('/schedule')
  redirect(
    buildScheduleRedirect(week, {
      success: 'Shift deleted successfully.',
    })
  )
}
export async function copyPreviousWeek(formData: FormData) {
  const supabase = await createClient()

  const week = String(formData.get('week') || '')

  if (!week) {
    redirect(
      buildScheduleRedirect('', {
        error: 'Week is required.',
      })
    )
  }

  const currentWeekStart = new Date(`${week}T00:00:00`)
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekStart.getDate() + 7)

  const previousWeekStart = new Date(currentWeekStart)
  previousWeekStart.setDate(currentWeekStart.getDate() - 7)

  const previousWeekEnd = new Date(currentWeekStart)

  const { data: previousShifts, error: previousError } = await supabase
    .from('shifts')
    .select('employee_id, starts_at, ends_at, role_label, notes')
    .gte('starts_at', previousWeekStart.toISOString())
    .lt('starts_at', previousWeekEnd.toISOString())
    .order('starts_at', { ascending: true })

  if (previousError) {
    redirect(
      buildScheduleRedirect(week, {
        error: previousError.message,
      })
    )
  }

  if (!previousShifts || previousShifts.length === 0) {
    redirect(
      buildScheduleRedirect(week, {
        error: 'No shifts found in the previous week.',
      })
    )
  }

  let copied = 0
  let skipped = 0

  for (const shift of previousShifts) {
    const newStartsAt = new Date(shift.starts_at)
    newStartsAt.setDate(newStartsAt.getDate() + 7)

    const newEndsAt = new Date(shift.ends_at)
    newEndsAt.setDate(newEndsAt.getDate() + 7)

    const { data: conflicts, error: conflictError } = await supabase
      .from('shifts')
      .select('id')
      .eq('employee_id', shift.employee_id)
      .lt('starts_at', newEndsAt.toISOString())
      .gt('ends_at', newStartsAt.toISOString())

    if (conflictError) {
      skipped++
      continue
    }

    if (conflicts && conflicts.length > 0) {
      skipped++
      continue
    }

    const { data: insertedShift, error: insertError } = await supabase
      .from('shifts')
      .insert({
        employee_id: shift.employee_id,
        starts_at: newStartsAt.toISOString(),
        ends_at: newEndsAt.toISOString(),
        role_label: shift.role_label || null,
        notes: shift.notes || null,
      })
      .select('id, starts_at')
      .single()

    if (insertError || !insertedShift) {
      skipped++
      continue
    }

    await upsertShiftReminder(
      insertedShift.id,
      insertedShift.starts_at,
      week,
      supabase
    )

    copied++
  }

  revalidatePath('/schedule')

  redirect(
    buildScheduleRedirect(week, {
      success: `Copied ${copied} shift${copied === 1 ? '' : 's'} from previous week. ${
        skipped > 0 ? `Skipped ${skipped} due to conflicts or errors.` : ''
      }`,
    })
  )
}