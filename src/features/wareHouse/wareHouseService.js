import { supabase } from '../../api/supabase'

// Barcha ma'lumotlarni (Kategoriyalar, Formatlar, Materiallar) birga olish
export const fetchWareHouseDataAPI = async () => {
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('*, formats(*), materials(*)')
    .order('id', { ascending: true })

  if (catErr) throw catErr

  const { data: materials, error: matErr } = await supabase
    .from('materials')
    .select('*, categories(name), formats(name)')
    .order('id', { ascending: false })

  if (matErr) throw matErr

  return { categories, materials }
}

// 1. Yangi Kategoriya qo'shish (masalan: LDSP)
export const addCategoryAPI = async (categoryName) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: categoryName }])
    .select()
    .single()

  if (error) throw error
  return data
}

// 2. Yangi Format qo'shish (masalan: 4.57 kv)
export const addFormatAPI = async (categoryId, formatName) => {
  const { data, error } = await supabase
    .from('formats')
    .insert([{ category_id: categoryId, name: formatName }])
    .select()
    .single()

  if (error) throw error
  return data
}

// 3. Yangi Material qo'shish / update
export const addMaterialAPI = async (materialData) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([materialData])
    .select('*, categories(name), formats(name)')
    .single()

  if (error) throw error
  return data
}

export const updateMaterialAPI = async ({ id, updatedFields }) => {
  const { data, error } = await supabase
    .from('materials')
    .update(updatedFields)
    .eq('id', id)
    .select('*, categories(name), formats(name)')
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