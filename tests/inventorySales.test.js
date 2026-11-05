import assert from 'node:assert/strict'
import test from 'node:test'
import {
  aggregateCrmFinancials,
  aggregateInventorySales,
  getCustomerBusinessHistory,
  getInventorySaleFinancials,
  getInventorySaleQuote,
  isWithinReportPeriod,
  sumInventorySalePayments,
  validateInventorySaleDraft,
} from '../src/features/inventorySales/inventorySaleCalculations.js'
import {
  createInventorySaleAPI,
  fetchInventorySalesAPI,
  recordInventorySalePaymentAPI,
} from '../src/features/inventorySales/inventorySalesService.js'

const sampleSale = {
  id: 8,
  client_id: 3,
  material_name: 'Kashmir',
  quantity: 2,
  unit_cost: 300000,
  unit_sale_price: 350000,
  total_cost: 600000,
  sale_total: 700000,
  profit: 100000,
  date: '2026-11-02T10:00:00Z',
  inventory_sale_payments: [{ amount: 200000 }, { amount: 100000 }],
}
const material = {
  id: 5,
  name: 'Kashmir',
  stock_count: 7,
  cost_price: 300000,
  sell_price: 350000,
}

test('sale quote scales saved unit prices by count and validates stock and receipts', () => {
  assert.deepEqual(getInventorySaleQuote(material, '3'), {
    quantity: 3,
    unitCost: 300000,
    unitSalePrice: 350000,
    totalCost: 900000,
    saleTotal: 1050000,
    profit: 150000,
  })
  assert.equal(validateInventorySaleDraft({
    material,
    quantity: '3',
    amountPaid: '500000',
  }), '')
  assert.match(validateInventorySaleDraft({
    material,
    quantity: '8',
    amountPaid: '0',
  }), /omborda 7 dona/i)
  assert.match(validateInventorySaleDraft({
    material,
    quantity: '1.5',
    amountPaid: '0',
  }), /butun dona/)
  assert.match(validateInventorySaleDraft({
    material,
    quantity: '2',
    amountPaid: '700001',
  }), /700\s000/)
})

test('direct sale snapshots calculate revenue, cost, profit, received and balance', () => {
  assert.deepEqual(getInventorySaleFinancials(sampleSale), {
    quantity: 2,
    revenue: 700000,
    cost: 600000,
    profit: 100000,
    received: 300000,
    balance: 400000,
  })
})

test('CRM totals add direct material sale revenue and profit once to order totals', () => {
  const summary = aggregateCrmFinancials(
    [{
      order_total: 390000,
      overallmoney: 390000,
      cutting: 40000,
      order_materials: [{
        count: 1,
        totalprice: 350000,
        total_cost: 300000,
        total_markup: 50000,
      }],
    }],
    [sampleSale],
  )

  assert.equal(summary.orderRevenue, 390000)
  assert.equal(summary.standaloneMaterialRevenue, 700000)
  assert.equal(summary.standaloneMaterialCosts, 600000)
  assert.equal(summary.standaloneMaterialProfit, 100000)
  assert.equal(summary.totalRevenue, 1090000)
  assert.equal(summary.totalProfit, 190000)
  assert.equal(summary.totalMaterialCosts, 900000)
  assert.equal(summary.serviceRevenueByField.cutting, 40000)
})

test('monthly period filter includes only this month and filters future or other-month data', () => {
  const referenceDate = new Date('2026-11-03T12:00:00')
  assert.equal(isWithinReportPeriod(sampleSale.date, 'month', referenceDate), true)
  assert.equal(isWithinReportPeriod('2026-10-15T12:00:00Z', 'month', referenceDate), false)
  assert.equal(isWithinReportPeriod('2026-11-10T12:00:00Z', 'month', referenceDate), false)
  assert.equal(isWithinReportPeriod('2026-11-10T12:00:00Z', 'week', referenceDate), false)
  assert.equal(isWithinReportPeriod('invalid', 'month', referenceDate), false)
})

