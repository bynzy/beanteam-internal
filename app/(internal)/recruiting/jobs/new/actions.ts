
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJobPosting(formData: FormData) {
    const supabase = await createClient()
  
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
  
    if (error || !user) {
      redirect('/login')
    }

  const { data: memberships, error: membershipError } =
  await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .limit(1)

if (membershipError) {
  throw new Error('Unable to verify company access.')
}

if (!memberships || memberships.length === 0) {
  throw new Error('You are not authorized to create job postings.')
}

const companyId = memberships[0].company_id

const title = String(formData.get('title') || '').trim()
const description = String(formData.get('description') || '').trim()
const location = String(formData.get('location') || '').trim()
const employmentType = String(formData.get('employment_type') || '').trim()
const status = String(formData.get('status') || 'draft').trim()

if (!title || title.length > 200) {
  throw new Error('Job title must be between 1 and 200 characters.')
}

if (description.length > 10000) {
  throw new Error('Job description is too long.')
}

if (location.length > 200) {
  throw new Error('Job location is too long.')
}

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

if (!['draft', 'published'].includes(status)) {
  throw new Error('Invalid job posting status.')
}

const { error: insertError } = await supabase
.from('job_postings')
.insert({
  company_id: companyId,
  title,
  description: description || null,
  location: location || null,
  employment_type: employmentType || null,
  status,
})

if (insertError) {
throw new Error('Unable to create job posting.')
}

revalidatePath('/recruiting/jobs')
redirect('/recruiting/jobs')

  }
  