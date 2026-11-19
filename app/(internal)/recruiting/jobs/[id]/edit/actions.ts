'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateJobPosting(formData: FormData) {
    const supabase = await createClient()
  
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
  
    if (authError || !user) {
      redirect('/login')
    }

  const { data: memberships, error: membershipError } =
  await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])

if (membershipError) {
  throw new Error('Unable to verify company access.')
}

if (!memberships || memberships.length === 0) {
  throw new Error('You are not authorized to edit job postings.')
}

const jobId = String(formData.get('job_id') || '').trim()

if (!jobId) {
  throw new Error('Missing job posting ID.')
}

const authorizedCompanyIds = memberships.map(
  (membership) => membership.company_id
)

const { data: existingJob, error: jobError } = await supabase
  .from('job_postings')
  .select('id, company_id')
  .eq('id', jobId)
  .in('company_id', authorizedCompanyIds)
  .maybeSingle()

if (jobError) {
  throw new Error('Unable to verify job posting access.')
}

if (!existingJob) {
  throw new Error('Job posting not found or access denied.')
}

const title = String(formData.get('title') || '').trim()

if (title.length < 1 || title.length > 200) {
  throw new Error('Job title must be between 1 and 200 characters.')
}

const description = String(
  formData.get('description') || ''
).trim()

if (description.length > 10000) {
  throw new Error(
    'Job description cannot exceed 10,000 characters.'
  )
}

const location = String(formData.get('location') || '').trim()

if (location.length > 200) {
  throw new Error(
    'Job location cannot exceed 200 characters.'
  )
}

const employmentType = String(
  formData.get('employment_type') || ''
).trim()

const allowedEmploymentTypes = [
  '',
  'full_time',
  'part_time',
  'temporary',
  'seasonal',
  'contract',
  'internship',
]

if (!allowedEmploymentTypes.includes(employmentType)) {
  throw new Error('Invalid employment type.')
}

const status = String(formData.get('status') || '').trim()

const allowedStatuses = [
  'draft',
  'published',
  'closed',
]

if (!allowedStatuses.includes(status)) {
  throw new Error('Invalid job status.')
}

const { data: updatedJob, error: updateError } = await supabase
.from('job_postings')
.update({
  title,
  description: description || null,
  location: location || null,
  employment_type: employmentType || null,
  status,
  updated_at: new Date().toISOString(),
})
.eq('id', jobId)
.eq('company_id', existingJob.company_id)
.select('id')
.maybeSingle()

if (updateError) {
throw new Error('Unable to update job posting.')
}

if (!updatedJob) {
throw new Error('Job posting update was not authorized.')
}

revalidatePath('/recruiting/jobs')
revalidatePath(`/recruiting/jobs/${jobId}/edit`)
revalidatePath('/careers/hooked-on-coffee')

redirect('/recruiting/jobs')

  }
  