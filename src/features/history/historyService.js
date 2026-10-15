import { supabase } from '../../api/supabase';

// Bazadan barcha zakazlar tarixini olish
export const fetchHistoryAPI = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      clients (name, phone_number),
      order_materials (*)
    `)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Zakazni bazadan o'chirish API
export const deleteHistoryAPI = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
  return id;
};