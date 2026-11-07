import { supabase } from '../../api/supabase'

export const fetchClientsAPI = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('id', { ascending: false })

  if (error) throw error
  return data || []
}

export const addClientAPI = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateClientAPI = async ({ id, updatedFields }) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteClientAPI = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
  return id
}

export const searchClientsAPI = async (searchTerm) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
    .order('id', { ascending: false })

  if (error) throw error
  return data || []
}
