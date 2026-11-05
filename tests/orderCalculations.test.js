import assert from 'node:assert/strict'
import test from 'node:test'
import {
  aggregateOrderFinancials,
  calculateOrderTotals,
  getOrderFinancials,
} from '../src/features/enterData/orderCalculations.js'
import { getOrderPaid, getOrderTotal } from '../src/features/enterData/orderAmounts.js'

test('calculates material markup and service revenue without double-counting markup', () => {
  const totals = calculateOrderTotals(
    {
      bazis: '50000',
      cutting: '40000',
      kromka: '60000',
      piercing: '50000',
      overallmoney: '600000',
    },
    [
      { count: 1, cost_price: 300000, unit_markup: 50000, price: 350000 },
    ],
  )

  assert.deepEqual(totals, {
    revenue: 550000,
    paymentsReceived: 600000,
    materialCosts: 300000,
    materialMarkup: 50000,
    serviceRevenue: 200000,
    operatingCosts: 0,
    totalCosts: 300000,
    profit: 300000,
  })
})

test('keeps negative profit visible instead of clamping it to zero', () => {
  const totals = calculateOrderTotals(
    { overallmoney: 0 },
    [{ count: 1, cost_price: 50, unit_markup: -25, price: 25 }],
  )

  assert.equal(totals.revenue, 25)
  assert.equal(totals.totalCosts, 50)
  assert.equal(totals.profit, -50)
  assert.equal(totals.materialMarkup, -25)
  assert.equal(totals.paymentsReceived, 0)
})

test('ignores invalid numeric input without producing NaN', () => {
  const totals = calculateOrderTotals(
    { overallmoney: 'not-a-number', bazis: undefined },
    [{ count: 'x', cost_price: 50 }],
  )

  assert.deepEqual(totals, {
    revenue: 0,
    paymentsReceived: 0,
    materialCosts: 0,
    materialMarkup: 0,
    serviceRevenue: 0,
    operatingCosts: 0,
    totalCosts: 0,
    profit: 0,
  })
})

test('calculates the live net amount from received money minus costs', () => {
  const totals = calculateOrderTotals(
    {
      overallmoney: '7000000',
      masterfee: '15000',
      spares: '5000',
    },
    [{ count: 1, cost_price: 300000, unit_markup: 50000, price: 350000 }],
  )

  assert.equal(totals.paymentsReceived, 7000000)
  assert.equal(totals.totalCosts, 320000)
  assert.equal(totals.profit, 6680000)
  assert.equal(totals.materialMarkup, 50000)
})

test('derives saved order financials from material snapshots and service revenue', () => {
  const financials = getOrderFinancials({
    overallmoney: 550000,
    order_total: 550000,
    bazis: 50000,
    cutting: 40000,
    kromka: 60000,
    piercing: 50000,
    order_materials: [{
      count: 1,
      price: 350000,
      totalprice: 350000,
      unit_cost: 300000,
      total_cost: 300000,
      unit_markup: 50000,
      total_markup: 50000,
    }],
  })

  assert.deepEqual(financials, {
    revenue: 550000,
    materialCosts: 300000,
    materialMarkup: 50000,
    serviceRevenue: 200000,
    operatingCosts: 0,
    totalCosts: 300000,
    paymentsReceived: 550000,
    profit: 250000,
  })
})

test('uses saved unit costs when older material rows have an empty total cost snapshot', () => {
  const financials = getOrderFinancials({
    overallmoney: 700,
    order_materials: [{
      count: 2,
      price: 350,
      totalprice: 700,
      unit_cost: 300,
      total_cost: 0,
      total_markup: 0,
    }],
  })

  assert.equal(financials.materialCosts, 600)
  assert.equal(financials.materialMarkup, 100)
  assert.equal(financials.revenue, 700)
  assert.equal(financials.profit, 100)
})

test('excludes internal costs from customer total and subtracts them from profit', () => {
  const totals = calculateOrderTotals(
    {
      cutting: 40000,
      masterfee: 15000,
      spares: 5000,
      anotherexpenses: 2000,
      overallmoney: 390000,
    },
    [{ count: 1, cost_price: 300000, unit_markup: 50000, price: 350000 }],
  )

  assert.equal(totals.revenue, 390000)
  assert.equal(totals.serviceRevenue, 40000)
  assert.equal(totals.materialMarkup, 50000)
  assert.equal(totals.operatingCosts, 22000)
  assert.equal(totals.totalCosts, 322000)
  assert.equal(totals.profit, 68000)
  assert.equal(totals.profit, totals.revenue - totals.totalCosts)
})

test('aggregates each service separately without adding receipts to sales', () => {
  const summary = aggregateOrderFinancials([
    {
      bazis: 50000,
      cutting: 40000,
      kromka: 60000,
      piercing: 50000,
      rover: 0,
      masterfee: 15000,
      spares: 5000,
      anotherexpenses: 2000,
      order_materials: [{
        count: 1,
        totalprice: 350000,
        total_cost: 300000,
        total_markup: 50000,
      }],
    },
    {
      cutting: 10000,
      overallmoney: 10000,
      order_materials: [],
    },
  ])

  assert.equal(summary.customerTotal, 560000)
  assert.equal(summary.materialSales, 350000)
  assert.equal(summary.materialCosts, 300000)
  assert.equal(summary.materialMarkup, 50000)
  assert.equal(summary.serviceRevenue, 210000)
  assert.equal(summary.operatingCosts, 22000)
  assert.equal(summary.netProfit, -312000)
  assert.deepEqual(summary.serviceRevenueByField, {
    bazis: 50000,
    cutting: 50000,
    kromka: 60000,
    piercing: 50000,
    rover: 0,
  })
})

test('calculates invoice revenue, legacy paid amount, and remaining linked balance', () => {
  const order = {
    order_total: 250,
    opening_paid: 20,
    payments: [
      { id: 1, amount: 30 },
      { id: 2, amount: 40 },
    ],
  }

  assert.equal(getOrderTotal(order), 250)
  assert.equal(getOrderPaid(order), 90)
  assert.equal(getOrderPaid(order, 2), 50)
})

test('derives invoice total for a legacy order without an order_total column value', () => {
  assert.equal(
    getOrderTotal({
      order_total: 0,
      bazis: 100,
      order_materials: [{ totalprice: 500 }],
    }),
    600,
  )
})
