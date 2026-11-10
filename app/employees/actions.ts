'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addEmployee(formData: FormData) {
  const supabase = await createClient()

  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const home_address = String(formData.get('home_address') || '').trim() || null
  const cell_phone = String(formData.get('cell_phone') || '').trim() || null
  const email = String(formData.get('email') || '').trim() || null
  const job_title = String(formData.get('job_title') || '').trim() || null
  const hire_date = String(formData.get('hire_date') || '').trim() || null
  const anniversary_date =
    String(formData.get('anniversary_date') || '').trim() || null
  const notes = String(formData.get('notes') || '').trim() || null
  const is_active = formData.get('is_active') === 'true'

  const { data, error } = await supabase
    .from('employees')
    .insert({
      first_name,
      last_name,
      home_address,
      cell_phone,
      email,
      job_title,
      hire_date,
      anniversary_date,
      notes,
      is_active,
    })
    .select('id')
    .single()

  if (error) {
    console.error('addEmployee error:', error)
    throw new Error('Failed to add employee')
  }

  revalidatePath('/employees')
  revalidatePath('/dashboard')

  redirect(`/employees/${data.id}`)
}

export async function updateEmployee(formData: FormData) {
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const home_address = String(formData.get('home_address') || '').trim() || null
  const cell_phone = String(formData.get('cell_phone') || '').trim() || null
  const email = String(formData.get('email') || '').trim() || null
  const job_title = String(formData.get('job_title') || '').trim() || null
  const hire_date = String(formData.get('hire_date') || '').trim() || null
  const anniversary_date =
    String(formData.get('anniversary_date') || '').trim() || null
  const notes = String(formData.get('notes') || '').trim() || null
  const is_active = formData.get('is_active') === 'true'

  const { error } = await supabase
    .from('employees')
    .update({
      first_name,
      last_name,
      home_address,
      cell_phone,
      email,
      job_title,
      hire_date,
      anniversary_date,
      notes,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('updateEmployee error:', error)
    throw new Error('Failed to update employee')
  }

  revalidatePath(`/employees/${id}`)
  revalidatePath('/employees')
  revalidatePath('/dashboard')

  redirect(`/employees/${id}`)
}

export async function saveCompliance(formData: FormData) {
  const supabase = await createClient()

  const employeeId = String(formData.get('employee_id') || '')

  const handbook_signed = formData.get('handbook_signed') === 'on'
  const handbook_signed_date =
    String(formData.get('handbook_signed_date') || '') || null

  const nda_signed = formData.get('nda_signed') === 'on'
  const nda_signed_date =
    String(formData.get('nda_signed_date') || '') || null

  const food_handler_current = formData.get('food_handler_current') === 'on'
  const food_handler_issue_date =
    String(formData.get('food_handler_issue_date') || '') || null
  const food_handler_expiration_date =
    String(formData.get('food_handler_expiration_date') || '') || null

  let message = 'compliance-saved'

  try {
    const { data: existingCompliance, error: fetchError } = await supabase
      .from('employee_compliance')
      .select('id')
      .eq('employee_id', employeeId)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingCompliance) {
      const { error: updateError } = await supabase
        .from('employee_compliance')
        .update({
          handbook_signed,
          handbook_signed_date,
          nda_signed,
          nda_signed_date,
          food_handler_current,
          food_handler_issue_date,
          food_handler_expiration_date,
          updated_at: new Date().toISOString(),
        })
        .eq('employee_id', employeeId)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('employee_compliance')
        .insert({
          employee_id: employeeId,
          handbook_signed,
          handbook_signed_date,
          nda_signed,
          nda_signed_date,
          food_handler_current,
          food_handler_issue_date,
          food_handler_expiration_date,
        })

      if (insertError) throw insertError
    }

    revalidatePath(`/employees/${employeeId}`)
    revalidatePath('/employees')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('saveCompliance error:', error)
    message = 'compliance-error'
  }

  redirect(`/employees/${employeeId}?message=${message}`)
}

export async function uploadEmployeeDocument(formData: FormData) {
  const supabase = await createClient()

  const employeeId = String(formData.get('employee_id') || '')
  const documentType = String(formData.get('document_type') || '')
  const notes = String(formData.get('notes') || '') || null
  const file = formData.get('file') as File | null

  let message = 'document-uploaded'

  try {
    if (!file || file.size === 0) {
      throw new Error('No file uploaded')
    }

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    const safeFileName = file.name.replace(/\s+/g, '-')
    const filePath = `${employeeId}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { error: insertError } = await supabase
      .from('employee_documents')
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        notes,
      })

    if (insertError) throw insertError

    revalidatePath(`/employees/${employeeId}`)
    revalidatePath('/employees')
  } catch (error) {
    console.error('uploadEmployeeDocument error:', error)
    message = 'document-upload-error'
  }

  redirect(`/employees/${employeeId}?message=${message}`)
}

export async function deleteEmployeeDocument(formData: FormData) {
  const supabase = await createClient()

  const documentId = String(formData.get('document_id') || '')
  const employeeId = String(formData.get('employee_id') || '')

  let message = 'document-deleted'

  try {
    const { data: doc, error: fetchError } = await supabase
      .from('employee_documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (fetchError) throw fetchError

    if (doc?.file_path) {
      const { error: storageError } = await supabase.storage
        .from('employee-documents')
        .remove([doc.file_path])

      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) throw deleteError

    revalidatePath(`/employees/${employeeId}`)
    revalidatePath('/employees')
  } catch (error) {
    console.error('deleteEmployeeDocument error:', error)
    message = 'document-delete-error'
  }

  redirect(`/employees/${employeeId}?message=${message}`)
}