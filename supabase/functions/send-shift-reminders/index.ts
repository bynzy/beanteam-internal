import { createClient } from 'jsr:@supabase/supabase-js@2'
import { formatInTimeZone } from 'npm:date-fns-tz'

const BUSINESS_TIME_ZONE = 'America/Los_Angeles'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const reminderFromEmail = Deno.env.get('REMINDER_FROM_EMAIL')

  if (!resendApiKey || !reminderFromEmail) {
    return new Response(
      JSON.stringify({ error: 'Missing email secrets' }),
      { status: 500 }
    )
  }

  const { data: reminders, error } = await supabase
    .from('shift_reminders')
    .select(`
      id,
      shift_id,
      scheduled_for,
      shifts:shift_id (
        id,
        starts_at,
        ends_at,
        employee:employees (
          id,
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  for (const reminder of reminders ?? []) {
    const shift = Array.isArray(reminder.shifts)
      ? reminder.shifts[0]
      : reminder.shifts

    const employee = shift?.employee

    if (!shift || !employee?.email) {
      await supabase
        .from('shift_reminders')
        .update({
          status: 'failed',
          error_message: 'Missing shift or employee email',
        })
        .eq('id', reminder.id)

      continue
    }

    const dateLabel = formatInTimeZone(
      shift.starts_at,
      BUSINESS_TIME_ZONE,
      'EEEE, MMMM d, yyyy'
    )

    const startLabel = formatInTimeZone(
      shift.starts_at,
      BUSINESS_TIME_ZONE,
      'h:mm a'
    )

    const endLabel = formatInTimeZone(
      shift.ends_at,
      BUSINESS_TIME_ZONE,
      'h:mm a'
    )

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Upcoming shift reminder</h2>
        <p>Hello ${employee.first_name},</p>
        <p>This is a reminder that you are scheduled to work in about 24 hours.</p>
        <p>
          <strong>Date:</strong> ${dateLabel}<br />
          <strong>Time:</strong> ${startLabel} – ${endLabel}
        </p>
        <p>Thank you,<br />Personns</p>
      </div>
    `

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: reminderFromEmail,
          to: [employee.email],
          subject: 'Shift reminder from Personns',
          html,
        }),
      })

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text()

        await supabase
          .from('shift_reminders')
          .update({
            status: 'failed',
            error_message: errorText,
          })
          .eq('id', reminder.id)

        continue
      }

      await supabase
        .from('shift_reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', reminder.id)
    } catch (err) {
      await supabase
        .from('shift_reminders')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
        })
        .eq('id', reminder.id)
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})