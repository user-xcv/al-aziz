import { getAdvanceValidationError } from './orderCalculations.js'
import { findOverStockMaterial, getMaterialsForSelection } from './materialSelection.js'

const moneyFields = [
  'overallmoney',
  'bazis',
  'cutting',
  'kromka',
  'piercing',
  'rover',
  'masterfee',
  'spares',
  'anotherexpenses',
]

export const validateOrderDraft = ({
  form,
  lines,
  categories,
  materials,
  orderTotal,
}) => {
  if (!form.client_id) return 'Mijozni tanlang yoki yangi mijoz qo‘shing.'

  for (const [index, line] of lines.entries()) {
    const hasInput = Boolean(
      line.categoryId || line.formatId || line.materialId || line.count || line.customMarkup,
    )
    if (!hasInput) continue

    const category = categories.find((item) => String(item.id) === String(line.categoryId))
    if (!category) return `${index + 1}-material uchun kategoriyani tanlang.`

    const formats = category.formats || []
    if (formats.length > 0 && !formats.some((item) => String(item.id) === String(line.formatId))) {
      return `${index + 1}-material uchun formatni tanlang.`
    }

    if (!line.materialId) return `${index + 1}-materialni tanlang.`
    const material = getMaterialsForSelection(
      materials,
      category.id,
      line.formatId,
      formats,
    ).find((item) => String(item.id) === String(line.materialId))
    if (!material) return `${index + 1}-material tanlangan kategoriya va formatga mos emas.`

    const quantity = Number(line.count)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return `${material.name}: miqdorni butun dona qilib kiriting.`
    }
    if (quantity > Number(material.stock_count || 0)) {
      return `${material.name}: omborda ${Number(material.stock_count || 0)} dona bor.`
    }

    const unitCost = Number(material.cost_price || 0)
    const defaultMarkup = Number(material.markup_price ?? (Number(material.sell_price || 0) - unitCost))
    const markup = line.customMarkup === '' ? defaultMarkup : Number(line.customMarkup)
    if (!Number.isFinite(markup) || unitCost + markup < 0) {
      return `${material.name}: ustama noto‘g‘ri, sotish narxi manfiy bo‘lishi mumkin emas.`
    }
  }

  for (const field of moneyFields) {
    const value = Number(form[field] || 0)
    if (!Number.isFinite(value) || value < 0) return 'Pul qiymatlarini 0 yoki undan katta qilib kiriting.'
  }

  const selectedLines = lines
    .filter((line) => line.materialId && Number(line.count) > 0)
    .map((line) => {
      const material = materials.find((item) => String(item.id) === String(line.materialId))
      return {
        material_id: material?.id,
        name: material?.name,
        count: line.count,
        stock: material?.stock_count,
      }
    })
  const overStock = findOverStockMaterial(selectedLines)
  if (overStock) {
    return `${overStock.name}: tanlangan miqdor ${overStock.count} dona, omborda ${overStock.stock} dona bor.`
  }

  if (orderTotal <= 0) return 'Buyurtmaga kamida bitta material yoki narxli xizmat kiriting.'

  return getAdvanceValidationError(form.overallmoney, orderTotal)
}

export const formatOrderSubmitError = (error) => {
  const message = error?.message || String(error || 'Noma’lum xatolik')
  const code = error?.code

  if (code === 'PGRST202') {
    return 'Buyurtma funksiyasi Supabase’da topilmadi. Supabase SQL Editor’da supabase-setup.sql faylini ishga tushiring.'
  }
  if (code === '42501') {
    return `Supabase ruxsati yetarli emas (RLS): ${message}`
  }
  if (code === '23503') {
    return `Tanlangan mijoz yoki material Supabase’da topilmadi: ${message}`
  }

  return code ? `Supabase xatosi (${code}): ${message}` : `Buyurtma saqlanmadi: ${message}`
}
