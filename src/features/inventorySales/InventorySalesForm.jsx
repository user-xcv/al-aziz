import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createInventorySale, recordInventorySalePayment } from './inventorySalesThunk'
import {
  getInventorySaleFinancials,
  getInventorySaleQuote,
  validateInventorySaleDraft,
} from './inventorySaleCalculations'
import { getFormatsForCategory, getMaterialsForSelection } from '../enterData/materialSelection'
import { CircleDollarSign, PackageCheck, Receipt, Wallet } from 'lucide-react'

const money = (value) => Number(value || 0).toLocaleString('uz-UZ')

const InventorySalesForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [] } = useSelector((state) => state.wareHouse || {})
  const { clients = [] } = useSelector((state) => state.clients || {})
  const { sales = [], isLoading, isSaving, paymentSavingFor, error } = useSelector((state) => state.inventorySales || {})
  const [categoryId, setCategoryId] = useState('')
  const [formatId, setFormatId] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [clientId, setClientId] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentType, setPaymentType] = useState('cash')
  const [notes, setNotes] = useState('')
  const [paymentInputs, setPaymentInputs] = useState({})
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const formats = getFormatsForCategory(categories, categoryId)
  const availableMaterials = getMaterialsForSelection(
    materials,
    categoryId,
    formatId,
    formats,
  )
  const material = availableMaterials.find((item) => String(item.id) === String(materialId))
  const quote = getInventorySaleQuote(material, quantity)
  const { unitCost, unitSalePrice: unitPrice, quantity: count, saleTotal, profit: saleProfit } = quote
  const visibleSales = useMemo(() => sales.slice(0, 30), [sales])

  const handleCreate = async (event) => {
    event.preventDefault()
    setFormError('')
    setMessage('')

    const paid = Number(amountPaid || 0)
    const validationError = validateInventorySaleDraft({ material, quantity, amountPaid })
    if (validationError) return setFormError(validationError)

    try {
      const result = await dispatch(createInventorySale({
        material_id: Number(material.id),
        quantity: count,
        client_id: clientId ? Number(clientId) : null,
        amount_paid: paid,
        payment_type: paymentType,
        notes: notes.trim() || null,
      })).unwrap()
      setMessage(`Material savdosi #${result.id} saqlandi.`)
      setCategoryId('')
      setFormatId('')
      setMaterialId('')
      setQuantity('1')
      setClientId('')
      setAmountPaid('')
      setNotes('')
    } catch (submitError) {
      setFormError(String(submitError))
    }
  }

  const handlePayment = async (saleId) => {
    const amount = Number(paymentInputs[saleId] || 0)
    const sale = sales.find((item) => String(item.id) === String(saleId))
    const financials = getInventorySaleFinancials(sale || {})
    if (!Number.isFinite(amount) || amount <= 0 || amount > financials.balance) {
      setFormError(`To‘lov 0 dan ${money(financials.balance)} so‘mgacha bo‘lishi kerak.`)
      return
    }

    setFormError('')
    setMessage('')
    try {
      await dispatch(recordInventorySalePayment({
        sale_id: Number(saleId),
        amount,
        payment_type: 'cash',
      })).unwrap()
      setPaymentInputs((previous) => ({ ...previous, [saleId]: '' }))
      setMessage(`Savdo #${saleId} uchun to‘lov saqlandi.`)
    } catch (paymentError) {
      setFormError(String(paymentError))
    }
  }

  return (
    <div className="space-y-4 font-sans text-slate-700">
      <header className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <CircleDollarSign className="h-5 w-5 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-800">Materialni alohida sotish</h2>
      </header>

      {(formError || error) && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {formError || `Supabase: ${error}`}
        </div>
      )}
      {message && (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <form noValidate onSubmit={handleCreate} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold">
            <PackageCheck className="h-4 w-4 text-emerald-600" /> Yangi savdo
          </h3>
          <label className="block text-xs font-semibold">
            Kategoriya
            <select value={categoryId} onChange={(event) => {
              setCategoryId(event.target.value)
              setFormatId('')
              setMaterialId('')
            }} className="mt-1 w-full rounded border border-slate-200 bg-white p-2 font-normal">
              <option value="">Tanlang</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {formats.length > 0 && (
            <label className="block text-xs font-semibold">
              Format
              <select value={formatId} onChange={(event) => {
                setFormatId(event.target.value)
                setMaterialId('')
              }} className="mt-1 w-full rounded border border-slate-200 bg-white p-2 font-normal">
                <option value="">Tanlang</option>
                {formats.map((format) => <option key={format.id} value={format.id}>{format.name}</option>)}
              </select>
            </label>
          )}
          <label className="block text-xs font-semibold">
            Material
            <select value={materialId} onChange={(event) => setMaterialId(event.target.value)} className="mt-1 w-full rounded border border-slate-200 bg-white p-2 font-normal">
              <option value="">Tanlang</option>
              {availableMaterials.map((item) => <option key={item.id} value={item.id}>{item.name} · omborda {item.stock_count} dona</option>)}
            </select>
          </label>

          {material && (
            <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-50 p-3 text-xs">
              <span className="text-slate-500">Tannarx / dona</span><b className="text-right">{money(unitCost)} so‘m</b>
              <span className="text-slate-500">Sotish / dona</span><b className="text-right">{money(unitPrice)} so‘m</b>
              <span className="text-slate-500">Foyda / dona</span><b className="text-right text-emerald-700">{money(unitPrice - unitCost)} so‘m</b>
              <span className="text-slate-500">Qoldiq</span><b className="text-right">{material.stock_count} dona</b>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-semibold">
              Soni (dona)
              <input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2 font-normal" />
            </label>
            <label className="block text-xs font-semibold">
              Mijoz (ixtiyoriy)
              <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="mt-1 w-full rounded border border-slate-200 bg-white p-2 font-normal">
                <option value="">Mijozsiz</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-xs">
            <div className="flex justify-between"><span>Savdo jami</span><b>{money(saleTotal)} so‘m</b></div>
            <div className="mt-1 flex justify-between text-emerald-700"><span>Foyda</span><b>{money(saleProfit)} so‘m</b></div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className="block text-xs font-semibold">
              Hozir olingan pul
              <input type="number" min="0" max={saleTotal} value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} placeholder="0" className="mt-1 w-full rounded border border-slate-200 p-2 font-normal" />
            </label>
            <label className="block text-xs font-semibold">
              To‘lov turi
              <select value={paymentType} onChange={(event) => setPaymentType(event.target.value)} className="mt-1 rounded border border-slate-200 bg-white p-2 font-normal">
                <option value="cash">Naqd</option>
                <option value="card">Karta</option>
                <option value="transfer">O‘tkazma</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold">
            Izoh
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2 font-normal" />
          </label>
          <button disabled={isSaving} className="w-full rounded-md bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? 'Saqlanmoqda...' : 'Sotuvni saqlash'}
          </button>
        </form>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold"><Receipt className="h-4 w-4 text-slate-500" /> Sotuvlar tarixi</h3>
            <span className="text-[11px] text-slate-500">{sales.length} ta</span>
          </div>
          {isLoading ? <p className="p-8 text-center text-xs text-slate-400">Yuklanmoqda...</p> : visibleSales.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">Hozircha material sotuvi yo‘q.</p>
          ) : (
            <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
              {visibleSales.map((sale) => {
                const financials = getInventorySaleFinancials(sale)
                return (
                  <article key={sale.id} className="space-y-2 p-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-800">{sale.material_name} · {sale.quantity} dona</p>
                        <p className="text-[10px] text-slate-500">{sale.clients?.name || 'Mijozsiz'} · {sale.date ? new Date(sale.date).toLocaleString('uz-UZ') : ''}</p>
                      </div>
                      <b>{money(financials.revenue)} so‘m</b>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span>Tannarx: {money(financials.cost)}</span>
                      <span className="font-semibold text-emerald-700">Foyda: {money(financials.profit)}</span>
                      <span>Olingan: {money(financials.received)}</span>
                      <span>Qarz: {money(financials.balance)}</span>
                    </div>
                    {financials.balance > 0 && (
                      <div className="flex gap-2">
                        <input aria-label={`Savdo ${sale.id} uchun qo‘shimcha to‘lov`} type="number" min="1" max={financials.balance} value={paymentInputs[sale.id] || ''} onChange={(event) => setPaymentInputs((previous) => ({ ...previous, [sale.id]: event.target.value }))} placeholder="To‘lov" className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1.5" />
                        <button type="button" disabled={String(paymentSavingFor) === String(sale.id)} onClick={() => handlePayment(sale.id)} className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1.5 font-semibold hover:bg-slate-200 disabled:opacity-50">
                          <Wallet className="h-3 w-3" /> {String(paymentSavingFor) === String(sale.id) ? 'Saqlanmoqda...' : 'To‘lov qo‘shish'}
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default InventorySalesForm
