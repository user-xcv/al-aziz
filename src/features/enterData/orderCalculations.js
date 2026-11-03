const numberOrZero = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const serviceRevenueFields = [
  'bazis',
  'cutting',
  'kromka',
  'piercing',
  'rover',
]

export const operatingCostFields = [
  'masterfee',
  'spares',
  'anotherexpenses',
]

const roundMoney = (amount) => Math.round(amount * 100) / 100
const formatMoney = (amount) => roundMoney(amount).toLocaleString('uz-UZ')

export const getAdvanceValidationError = (value, customerTotal) => {
  const advance = Number(value || 0)
  if (!Number.isFinite(advance) || advance < 0) {
    return 'Avans summasini to‘g‘ri kiriting.'
  }
  if (advance > customerTotal) {
    return `${formatMoney(advance)} so‘mlik avans buyurtma jami ${formatMoney(customerTotal)} so‘mdan ${formatMoney(advance - customerTotal)} so‘m ortiq. Avansni kamaytiring yoki buyurtmaga material/xizmat qo‘shib jami summani oshiring.`
  }
  return ''
}

const getMaterialTotalCost = (material) => {
  const savedTotalCost = numberOrZero(material.total_cost)
  if (savedTotalCost !== 0 || numberOrZero(material.unit_cost) === 0) return savedTotalCost
  return numberOrZero(material.unit_cost) * numberOrZero(material.count)
}

export const getMaterialLineFinancials = (material) => {
  const totalCost = getMaterialTotalCost(material)
  const savedMarkup = material.total_markup
  const calculatedMarkup = numberOrZero(material.totalprice) - totalCost
  const totalMarkup = numberOrZero(savedMarkup) !== 0 || calculatedMarkup === 0
    ? numberOrZero(savedMarkup)
    : calculatedMarkup
  return { totalCost: roundMoney(totalCost), totalMarkup: roundMoney(totalMarkup) }
}

export const calculateOrderTotals = (form, materials = []) => {
  const serviceRevenue = serviceRevenueFields.reduce(
    (total, key) => total + numberOrZero(form[key]),
    0,
  )
  const operatingCosts = operatingCostFields.reduce(
    (total, key) => total + numberOrZero(form[key]),
    0,
  )

  const materialCosts = materials.reduce(
    (total, material) =>
      total + numberOrZero(material.cost_price) * numberOrZero(material.count),
    0,
  )
  const materialMarkup = materials.reduce((total, material) => {
    const unitMarkup = material.unit_markup === undefined
      ? numberOrZero(material.price) - numberOrZero(material.cost_price)
      : numberOrZero(material.unit_markup)
    return total + unitMarkup * numberOrZero(material.count)
  }, 0)
  const materialRevenue = materialCosts + materialMarkup
  const revenue = roundMoney(serviceRevenue + materialRevenue)
  const totalCosts = roundMoney(materialCosts + operatingCosts)

  return {
    revenue,
    paymentsReceived: numberOrZero(form.overallmoney),
    materialCosts: roundMoney(materialCosts),
    materialMarkup: roundMoney(materialMarkup),
    serviceRevenue: roundMoney(serviceRevenue),
    operatingCosts: roundMoney(operatingCosts),
    totalCosts,
    profit: roundMoney(materialMarkup + serviceRevenue - operatingCosts),
  }
}

export const getOrderFinancials = (order) => {
  const materials = order.order_materials || []
  const materialFinancials = materials.map(getMaterialLineFinancials)
  const materialCosts = materialFinancials.reduce((total, item) => total + item.totalCost, 0)
  const materialMarkup = materialFinancials.reduce((total, item) => total + item.totalMarkup, 0)
  const serviceRevenue = serviceRevenueFields.reduce(
    (total, key) => total + numberOrZero(order[key]),
    0,
  )
  const operatingCosts = operatingCostFields.reduce(
    (total, key) => total + numberOrZero(order[key]),
    0,
  )
  const revenue = roundMoney(materialCosts + materialMarkup + serviceRevenue)
  const hasFinancialDetails =
    materials.length > 0 ||
    [...serviceRevenueFields, ...operatingCostFields].some((key) => order[key] !== undefined)

  return {
    revenue: hasFinancialDetails ? revenue : numberOrZero(order.order_total),
    materialCosts: roundMoney(materialCosts),
    materialMarkup: roundMoney(materialMarkup),
    serviceRevenue: roundMoney(serviceRevenue),
    operatingCosts: roundMoney(operatingCosts),
    totalCosts: roundMoney(materialCosts + operatingCosts),
    profit: roundMoney(materialMarkup + serviceRevenue - operatingCosts),
  }
}

export const aggregateOrderFinancials = (orders) => {
  const summary = orders.reduce(
    (summary, order) => {
      const financials = getOrderFinancials(order)
      summary.customerTotal += financials.revenue
      summary.materialSales += financials.materialCosts + financials.materialMarkup
      summary.materialCosts += financials.materialCosts
      summary.materialMarkup += financials.materialMarkup
      summary.serviceRevenue += financials.serviceRevenue
      summary.operatingCosts += financials.operatingCosts
      summary.netProfit += financials.profit
      for (const field of serviceRevenueFields) {
        summary.serviceRevenueByField[field] += numberOrZero(order[field])
      }
      for (const field of operatingCostFields) {
        summary.operatingCostsByField[field] += numberOrZero(order[field])
      }
      return summary
    },
    {
      customerTotal: 0,
      materialSales: 0,
      materialCosts: 0,
      materialMarkup: 0,
      serviceRevenue: 0,
      operatingCosts: 0,
      netProfit: 0,
      serviceRevenueByField: Object.fromEntries(serviceRevenueFields.map((field) => [field, 0])),
      operatingCostsByField: Object.fromEntries(operatingCostFields.map((field) => [field, 0])),
    },
  )
  for (const key of [
    'customerTotal',
    'materialSales',
    'materialCosts',
    'materialMarkup',
    'serviceRevenue',
    'operatingCosts',
    'netProfit',
  ]) {
    summary[key] = roundMoney(summary[key])
  }
  for (const field of serviceRevenueFields) {
    summary.serviceRevenueByField[field] = roundMoney(summary.serviceRevenueByField[field])
  }
  for (const field of operatingCostFields) {
    summary.operatingCostsByField[field] = roundMoney(summary.operatingCostsByField[field])
  }
  return summary
}
