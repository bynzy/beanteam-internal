
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addHiringNote(formData: FormData) {
  const supabase = await createClient()

  // Verify the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to add hiring notes.')
  }

  // Validate submitted information
  const applicationId = String(
    formData.get('application_id') || ''
  ).trim()

  const note = String(formData.get('note') || '').trim()

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(applicationId)) {
    throw new Error('Invalid application ID.')
  }

  if (!note || note.length > 5000) {
    throw new Error('Hiring notes must contain 1–5000 characters.')
  }

  // RLS verifies company membership and author identity
  const { error } = await supabase
    .from('job_application_notes')
    .insert({
      application_id: applicationId,
      author_id: user.id,
      note,
    })

  if (error) {
    throw new Error('Unable to save hiring note.')
  }

  revalidatePath(`/recruiting/${applicationId}`)
}

export async function updateApplicationStatus(formData: FormData) {
    const supabase = await createClient()
  
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
  
    if (authError || !user) {
      throw new Error('You must be signed in to update an application.')
    }
  
    const applicationId = String(
      formData.get('application_id') || ''
    ).trim()
  
    const status = String(
      formData.get('status') || ''
    ).trim()
  
    const allowedStatuses = [
      'new',
      'reviewing',
      'interview',
      'not_hired',
      'offered',
      'hired',
      'withdrawn',
    ]
  
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(applicationId)) {
      throw new Error('Invalid application ID.')
    }
  
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid application status.')
    }
  
    // Verify company owner/admin access to this application
    const { data: application, error: lookupError } =
      await supabase
        .from('job_applications')
        .select('id, job_postings!inner(company_id)')
        .eq('id', applicationId)
        .maybeSingle()
  
    if (lookupError || !application) {
      throw new Error('Application not found or access denied.')
    }
  
    const posting = application.job_postings as unknown as {
      company_id: string
    } | null
  
    if (!posting) {
      throw new Error('Application has no associated company.')
    }
  
    const { data: membership, error: membershipError } =
      await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', posting.company_id)
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])
        .maybeSingle()
  
    if (membershipError || !membership) {
      throw new Error('You do not have permission to update this application.')
    }
  
    const { data: updatedApplication, error: updateError } =
      await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId)
        .select('id')
        .maybeSingle()
  
    if (updateError || !updatedApplication) {
      throw new Error('Unable to update application status.')
    }
  
    revalidatePath(`/recruiting/${applicationId}`)
    revalidatePath('/recruiting')
  }
  
