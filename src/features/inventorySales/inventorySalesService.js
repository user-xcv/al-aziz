const requireClient = (client) => {
  if (!client) throw new Error('Supabase mijoz sozlanmagan.')
  return client
}

export const fetchInventorySalesAPI = async (client) => {
  const { data, error } = await requireClient(client)
    .from('inventory_sales')
    .select(`
      *,
      clients(name, phone_number),
      materials(name),
      inventory_sale_payments(id, amount, payment_type, notes, date)
    `)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export const createInventorySaleAPI = async (saleData, client) => {
  const { data, error } = await requireClient(client).rpc('create_inventory_sale', {
    sale_data: saleData,
  })

  if (error) throw error
  const id = Number(data)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Supabase savdoni tasdiqlamadi: savdo raqami qaytmadi.')
  }
  return { id }
}

export const recordInventorySalePaymentAPI = async (paymentData, client) => {
  const { data, error } = await requireClient(client).rpc('record_inventory_sale_payment', {
    sale_id: paymentData.sale_id,
    amount: paymentData.amount,
    payment_type: paymentData.payment_type || 'cash',
    notes: paymentData.notes || null,
  })

  if (error) throw error
  const id = Number(data)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Supabase to‘lovni tasdiqlamadi: to‘lov raqami qaytmadi.')
  }
  return { id }
}
