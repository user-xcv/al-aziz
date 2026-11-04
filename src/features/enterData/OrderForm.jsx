import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from './orderThunk'
import { matchesFormat } from '../wareHouse/wareHouseService'
import { createClient } from '../clients/clientsThunk'
import { calculateOrderTotals, getAdvanceValidationError } from './orderCalculations'
import { formatOrderSubmitError, validateOrderDraft } from './orderSubmission'
import {
  getFormatsForCategory,
  getMaterialSelectionTotals,
  getMaterialsForSelection,
} from './materialSelection'
import {
  CircleDot,
  Cpu,
  HandCoins,
  HelpCircle,
  Layers,
  Monitor,
  PackagePlus,
  PlusCircle,
  Scissors,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react'

const emptyLine = { categoryId: '', formatId: '', materialId: '', count: '', customMarkup: '' }

const sanitizeNumericInput = (value) => {
  if (value === null || value === undefined) return ''

  const cleaned = String(value)
    .replace(/\s+/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '')

  if (!cleaned) return ''

  const [whole, ...decimalParts] = cleaned.split('.')
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0'
  const normalizedDecimal = decimalParts.length ? `.${decimalParts.join('')}` : ''

  return `${normalizedWhole}${normalizedDecimal}`
}

const formatCurrencyForInput = (value) => {
  if (value === '' || value === null || value === undefined) return ''

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return ''

  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

const formatCurrencyValue = (value) => {
  if (value === '' || value === null || value === undefined) return '0'

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return '0'

  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

const OrderForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [] } = useSelector((state) => state.wareHouse || {})
  const { clients = [] } = useSelector((state) => state.clients || {})
  const { isLoading: isSavingOrder = false } = useSelector((state) => state.orders || {})

  const [form, setForm] = useState({
    client_id: '',
    name: '',
    phone_number: '',
    bazis: '',
    cutting: '',
    kromka: '',
    piercing: '',
    rover: '',
    masterfee: '',
    spares: '',
    anotherexpenses: '',
    overallmoney: '',
  })
  const [lines, setLines] = useState([emptyLine])
  const [open, setOpen] = useState(false)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone_number: ''
  })


  const handleChange = (e) => {
    const { name, value } = e.target
    const parsedValue = sanitizeNumericInput(value)

    setForm({
      ...form,
      [name]: parsedValue === '' ? '' : Number(parsedValue),
    })
    setSubmitError('')
    setSubmitSuccess('')
  }

  const handleCurrencyInput = (e) => {
    const { name, value } = e.target
    const parsedValue = sanitizeNumericInput(value)

    setForm((prev) => ({
      ...prev,
      [name]: parsedValue === '' ? '' : Number(parsedValue),
    }))
    setSubmitError('')
    setSubmitSuccess('')
  }

  const handleClientChange = (e) => {
    const clientId = e.target.value
    const selectedClient = clients.find(c => String(c.id) === String(clientId))
    setForm({
      ...form,
      client_id: clientId,
      name: selectedClient?.name || '',
      phone_number: selectedClient?.phone_number || ''
    })
    setSubmitError('')
  }

  const handleAddNewClient = async (e) => {
    e.preventDefault()
    if (!newClientForm.name.trim()) {
      setSubmitError('Mijoz ismini kiriting.')
      return
    }

    try {
      const data = await dispatch(createClient({
          name: newClientForm.name.trim(),
          phone_number: newClientForm.phone_number || null
      })).unwrap()

      setForm({
        ...form,
        client_id: data.id,
        name: data.name,
        phone_number: data.phone_number || ''
      })
      setShowNewClientModal(false)
      setNewClientForm({ name: '', phone_number: '' })
      setSubmitError('')
      setSubmitSuccess('')
    } catch (err) {
      setSubmitError(formatOrderSubmitError(err))
    }
  }

  const selectedLines = lines
    .map((line) => {
      const category = categories.find((c) => String(c.id) === String(line.categoryId))
      const format = category?.formats?.find((f) => String(f.id) === String(line.formatId))
      const item = materials.find((m) => String(m.id) === String(line.materialId))
      const matchesSelection = getMaterialsForSelection(
        materials,
        line.categoryId,
        line.formatId,
        category?.formats,
      ).some((material) => String(material.id) === String(line.materialId))
      if (!item || !line.count || !matchesSelection) return null
      const itemFormat = category?.formats?.find((candidate) => matchesFormat(item, candidate))
      const resolvedFormat = format || itemFormat
      const count = Number(line.count)
      const costPrice = Number(item.cost_price || 0)
      const hasInventorySalePrice = item.sell_price !== null && item.sell_price !== undefined
      const basePrice = hasInventorySalePrice
        ? Number(item.sell_price)
        : Number(resolvedFormat?.default_price ?? costPrice)
      const inventoryMarkup = item.markup_price !== null && item.markup_price !== undefined
        ? Number(item.markup_price ?? (basePrice - costPrice))
        : basePrice - costPrice
      const unitMarkup = line.customMarkup !== ''
        ? Number(line.customMarkup)
        : inventoryMarkup
      const price = costPrice + unitMarkup
      return {
        material_id: item.id,
        material_name: [category?.name || '', item.name, resolvedFormat?.name].filter(Boolean).join(' · '),
        count,
        price,
        unit_markup: unitMarkup,
        totalPrice: count * price,
        cost_price: costPrice,
        stock: Number(item.stock_count || 0),
        name: item.name,
        format_id: resolvedFormat?.id,
        format_name: resolvedFormat?.name,
      }
    })
    .filter(Boolean)

  const {
    revenue: orderTotal,
    totalCosts,
    materialCosts,
    profit: livePayoff,
    materialMarkup,
    serviceRevenue,
    operatingCosts,
  } = calculateOrderTotals(form, selectedLines)
  const customerReceived = Number(form.overallmoney || 0)
  const liveBalance = customerReceived - totalCosts
  const advanceError = getAdvanceValidationError(form.overallmoney, orderTotal)
  const materialTotals = getMaterialSelectionTotals(selectedLines)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const validationError = validateOrderDraft({
      form,
      lines,
      categories,
      materials,
      orderTotal,
    })
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    try {
      const result = await dispatch(
        createOrder({
          ...form,
          materials: selectedLines,
        }),
      ).unwrap()
      setSubmitSuccess(`Buyurtma #${result.id} Supabase’da saqlandi.`)
      setForm({
        client_id: '',
        name: '',
        phone_number: '',
        bazis: '',
        cutting: '',
        kromka: '',
        piercing: '',
        rover: '',
        masterfee: '',
        spares: '',
        anotherexpenses: '',
        overallmoney: '',
      })
      setLines([emptyLine])
      setOpen(false)
    } catch (error) {
      setSubmitError(formatOrderSubmitError(error))
    }
  }

  return (
    <>
    <form
      noValidate
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-xs text-slate-700 font-sans h-full flex flex-col"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-800">Yangi buyurtma</h2>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto">
        {submitError && (
          <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {submitSuccess}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Mijoz
            </label>
            <div className="flex gap-2">
              <select
                value={form.client_id}
                onChange={handleClientChange}
                className="flex-1 bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs"
              >
                <option value="">Mijoz tanlang</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.phone_number ? `(${client.phone_number})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                title="Yangi mijoz qo'shish"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <HandCoins className="w-3.5 h-3.5 text-slate-400" />
              Avans / olingan pul (so‘m)
            </label>
            <input
              value={formatCurrencyForInput(form.overallmoney)}
              name="overallmoney"
              onChange={handleCurrencyInput}
              placeholder="0"
              type="text"
              inputMode="numeric"
              aria-describedby={advanceError ? 'advance-help advance-error' : 'advance-help'}
              aria-invalid={Boolean(advanceError)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs font-bold"
            />
            <p id="advance-help" className="mt-1 text-[10px] text-slate-500">
              Jami: {formatCurrencyValue(orderTotal)} so‘m
            </p>
            {advanceError && (
              <p id="advance-error" role="alert" className="mt-1 rounded bg-rose-50 p-2 text-[11px] text-rose-700">
                {advanceError}
              </p>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Materiallar va xizmatlar
            </p>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md"
            >
              {open ? <X className="w-3 h-3" /> : <PackagePlus className="w-3 h-3" />}
              {open ? 'Material tanlashni yopish' : 'Ombordan material qo‘shish'}
            </button>
          </div>

          {open && (
            <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
              {lines.map((line, index) => {
                const category = categories.find((c) => String(c.id) === String(line.categoryId))
                const formats = getFormatsForCategory(categories, line.categoryId)
                const selectedFormat = formats.find((f) => String(f.id) === String(line.formatId))
                const availableMaterials = getMaterialsForSelection(
                  materials,
                  line.categoryId,
                  line.formatId,
                  formats,
                )
                const item = availableMaterials.find((material) =>
                  String(material.id) === String(line.materialId)
                )
                const costPrice = Number(item?.cost_price || 0)
                const hasInventorySalePrice = item?.sell_price !== null && item?.sell_price !== undefined
                const basePrice = hasInventorySalePrice
                  ? Number(item.sell_price)
                  : Number(selectedFormat?.default_price ?? costPrice)
                const inventoryMarkup = item?.markup_price !== null && item?.markup_price !== undefined
                  ? Number(item.markup_price ?? (basePrice - costPrice))
                  : basePrice - costPrice
                const unitMarkup = line.customMarkup !== ''
                  ? Number(line.customMarkup)
                  : inventoryMarkup
                const price = costPrice + unitMarkup
                const total = Number(line.count || 0) * price

                return (
                  <div key={index} className="p-2 bg-white rounded border border-slate-200 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={line.categoryId}
                        onChange={(e) => {
                          const next = [...lines]
                          next[index] = { ...next[index], categoryId: e.target.value, formatId: '', materialId: '', customMarkup: '' }
                          setLines(next)
                        }}
                        className="col-span-7 border border-slate-200 rounded p-1.5 text-xs bg-white"
                      >
                        <option value="">Kategoriya tanlang</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={item?.stock_count || undefined}
                        value={line.count}
                        onChange={(e) => {
                          const next = [...lines]
                          next[index] = { ...next[index], count: e.target.value }
                          setLines(next)
                        }}
                        placeholder="Soni (dona)"
                        className="col-span-2 border border-slate-200 rounded p-1.5 text-xs"
                      />
                      <div className="col-span-3 text-right">
                        <p className="text-[10px] text-slate-400">Jami (so‘m)</p>
                        <p className="text-xs font-bold text-blue-600">
                          {total ? `${total.toLocaleString('uz-UZ')} so‘m` : '0 so‘m'}
                        </p>
                      </div>
                    </div>

                    {category && (
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {formats.length > 0 && (
                          <select
                            value={line.formatId}
                            onChange={(e) => {
                              const next = [...lines]
                              next[index] = { ...next[index], formatId: e.target.value, materialId: '', customMarkup: '' }
                              setLines(next)
                            }}
                            className="col-span-7 border border-slate-200 rounded p-1.5 text-xs bg-white"
                          >
                            <option value="">Format tanlang (ixtiyoriy)</option>
                            {formats.map((fmt) => (
                              <option key={fmt.id} value={fmt.id}>
                                {fmt.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <select
                          disabled={!category || (formats.length > 0 && !line.formatId)}
                          value={line.materialId}
                          onChange={(e) => {
                            const next = [...lines]
                            next[index] = { ...next[index], materialId: e.target.value, customMarkup: '' }
                            setLines(next)
                          }}
                          className={`${formats.length > 0 ? 'col-span-7' : 'col-span-12'} border border-slate-200 rounded p-1.5 text-xs bg-white`}
                        >
                          <option value="">
                            {!category
                              ? 'Avval kategoriya tanlang'
                              : formats.length > 0 && !line.formatId
                                ? 'Avval format tanlang'
                                : 'Material tanlang'}
                          </option>
                          {availableMaterials.map((material) => (
                            <option key={material.id} value={material.id}>
                              {material.name} · {material.stock_count} dona
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={-costPrice}
                          value={line.customMarkup !== '' ? line.customMarkup : (item ? String(inventoryMarkup) : '')}
                          onChange={(e) => {
                            const next = [...lines]
                            next[index] = { ...next[index], customMarkup: e.target.value }
                            setLines(next)
                          }}
                          placeholder={`Ustama (olish ${costPrice.toLocaleString('uz-UZ')})`}
                          className="col-span-7 border border-slate-200 rounded p-1.5 text-xs"
                        />
                        <div className="col-span-5 text-right">
                          <p className="text-[10px] text-slate-400">Sotish / dona (so‘m)</p>
                          <p className="text-xs font-semibold text-slate-600">
                            {price.toLocaleString('uz-UZ')} so‘m
                          </p>
                          <p className="text-[10px] text-emerald-600">
                            Ustama: {unitMarkup.toLocaleString('uz-UZ')} so‘m
                          </p>
                        </div>
                      </div>
                    )}
                    {category && formats.length > 0 && !selectedFormat && (
                      <p className="text-[10px] text-slate-500">Materialni ko‘rish uchun format tanlang.</p>
                    )}
                    {selectedFormat && availableMaterials.length === 0 && (
                      <p className="text-[10px] text-slate-500">Bu formatda material yo‘q.</p>
                    )}

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = lines.filter((_, i) => i !== index)
                          setLines(next)
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-700"
                      >
                        - O'chirish
                      </button>
                    )}
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => setLines([...lines, emptyLine])}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                + Yana material
              </button>
            </div>
          )}
          {materialTotals.quantity > 0 && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs">
              <span className="font-medium text-slate-600">
                Materiallar: {materialTotals.quantity.toLocaleString('uz-UZ')} dona
              </span>
              <span className="font-bold text-blue-700">
                Jami: {materialTotals.saleTotal.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ['bazis', 'Bazis', Layers],
              ['cutting', 'Arra', Scissors],
              ['kromka', 'Kromka', Sparkles],
              ['piercing', 'Teshish', CircleDot],
              ['rover', 'Rover', Monitor],
            ].map(([name, label, Icon]) => (
              <div key={name} className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Icon className="w-3 h-3 text-slate-400" /> {label} (so‘m)
                </label>
                <input
                  value={formatCurrencyForInput(form[name])}
                  name={name}
                  onChange={handleCurrencyInput}
                  placeholder="0"
                  type="text"
                  inputMode="numeric"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Qo'shimcha xarajatlar (sof foydadan chiqariladi)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ['masterfee', 'Usta haqi', Wrench],
                ['spares', 'Zapchast xarajati', Cpu],
                ['anotherexpenses', 'Boshqa xarajat', HelpCircle],
              ].map(([name, label, Icon]) => (
                <div key={name} className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                    <Icon className="w-3 h-3 text-slate-400" /> {label} (so'm)
                  </label>
                  <input
                    value={formatCurrencyForInput(form[name])}
                    name={name}
                    onChange={handleCurrencyInput}
                    placeholder="0"
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Live Calculation & Net Payoff
            </p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              real time
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Mijoz bergan pul</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrencyValue(customerReceived)} so‘m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Material tannarxi</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrencyValue(materialCosts)} so‘m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Xizmatlar</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrencyValue(serviceRevenue)} so‘m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Ichki xarajatlar</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrencyValue(operatingCosts)} so‘m</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Qoldiq</p>
              <p className={`mt-1 text-sm font-bold ${liveBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrencyValue(liveBalance)} so‘m
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] text-slate-400">Sof foyda</p>
              <p className={`mt-1 text-sm font-bold ${livePayoff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrencyValue(livePayoff)} so‘m
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Kutilayotgan foyda
            </p>
            <span
              className={`text-sm font-bold block mt-0.5 ${
                livePayoff < 0 ? 'text-rose-600' : livePayoff > 0 ? 'text-emerald-600' : 'text-slate-700'
              }`}
            >
              {formatCurrencyValue(livePayoff)} so‘m
            </span>
            <p className="mt-1 text-[10px] text-slate-400">
              Formula: mijoz to‘lovi − material tannarxi − ichki xarajatlar = sof foyda
            </p>
          </div>
          <div className="text-right mr-3">
            <p className="text-[10px] text-slate-400">Buyurtma jami: {formatCurrencyValue(orderTotal)} so‘m</p>
            <p className="text-[10px] text-slate-400">Material tannarxi: {formatCurrencyValue(materialCosts)} so‘m</p>
            <p className="text-[10px] text-slate-400">Material ustamasi: {formatCurrencyValue(materialMarkup)} so‘m · Xizmat: {formatCurrencyValue(serviceRevenue)} so‘m</p>
            <p className="text-[10px] text-slate-400">Jami xarajat: {formatCurrencyValue(totalCosts)} so‘m (ichki {formatCurrencyValue(operatingCosts)})</p>
          </div>
          <button
            type="submit"
            disabled={isSavingOrder}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-md text-xs"
          >
            {isSavingOrder ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </form>

    {/* Yangi Mijoz Modal */}
    {showNewClientModal && (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Yangi mijoz qo'shish
            </h3>
            <button
              onClick={() => setShowNewClientModal(false)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddNewClient} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                Mijoz ismi *
              </label>
              <input
                required
                value={newClientForm.name}
                onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                placeholder="Ism va familiya"
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                Telefon raqami
              </label>
              <input
                value={newClientForm.phone_number}
                onChange={(e) => setNewClientForm({ ...newClientForm, phone_number: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-md text-xs"
              >
                Qo'shish
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  )
}

export default OrderForm
