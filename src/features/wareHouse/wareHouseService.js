import { supabase } from '../../api/supabase'

export const fetchWareHouseDataAPI = async () => {
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('*, formats(*)')
    .order('id', { ascending: true })

  if (catErr) throw catErr

  const { data: materials, error: matErr } = await supabase
    .from('materials')
    .select('*, categories(name)')
    .order('id', { ascending: false })

  if (matErr) throw matErr

  return { categories: categories || [], materials: materials || [] }
}

export const addCategoryAPI = async (categoryName) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: categoryName }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const addFormatAPI = async (categoryId, formatName) => {
  const { data, error } = await supabase
    .from('formats')
    .insert([{ category_id: categoryId, name: formatName }])
    .select()
    .single()

  if (error) throw error
  return data
}

const toMaterialRow = (materialData) => ({
  category_id: Number(materialData.category_id),
  format: materialData.format_id ? String(materialData.format_id) : null,
  name: materialData.name,
  stock_count: Number(materialData.stock_count),
  cost_price: Number(materialData.cost_price),
  sell_price: Number(materialData.sell_price),
})

export const addMaterialAPI = async (materialData) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([toMaterialRow(materialData)])
    .select('*, categories(name)')
    .single()

  if (error) throw error
  return data
}

export const updateMaterialAPI = async ({ id, updatedFields }) => {
  const row = updatedFields.format_id !== undefined
    ? toMaterialRow(updatedFields)
    : updatedFields

  const { data, error } = await supabase
    .from('materials')
    .update(row)
    .eq('id', id)
    .select('*, categories(name)')
    .single()

  if (error) throw error
  return data
}

export const deleteMaterialAPI = async (id) => {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)

  if (error) throw error
  return id
}

export const decreaseStockAPI = async (id, qty) => {
  const { data: current, error: fetchErr } = await supabase
    .from('materials')
    .select('stock_count, name')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const next = Number(current.stock_count) - Number(qty)
  if (next < 0) {
    throw new Error(`${current.name} omborda yetarli emas`)
  }

  const { data, error } = await supabase
    .from('materials')
    .update({ stock_count: next })
    .eq('id', id)
    .select('*, categories(name)')
    .single()

  if (error) throw error
  return data
}

export const matchesFormat = (material, format) => {
  const stored = material.format == null ? '' : String(material.format)
  return stored === String(format.id) || stored === format.name
}
