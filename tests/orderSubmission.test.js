import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderAPI } from '../src/features/enterData/orderService.js'
import {
  formatOrderSubmitError,
  validateOrderDraft,
} from '../src/features/enterData/orderSubmission.js'

const categories = [{ id: 1, formats: [{ id: 11, name: 'Katta' }, { id: 12, name: 'Kichik' }] }]
const materials = [
  {
    id: 101,
    category_id: 1,
    format_id: 11,
    name: 'Faner',
    cost_price: 300000,
    markup_price: 50000,
    stock_count: 5,
  },
]
const validForm = {
  client_id: '4',
  overallmoney: '100000',
  bazis: '40000',
  cutting: '',
  kromka: '',
  piercing: '',
  rover: '',
  masterfee: '10000',
  spares: '',
  anotherexpenses: '',
}

test('allows service-only orders and ignores the untouched empty material row', () => {
  assert.equal(
    validateOrderDraft({
      form: { ...validForm, overallmoney: '40000' },
      lines: [{ categoryId: '', formatId: '', materialId: '', count: '', customMarkup: '' }],
      categories,
      materials,
    }),
    '',
  )
})

test('reports incomplete material category, format, material, and quantity inline', () => {
  const validate = (line) => validateOrderDraft({
    form: validForm,
    lines: [line],
    categories,
    materials,
  })

  assert.match(validate({ categoryId: '1' }), /formatni tanlang/)
  assert.match(validate({ categoryId: '1', formatId: '11' }), /materialni tanlang/)
  assert.match(validate({ categoryId: '1', formatId: '11', materialId: '101', count: '1.5' }), /butun dona/)
  assert.match(validate({ categoryId: '1', formatId: '11', materialId: '101', count: '1' }), /ustama noto‘g‘ri/)
})

test('validates stock and customer while allowing an advance above the order total', () => {
  const base = {
    form: { ...validForm, overallmoney: '7000000', bazis: '0' },
    lines: [{ categoryId: '1', formatId: '11', materialId: '101', count: '1', customMarkup: '' }],
    categories,
    materials,
  }
  assert.equal(validateOrderDraft(base), '')

  assert.match(
    validateOrderDraft({ ...base, form: { ...base.form, overallmoney: '-1' } }),
    /Pul qiymatlarini/,
  )
  assert.match(
    validateOrderDraft({ ...base, lines: [{ ...base.lines[0], count: '6' }] }),
    /omborda 5 dona/,
  )
  assert.match(
    validateOrderDraft({ ...base, form: { ...base.form, client_id: '' } }),
    /Mijozni tanlang/,
  )
})

test('shows missing RPC, permissions, and backend validation details', () => {
  assert.match(formatOrderSubmitError({ code: 'PGRST202', message: 'not found' }), /supabase-setup.sql/)
  assert.match(formatOrderSubmitError({ code: '42501', message: 'permission denied' }), /RLS/)
  assert.match(formatOrderSubmitError({ code: 'P0001', message: 'Stok yetarli emas' }), /P0001.*Stok yetarli emas/)
})

test('order RPC receives order_data and confirms a valid database order id', async () => {
  let actualRequest
  const client = {
    async rpc(name, payload) {
      actualRequest = { name, payload }
      return { data: 246, error: null }
    },
  }

  const result = await createOrderAPI({
    client_id: '4',
    bazis: '40000',
    materials: [{ material_id: 101, count: 2, unit_markup: 50000 }],
  }, client)

  assert.deepEqual(result, { success: true, id: 246 })
  assert.equal(actualRequest.name, 'create_order_with_materials')
  assert.equal(actualRequest.payload.order_data.client_id, '4')
  assert.deepEqual(actualRequest.payload.order_data.materials, [
    { material_id: 101, count: 2, unit_markup: 50000 },
  ])
})

test('order RPC failures and missing confirmation are never treated as success', async () => {
  const failedClient = {
    async rpc() {
      return { data: null, error: { code: 'P0001', message: 'Mijoz topilmadi' } }
    },
  }
  await assert.rejects(() => createOrderAPI({ materials: [] }, failedClient), /P0001.*Mijoz topilmadi/)

  const noIdClient = { async rpc() { return { data: null, error: null } } }
  await assert.rejects(() => createOrderAPI({ materials: [] }, noIdClient), /raqami qaytmadi/)
})
