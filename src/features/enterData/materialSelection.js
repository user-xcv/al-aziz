const sameId = (left, right) => String(left) === String(right)

export const getFormatsForCategory = (categories, categoryId) =>
  categories.find((category) => sameId(category.id, categoryId))?.formats || []

export const getMaterialsForSelection = (materials, categoryId, formatId, formats) => {
  if (!categoryId) return []

  const categoryFormats = formats || []
  if (categoryFormats.length > 0 && !formatId) return []

  const selectedFormat = categoryFormats.find((format) => sameId(format.id, formatId))
  if (categoryFormats.length > 0 && !selectedFormat) return []

  return materials.filter((material) => {
    if (!sameId(material.category_id, categoryId)) return false

    const materialFormatId = material.format_id
    const legacyFormat = material.format
    if (!selectedFormat) return materialFormatId == null && (legacyFormat == null || legacyFormat === '')

    if (materialFormatId != null) return sameId(materialFormatId, selectedFormat.id)
    return legacyFormat === selectedFormat.name
  })
}

export const getMaterialSelectionTotals = (lines) => lines.reduce(
  (totals, line) => {
    const count = Number(line.count) || 0
    totals.quantity += count
    totals.lineCount += 1
    totals.saleTotal += count * (Number(line.price) || 0)
    totals.costTotal += count * (Number(line.cost_price) || 0)
    totals.markupTotal += count * (Number(line.unit_markup) || 0)
    return totals
  },
  { quantity: 0, lineCount: 0, saleTotal: 0, costTotal: 0, markupTotal: 0 },
)

export const findOverStockMaterial = (lines) => {
  const selectedByMaterial = new Map()
  for (const line of lines) {
    const current = selectedByMaterial.get(line.material_id) || {
      count: 0,
      stock: line.stock,
      name: line.name,
    }
    current.count += Number(line.count) || 0
    selectedByMaterial.set(line.material_id, current)
  }

  return [...selectedByMaterial.values()].find((item) => item.count > item.stock)
}
