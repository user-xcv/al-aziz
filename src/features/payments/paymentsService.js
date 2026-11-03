import { supabase } from '../../api/supabase'

export const fetchPaymentsAPI = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, clients(name), expenses(id, overallmoney)')
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export const addPaymentAPI = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select('*, clients(name), expenses(id, overallmoney)')
    .single()

  if (error) throw error
  return data
}

export const updatePaymentAPI = async ({ id, updatedFields }) => {
  const { data, error } = await supabase
    .from('payments')
    .update(updatedFields)
    .eq('id', id)
    .select('*, clients(name), expenses(id, overallmoney)')
    .single()

  if (error) throw error
  return data
}

export const deletePaymentAPI = async (id) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) throw error
  return id
}

export const getPaymentsByClientAPI = async (clientId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}
