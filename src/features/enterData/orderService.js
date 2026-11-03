import { formatOrderSubmitError } from './orderSubmission.js'

export const createOrderAPI = async (formData, client) => {
  if (!client) throw new Error('Supabase mijoz sozlanmagan.')

  const { data, error } = await client.rpc('create_order_with_materials', {
    order_data: {
      ...formData,
      materials: formData.materials || [],
    },
  })

  if (error) throw new Error(formatOrderSubmitError(error))

  const id = Number(data)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Supabase buyurtmani tasdiqlamadi: saqlangan buyurtma raqami qaytmadi.')
  }
  return { success: true, id }
};