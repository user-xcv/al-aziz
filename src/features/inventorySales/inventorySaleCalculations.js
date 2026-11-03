import {
  aggregateOrderFinancials,
  getOrderFinancials,
} from '../enterData/orderCalculations.js'
import { getOrderPaid, getOrderTotal } from '../enterData/orderAmounts.js'

const numberOrZero = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

export const getInventorySaleFinancials = (sale) => {
  const quantity = numberOrZero(sale.quantity)
  const totalRevenue = numberOrZero(sale.sale_total) ||
    numberOrZero(sale.unit_sale_price) * quantity
  const totalCost = numberOrZero(sale.total_cost) ||
    numberOrZero(sale.unit_cost) * quantity
  const payments = sale.inventory_sale_payments || []
  const received = payments.reduce((sum, payment) => sum + numberOrZero(payment.amount), 0)

  return {
    quantity,
    revenue: totalRevenue,
    cost: totalCost,
    profit: numberOrZero(sale.profit) || totalRevenue - totalCost,
    received,
    balance: totalRevenue - received,
  }
}

export const getInventorySaleQuote = (material, quantity) => {
  const count = Number(quantity)
  const unitCost = numberOrZero(material?.cost_price)
  const unitSalePrice = material
    ? numberOrZero(material.sell_price ?? (unitCost + numberOrZero(material.markup_price)))
    : 0
  return {
    quantity: count,
    unitCost,
    unitSalePrice,
    totalCost: unitCost * count,
    saleTotal: unitSalePrice * count,
    profit: (unitSalePrice - unitCost) * count,
  }
}

export const validateInventorySaleDraft = ({ material, quantity, amountPaid }) => {
  if (!material) return 'Sotiladigan materialni tanlang.'
  const count = Number(quantity)
  if (!Number.isInteger(count) || count <= 0) {
    return 'Miqdorni musbat butun dona kiriting.'
  }
  if (count > numberOrZero(material.stock_count)) {
    return `Omborda ${numberOrZero(material.stock_count)} dona bor. Miqdorni kamaytiring.`
  }
  const paid = Number(amountPaid || 0)
  const { saleTotal } = getInventorySaleQuote(material, count)
  if (!Number.isFinite(paid) || paid < 0 || paid > saleTotal) {
    return `Olingan pul 0 dan ${saleTotal.toLocaleString('uz-UZ')} so‘mgacha bo‘lishi kerak.`
  }
  return ''
}

export const isWithinReportPeriod = (date, period, referenceDate = new Date()) => {
  if (period === 'all' || !date) return true
  const itemDate = new Date(date)
  if (Number.isNaN(itemDate.getTime())) return false

  if (period === 'month') {
    return itemDate.getMonth() === referenceDate.getMonth() &&
      itemDate.getFullYear() === referenceDate.getFullYear() &&
      itemDate <= referenceDate
  }
  if (period === 'week') {
    return itemDate >= new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000) &&
      itemDate <= referenceDate
  }
  return true
}

export const aggregateInventorySales = (sales = []) => sales.reduce(
  (summary, sale) => {
    const financials = getInventorySaleFinancials(sale)
    summary.count += 1
    summary.quantity += financials.quantity
    summary.revenue += financials.revenue
    summary.cost += financials.cost
    summary.profit += financials.profit
    summary.received += financials.received
    summary.balance += financials.balance
    return summary
  },
  { count: 0, quantity: 0, revenue: 0, cost: 0, profit: 0, received: 0, balance: 0 },
)

export const sumInventorySalePayments = (
  sales = [],
  period = 'all',
  referenceDate = new Date(),
) => sales
  .flatMap((sale) => sale.inventory_sale_payments || [])
  .filter((payment) => isWithinReportPeriod(payment.date, period, referenceDate))
  .reduce((sum, payment) => sum + numberOrZero(payment.amount), 0)

export const aggregateCrmFinancials = (orders = [], materialSales = []) => {
  const orderSummary = aggregateOrderFinancials(orders)
  const saleSummary = aggregateInventorySales(materialSales)
  return {
    orderRevenue: orderSummary.customerTotal,
    orderProfit: orderSummary.netProfit,
    orderMaterialSales: orderSummary.materialSales,
    orderMaterialCosts: orderSummary.materialCosts,
    orderMaterialProfit: orderSummary.materialMarkup,
    serviceRevenue: orderSummary.serviceRevenue,
    serviceRevenueByField: orderSummary.serviceRevenueByField,
    operatingCosts: orderSummary.operatingCosts,
    operatingCostsByField: orderSummary.operatingCostsByField,
    standaloneMaterialRevenue: saleSummary.revenue,
    standaloneMaterialCosts: saleSummary.cost,
    standaloneMaterialProfit: saleSummary.profit,
    standaloneMaterialQuantity: saleSummary.quantity,
    standaloneMaterialSalesCount: saleSummary.count,
    totalRevenue: orderSummary.customerTotal + saleSummary.revenue,
    totalProfit: orderSummary.netProfit + saleSummary.profit,
    totalMaterialCosts: orderSummary.materialCosts + saleSummary.cost,
  }
}

export const getCustomerBusinessHistory = (clientId, orders = [], materialSales = []) => {
  const orderHistory = orders
    .filter((order) => String(order.client_id) === String(clientId))
    .map((order) => ({
      type: 'order',
      id: order.id,
      date: order.date,
      revenue: getOrderTotal(order),
      profit: getOrderFinancials(order).profit,
      received: getOrderPaid(order),
      order,
    }))
  const saleHistory = materialSales
    .filter((sale) => String(sale.client_id) === String(clientId))
    .map((sale) => ({
      type: 'material_sale',
      id: sale.id,
      date: sale.date,
      ...getInventorySaleFinancials(sale),
      sale,
    }))

  return [...orderHistory, ...saleHistory].sort(
    (left, right) => new Date(right.date || 0) - new Date(left.date || 0),
  )
}
