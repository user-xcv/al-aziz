import {
  getOrderFinancials,
  operatingCostFields,
  serviceRevenueFields,
} from './orderCalculations.js'

const asAmount = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

export const getOrderTotal = (order) => {
  const financials = getOrderFinancials(order)
  const hasFinancialDetails =
    (order.order_materials || []).length > 0 ||
    [...serviceRevenueFields, ...operatingCostFields].some((key) => order[key] !== undefined)
  return hasFinancialDetails ? financials.revenue : asAmount(order.order_total)
}

export const getOrderPaid = (order, excludedPaymentId) => {
  const recordedPayments = (order.payments || []).reduce(
    (total, payment) =>
      total + (payment.id === excludedPaymentId ? 0 : asAmount(payment.amount)),
    0,
  )
  return asAmount(order.opening_paid) + recordedPayments
}
