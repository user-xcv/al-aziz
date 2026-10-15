import { supabase } from "../../api/supabase";

export const createOrderAPI = async (formData) => {
  // 1. Mijozni qo'shamiz
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .insert([{ name: formData.name, phone_number: formData.phone_number || null }])
    .select();

  if (clientError) throw new Error(clientError.message);
  const newClientId = clientData[0].id;

  // 2. Xarajatlarni expenses jadvaliga yozamiz
  const { data: expenseData, error: expenseError } = await supabase
    .from('expenses')
    .insert([{
      client_id: newClientId,
      bazis: Number(formData.bazis) || 0,
      cutting: Number(formData.cutting) || 0,
      kromka: Number(formData.kromka) || 0,
      piercing: Number(formData.piercing) || 0,
      rover: Number(formData.rover) || 0,
      masterfee: Number(formData.masterfee) || 0,
      spares: Number(formData.spares) || 0,
      anotherexpenses: Number(formData.anotherexpenses) || 0,
      overallmoney: Number(formData.overallmoney) || 0,
      payoff: Number(formData.payoff) || 0
    }])
    .select();

  if (expenseError) throw new Error(expenseError.message);
  const newExpenseId = expenseData[0].id;

  // 3. Materiallarni order_materials jadvaliga yozamiz
  if (formData.materials && formData.materials.length > 0) {
    const materialsToInsert = formData.materials.map(mat => ({
      expense_id: newExpenseId,
      material_name: mat.material_name,
      count: mat.count,
      price: mat.price,
      totalPrice: mat.totalPrice
    }));

    const { error: matError } = await supabase
      .from('order_materials')
      .insert(materialsToInsert);

    if (matError) throw new Error(matError.message);
  }

  return { success: true };
};