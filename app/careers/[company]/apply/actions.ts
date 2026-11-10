
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitJobApplication(formData: FormData) {

const MAX_FORM_SIZE = 20_000

let formSize = 0

for (const [key, value] of formData.entries()) {
  formSize += key.length

  if (typeof value === 'string') {
    formSize += value.length
  } else {
    formSize += value.size
  }

  if (formSize > MAX_FORM_SIZE) {
    return {
      success: false,
      message: 'Application data exceeds the allowed size.',
    }
  }
}

  const supabase = await createClient()
  const companySlug = String(formData.get('company') || '').trim()

if (!companySlug) {
  return {
    success: false,
    message: 'Company information is missing.',
  }
}

const { data: company, error: companyError } = await supabase
  .from('companies')
  .select('id, name')
  .eq('slug', companySlug)
  .single()

if (companyError || !company) {
  return {
    success: false,
    message: 'Company not found.',
  }
}

const jobPostingId = String(formData.get('job_posting_id') || '').trim()

if (!jobPostingId) {
  return {
    success: false,
    message: 'Please select a job opening.',
  }
}

const { data: jobPosting, error: jobError } = await supabase
  .from('job_postings')
  .select('id, title')
  .eq('id', jobPostingId)
  .eq('company_id', company.id)
  .eq('status', 'published')
  .maybeSingle()

if (jobError || !jobPosting) {
  return {
    success: false,
    message: 'This job opening is no longer available.',
  }
}

  
const firstName = String(formData.get('first_name') || '').trim()
const lastName = String(formData.get('last_name') || '').trim()
const email = String(formData.get('email') || '').trim()
const phone = String(formData.get('phone') || '').trim()
const coverLetter = String(formData.get('cover_letter') || '').trim()

if (!firstName || !lastName || !email) {
  return {
    success: false,
    message: 'First name, last name, and email are required.',
  }
}


const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailPattern.test(email)) {
  return {
    success: false,
    message: 'Please enter a valid email address.',
  }
}


const weeklyAvailability = formData
  .getAll('weekly_availability')
  .filter((value): value is string => typeof value === 'string')

if (weeklyAvailability.length > 21) {
    return {
      success: false,
      message: 'Too many availability selections were submitted.',
    }
  }
 
  
if (new Set(weeklyAvailability).size !== weeklyAvailability.length) {
    return {
      success: false,
      message: 'Duplicate availability selections are not allowed.',
    }
  }
  

const allowedDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
]

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

const validAvailability = weeklyAvailability.every((selection) => {
  const [day, shift] = selection.split('|')
  const allowedShifts =
    day === 'Saturday' || day === 'Sunday'
      ? weekendShifts
      : weekdayShifts

  return allowedDays.includes(day) && allowedShifts.includes(shift)
})

if (!validAvailability) {
  return {
    success: false,
    message: 'One or more selected shifts are invalid.',
  }
}


const availabilityByDay: Record<string, string[]> = {}

for (const day of allowedDays) {
  availabilityByDay[day] = []
}

for (const selection of weeklyAvailability) {
  const [day, shift] = selection.split('|')

  if (!availabilityByDay[day].includes(shift)) {
    availabilityByDay[day].push(shift)
  }
}


if (
    firstName.length > 100 ||
    lastName.length > 100 ||
    email.length > 254 ||
    phone.length > 30 ||
    coverLetter.length > 5000
  ) {
    return {
      success: false,
      message: 'One or more application fields exceed the allowed length.',
    }
  }
  

  
const admin = createAdminClient()

const { error: insertError } = await admin
  .from('job_applications')
  .insert({
    job_posting_id: jobPosting.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    cover_letter: coverLetter || null,
    weekly_availability: availabilityByDay,
    status: 'new',
  })

if (insertError) {
  console.error('Job application insert failed:', insertError.message)

  return {
    success: false,
    message: 'Unable to submit your application. Please try again.',
  }
}

return {
  success: true,
  message: 'Your application was submitted successfully!',
}

}
