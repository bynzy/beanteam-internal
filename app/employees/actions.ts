'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addEmployee(formData: FormData) {
  const supabase = await createClient()

  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const job_title = String(formData.get('job_title') || '').trim()
  const home_address = String(formData.get('home_address') || '').trim()
  const cell_phone = String(formData.get('cell_phone') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const hire_date = String(formData.get('hire_date') || '').trim()
  const anniversary_date = String(formData.get('anniversary_date') || '').trim()
  const notes = String(formData.get('notes') || '').trim()

  const { error } = await supabase.from('employees').insert({
    first_name,
    last_name,
    job_title: job_title || null,
    home_address: home_address || null,
    cell_phone: cell_phone || null,
    email: email || null,
    hire_date: hire_date || null,
    anniversary_date: anniversary_date || null,
    notes: notes || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/employees')
  redirect('/employees')
}
export async function updateEmployee(formData: FormData) {
    const supabase = await createClient()
  
    const id = String(formData.get('id'))
  
    const { error } = await supabase
      .from('employees')
      .update({
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        job_title: formData.get('job_title'),
        home_address: formData.get('home_address'),
        cell_phone: formData.get('cell_phone'),
        email: formData.get('email'),
        hire_date: formData.get('hire_date'),
        anniversary_date: formData.get('anniversary_date'),
        notes: formData.get('notes'),
      })
      .eq('id', id)
  
    if (error) {
      throw new Error(error.message)
    }
  
    redirect(`/employees/${id}`)
  }
  export async function saveCompliance(formData: FormData) {
    const supabase = await createClient()
  
    const employee_id = String(formData.get('employee_id'))
  
    const handbook_signed = formData.get('handbook_signed') === 'on'
    const handbook_signed_date = String(formData.get('handbook_signed_date') || '').trim()
  
    const nda_signed = formData.get('nda_signed') === 'on'
    const nda_signed_date = String(formData.get('nda_signed_date') || '').trim()
  
    const food_handler_current = formData.get('food_handler_current') === 'on'
    const food_handler_issue_date = String(formData.get('food_handler_issue_date') || '').trim()
    const food_handler_expiration_date = String(
      formData.get('food_handler_expiration_date') || ''
    ).trim()
  
    const { data: existing } = await supabase
      .from('employee_compliance')
      .select('id')
      .eq('employee_id', employee_id)
      .maybeSingle()
  
    if (existing) {
      const { error } = await supabase
        .from('employee_compliance')
        .update({
          handbook_signed,
          handbook_signed_date: handbook_signed_date || null,
          nda_signed,
          nda_signed_date: nda_signed_date || null,
          food_handler_current,
          food_handler_issue_date: food_handler_issue_date || null,
          food_handler_expiration_date: food_handler_expiration_date || null,
        })
        .eq('employee_id', employee_id)
  
      if (error) {
        throw new Error(error.message)
      }
    } else {
      const { error } = await supabase.from('employee_compliance').insert({
        employee_id,
        handbook_signed,
        handbook_signed_date: handbook_signed_date || null,
        nda_signed,
        nda_signed_date: nda_signed_date || null,
        food_handler_current,
        food_handler_issue_date: food_handler_issue_date || null,
        food_handler_expiration_date: food_handler_expiration_date || null,
      })
  
      if (error) {
        throw new Error(error.message)
      }
    }
  
    revalidatePath(`/employees/${employee_id}`)
    redirect(`/employees/${employee_id}`)
  }
  export async function uploadEmployeeDocument(formData: FormData) {
    const supabase = await createClient()
  
    const employee_id = String(formData.get('employee_id') || '')
    const document_type = String(formData.get('document_type') || '').trim()
    const notes = String(formData.get('notes') || '').trim()
    const file = formData.get('file') as File | null
  
    if (!employee_id) {
      throw new Error('Missing employee ID')
    }
  
    if (!file || file.size === 0) {
      throw new Error('No file selected')
    }
  
    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : ''
    const safeName = file.name.replace(/\s+/g, '-')
    const filePath = `${employee_id}/${Date.now()}-${safeName}`
  
    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file, {
        upsert: false,
      })
  
    if (uploadError) {
      throw new Error(uploadError.message)
    }
  
    const { error: insertError } = await supabase.from('employee_documents').insert({
      employee_id,
      document_type: document_type || 'other',
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || null,
      notes: notes || null,
      created_by: null,
    })
  
    if (insertError) {
      throw new Error(insertError.message)
    }
  
    revalidatePath(`/employees/${employee_id}`)
    redirect(`/employees/${employee_id}`)
  }
  export async function deleteEmployeeDocument(formData: FormData) {
    const supabase = await createClient()
  
    const document_id = String(formData.get('document_id') || '')
    const employee_id = String(formData.get('employee_id') || '')
  
    if (!document_id || !employee_id) {
      throw new Error('Missing document ID or employee ID')
    }
  
    const { data: doc, error: fetchError } = await supabase
      .from('employee_documents')
      .select('id, file_path')
      .eq('id', document_id)
      .single()
  
    if (fetchError || !doc) {
      throw new Error('Document not found')
    }
  
    const { error: storageError } = await supabase.storage
      .from('employee-documents')
      .remove([doc.file_path])
  
    if (storageError) {
      throw new Error(storageError.message)
    }
  
    const { error: deleteError } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', document_id)
  
    if (deleteError) {
      throw new Error(deleteError.message)
    }
  
    revalidatePath(`/employees/${employee_id}`)
    redirect(`/employees/${employee_id}`)
  }