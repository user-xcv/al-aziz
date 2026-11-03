import assert from 'node:assert/strict'
import test from 'node:test'
import {
  findOverStockMaterial,
  getFormatsForCategory,
  getMaterialSelectionTotals,
  getMaterialsForSelection,
} from '../src/features/enterData/materialSelection.js'

const categories = [
  { id: 1, formats: [{ id: 11, name: 'Katta' }, { id: 12, name: 'Kichik' }] },
  { id: 2, formats: [{ id: 21, name: 'Katta' }] },
  { id: 3, formats: [] },
]

const materials = [
  { id: 101, category_id: 1, format_id: 11, name: 'Faner katta' },
  { id: 102, category_id: 1, format_id: 12, name: 'Faner kichik' },
  { id: 201, category_id: 2, format_id: 21, name: 'MDF katta' },
  { id: 301, category_id: 3, format_id: null, name: 'Yelim' },
  { id: 302, category_id: 1, format_id: null, name: 'Format biriktirilmagan' },
]

test('formats are scoped to the selected category', () => {
  assert.deepEqual(getFormatsForCategory(categories, '1').map(({ id }) => id), [11, 12])
  assert.deepEqual(getFormatsForCategory(categories, '2').map(({ id }) => id), [21])
  assert.deepEqual(getFormatsForCategory(categories, '').map(({ id }) => id), [])
})

test('materials require an exact selected category and format pair', () => {
  assert.deepEqual(getMaterialsForSelection(materials, 1, '', categories[0].formats), [])
  assert.deepEqual(
    getMaterialsForSelection(materials, 1, '11', categories[0].formats).map(({ id }) => id),
    [101],
  )
  assert.deepEqual(
    getMaterialsForSelection(materials, 2, '21', categories[1].formats).map(({ id }) => id),
    [201],
  )
  assert.deepEqual(getMaterialsForSelection(materials, 1, '21', categories[0].formats), [])
})

test('categories without formats show only materials not assigned to a format', () => {
  assert.deepEqual(
    getMaterialsForSelection(materials, 3, '', categories[2].formats).map(({ id }) => id),
    [301],
  )
})

test('calculates total quantity and sale/cost/markup totals from unit values', () => {
  assert.deepEqual(
    getMaterialSelectionTotals([
      { count: 2, price: 350, cost_price: 300, unit_markup: 50 },
      { count: 3, price: 120, cost_price: 100, unit_markup: 20 },
    ]),
    { quantity: 5, lineCount: 2, saleTotal: 1060, costTotal: 900, markupTotal: 160 },
  )
})

test('detects stock overuse when the same material is selected in multiple lines', () => {
  assert.equal(
    findOverStockMaterial([
      { material_id: 1, name: 'Faner', count: 3, stock: 5 },
      { material_id: 1, name: 'Faner', count: 3, stock: 5 },
    ]).count,
    6,
  )
  assert.equal(
    findOverStockMaterial([
      { material_id: 1, name: 'Faner', count: 2, stock: 5 },
      { material_id: 1, name: 'Faner', count: 3, stock: 5 },
    ]),
    undefined,
  )
})