test('customer history combines dated orders and linked standalone sales newest first', () => {
  const history = getCustomerBusinessHistory(
    3,
    [
      {
        id: 4,
        client_id: 3,
        date: '2026-11-01T10:00:00Z',
        order_total: 500,
        opening_paid: 100,
        cutting: 500,
        order_materials: [],
        payments: [{ id: 7, amount: 50 }],
      },
      { id: 5, client_id: 99, date: '2026-11-03T10:00:00Z' },
    ],
    [sampleSale],
  )

  assert.deepEqual(history.map((event) => [event.type, event.id]), [
    ['material_sale', 8],
    ['order', 4],
  ])
  assert.equal(history[1].received, 150)
  assert.equal(history[0].received, 300000)
})

test('sale RPC uses the JSON payload contract and requires a returned database id', async () => {
  let call
  const client = {
    async rpc(name, args) {
      call = { name, args }
      return { data: 17, error: null }
    },
  }
  const saleData = {
    material_id: 5,
    quantity: 2,
    client_id: null,
    amount_paid: 300,
    payment_type: 'card',
  }

  assert.deepEqual(await createInventorySaleAPI(saleData, client), { id: 17 })
  assert.deepEqual(call, {
    name: 'create_inventory_sale',
    args: { sale_data: saleData },
  })
  await assert.rejects(() => createInventorySaleAPI(saleData, {
    async rpc() { return { data: null, error: { code: 'P0001', message: 'Omborda yetarli material yo‘q' } } },
  }), (error) => error.message === 'Omborda yetarli material yo‘q')
  await assert.rejects(() => createInventorySaleAPI(saleData, {
    async rpc() { return { data: null, error: null } },
  }), /savdo raqami qaytmadi/)
})

test('sale fetch reads snapshot, customer and payment history and propagates errors', async () => {
  let table
  const client = {
    from(name) {
      table = name
      return {
        select(value) {
          assert.match(value, /inventory_sale_payments/)
          return {
            async order(column, options) {
              assert.equal(column, 'date')
              assert.equal(options.ascending, false)
              return { data: [sampleSale], error: null }
            },
          }
        },
      }
    },
  }
  assert.deepEqual(await fetchInventorySalesAPI(client), [sampleSale])
  assert.equal(table, 'inventory_sales')
  const failedClient = {
    from: () => ({
      select: () => ({
        order: async () => ({ data: null, error: { message: 'denied' } }),
      }),
    }),
  }
  await assert.rejects(() => fetchInventorySalesAPI(failedClient), (error) => error.message === 'denied')
})

test('sale payment RPC contract passes only the selected sale payment values', async () => {
  let call
  const client = {
    async rpc(name, args) {
      call = { name, args }
      return { data: 23, error: null }
    },
  }
  assert.deepEqual(await recordInventorySalePaymentAPI({
    sale_id: 17,
    amount: 500,
    payment_type: 'transfer',
    notes: 'Qoldiq',
  }, client), { id: 23 })
  assert.deepEqual(call, {
    name: 'record_inventory_sale_payment',
    args: { sale_id: 17, amount: 500, payment_type: 'transfer', notes: 'Qoldiq' },
  })
})

test('standalone sale report sums quantity and collection without treating it as profit', () => {
  assert.deepEqual(aggregateInventorySales([sampleSale]), {
    count: 1,
    quantity: 2,
    revenue: 700000,
    cost: 600000,
    profit: 100000,
    received: 300000,
    balance: 400000,
  })
})

test('collected money is reported in the payment month, separately from sale revenue month', () => {
  const sales = [{
    ...sampleSale,
    date: '2026-10-20T10:00:00Z',
    inventory_sale_payments: [
      { amount: 200, date: '2026-10-20T10:00:00Z' },
      { amount: 300, date: '2026-11-02T10:00:00Z' },
    ],
  }]
  const currentMonth = new Date('2026-11-03T12:00:00Z')

  assert.equal(isWithinReportPeriod(sales[0].date, 'month', currentMonth), false)
  assert.equal(sumInventorySalePayments(sales, 'month', currentMonth), 300)
})
