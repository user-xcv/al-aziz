import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createOrder } from './orderThunk'
import {
  HandCoins,
  Monitor,
  User,
  PlusCircle,
  Sparkles,
  Layers,
  Scissors,
  CircleDot,
  Wrench,
  HelpCircle,
  Cpu,
  X,
  PackagePlus,
} from 'lucide-react'

const OrderForm = () => {
  const dispatch = useDispatch()

  const [form, setForm] = useState({
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
    payoff: '',
    materials: [],
  })

  // Materiallar uchun state'lar
  const [ldsp, setLdsp] = useState({ count: '', price: '' })
  const [xdf, setXdf] = useState({ count: '', price: '' })
  const [lmdf, setLmdf] = useState({ count: '', price: '' })
  const [akril, setAkril] = useState({ count: '', price: '' })
  
  // Material panelining ochilish/yopilish holati
  const [open, setOpen] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Materiallarning umumiy summalari
  const ldspTotal = Number(ldsp.count || 0) * Number(ldsp.price || 0)
  const xdfTotal = Number(xdf.count || 0) * Number(xdf.price || 0)
  const lmdfTotal = Number(lmdf.count || 0) * Number(lmdf.price || 0)
  const akrilTotal = Number(akril.count || 0) * Number(akril.price || 0)

  // Barcha xarajatlar yig'indisi
  const allExpenses =
    Number(form.bazis || 0) +
    Number(form.cutting || 0) +
    Number(form.kromka || 0) +
    Number(form.piercing || 0) +
    Number(form.rover || 0) +
    Number(form.masterfee || 0) +
    Number(form.spares || 0) +
    Number(form.anotherexpenses || 0) +
    ldspTotal +
    xdfTotal +
    lmdfTotal +
    akrilTotal

  const livePayoff = Number(form.overallmoney || 0) - allExpenses

  const handleSubmit = (e) => {
    e.preventDefault()

    const materialsList = []
    if (ldsp.count && ldsp.price) {
      materialsList.push({
        material_name: 'LDSP',
        count: Number(ldsp.count),
        price: Number(ldsp.price),
        totalPrice: ldspTotal,
      })
    }
    if (xdf.count && xdf.price) {
      materialsList.push({
        material_name: 'XDF',
        count: Number(xdf.count),
        price: Number(xdf.price),
        totalPrice: xdfTotal,
      })
    }
    if (lmdf.count && lmdf.price) {
      materialsList.push({
        material_name: 'LMDF',
        count: Number(lmdf.count),
        price: Number(lmdf.price),
        totalPrice: lmdfTotal,
      })
    }
    if (akril.count && akril.price) {
      materialsList.push({
        material_name: 'Akril',
        count: Number(akril.count),
        price: Number(akril.price),
        totalPrice: akrilTotal,
      })
    }

    const finalData = {
      ...form,
      payoff: livePayoff,
      materials: materialsList,
    }

    dispatch(createOrder(finalData))
      .unwrap()
      .then(() => {
        alert('Zakaz muvaffaqiyatli saqlandi!')
        setForm({
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
          payoff: '',
          materials: [],
        })
        setLdsp({ count: '', price: '' })
        setXdf({ count: '', price: '' })
        setLmdf({ count: '', price: '' })
        setAkril({ count: '', price: '' })
        setOpen(false)
      })
      .catch((err) => {
        alert('Xatolik yuz berdi: ' + err)
      })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden text-slate-700 font-sans"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-800">
            Yangi hisob qo'shish
          </h2>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Kalkulyator
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Client & Received Cash */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Xaridor ismi
            </label>
            <input
              value={form.name}
              name="name"
              onChange={handleChange}
              placeholder="Mijoz ismi va familiyasi"
              type="text"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <HandCoins className="w-3.5 h-3.5 text-slate-400" />
              Olingan pul (so'm)
            </label>
            <input
              value={form.overallmoney}
              name="overallmoney"
              onChange={handleChange}
              placeholder="0"
              type="number"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 font-bold shadow-2xs"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Service Expense Breakdown Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Xizmatlar xarajatlari
            </p>

            {/* Materiallarni ochish/yopish tugmasi */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-all cursor-pointer"
            >
              {open ? (
                <>
                  <X className="w-3 h-3" />
                  Yopish
                </>
              ) : (
                <>
                  <PackagePlus className="w-3 h-3" />
                  Material kiritish
                </>
              )}
            </button>
          </div>

          {/* Materiallar Bo'limi (Toggle paneli) */}
          {open && (
            <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-3">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Xom-ashyo materiallari
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* LDSP */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-600">LDSP</span>
                    {ldspTotal > 0 && (
                      <span className="font-bold text-blue-600">
                        {ldspTotal.toLocaleString('uz-UZ')} so'm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-md overflow-hidden border border-slate-200 bg-white">
                    <input
                      type="number"
                      value={ldsp.count}
                      onChange={(e) => setLdsp({ ...ldsp, count: e.target.value })}
                      className="w-1/3 bg-slate-50 p-1.5 outline-none text-xs font-medium border-r border-slate-200 text-center"
                      placeholder="Soni"
                    />
                    <input
                      type="number"
                      value={ldsp.price}
                      onChange={(e) => setLdsp({ ...ldsp, price: e.target.value })}
                      className="w-2/3 p-1.5 outline-none text-xs font-medium px-2"
                      placeholder="Dona narxi"
                    />
                  </div>
                </div>

                {/* XDF */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-600">XDF</span>
                    {xdfTotal > 0 && (
                      <span className="font-bold text-blue-600">
                        {xdfTotal.toLocaleString('uz-UZ')} so'm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-md overflow-hidden border border-slate-200 bg-white">
                    <input
                      type="number"
                      value={xdf.count}
                      onChange={(e) => setXdf({ ...xdf, count: e.target.value })}
                      className="w-1/3 bg-slate-50 p-1.5 outline-none text-xs font-medium border-r border-slate-200 text-center"
                      placeholder="Soni"
                    />
                    <input
                      type="number"
                      value={xdf.price}
                      onChange={(e) => setXdf({ ...xdf, price: e.target.value })}
                      className="w-2/3 p-1.5 outline-none text-xs font-medium px-2"
                      placeholder="Dona narxi"
                    />
                  </div>
                </div>

                {/* LMDF */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-600">LMDF</span>
                    {lmdfTotal > 0 && (
                      <span className="font-bold text-blue-600">
                        {lmdfTotal.toLocaleString('uz-UZ')} so'm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-md overflow-hidden border border-slate-200 bg-white">
                    <input
                      type="number"
                      value={lmdf.count}
                      onChange={(e) => setLmdf({ ...lmdf, count: e.target.value })}
                      className="w-1/3 bg-slate-50 p-1.5 outline-none text-xs font-medium border-r border-slate-200 text-center"
                      placeholder="Soni"
                    />
                    <input
                      type="number"
                      value={lmdf.price}
                      onChange={(e) => setLmdf({ ...lmdf, price: e.target.value })}
                      className="w-2/3 p-1.5 outline-none text-xs font-medium px-2"
                      placeholder="Dona narxi"
                    />
                  </div>
                </div>

                {/* AKRIL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-600">Akril</span>
                    {akrilTotal > 0 && (
                      <span className="font-bold text-blue-600">
                        {akrilTotal.toLocaleString('uz-UZ')} so'm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-md overflow-hidden border border-slate-200 bg-white">
                    <input
                      type="number"
                      value={akril.count}
                      onChange={(e) => setAkril({ ...akril, count: e.target.value })}
                      className="w-1/3 bg-slate-50 p-1.5 outline-none text-xs font-medium border-r border-slate-200 text-center"
                      placeholder="Soni"
                    />
                    <input
                      type="number"
                      value={akril.price}
                      onChange={(e) => setAkril({ ...akril, price: e.target.value })}
                      className="w-2/3 p-1.5 outline-none text-xs font-medium px-2"
                      placeholder="Dona narxi"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asosiy Xizmatlar Grid-i */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Bazis */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Bazis
              </label>
              <input
                value={form.bazis}
                name="bazis"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Arra (cutting) */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Scissors className="w-3 h-3 text-slate-400" /> Arra
              </label>
              <input
                value={form.cutting}
                name="cutting"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Kromka */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" /> Kromka
              </label>
              <input
                value={form.kromka}
                name="kromka"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Teshish (piercing) */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <CircleDot className="w-3 h-3 text-slate-400" /> Teshish
              </label>
              <input
                value={form.piercing}
                name="piercing"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Rover */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Monitor className="w-3 h-3 text-slate-400" /> Rover
              </label>
              <input
                value={form.rover}
                name="rover"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Usta haqqi (masterfee) */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-slate-400" /> Usta haqqi
              </label>
              <input
                value={form.masterfee}
                name="masterfee"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Zapchast (spares) */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-400" /> Zapchast
              </label>
              <input
                value={form.spares}
                name="spares"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            {/* Boshqa xarajatlar */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" /> Boshqa xarajatlar
              </label>
              <input
                value={form.anotherexpenses}
                name="anotherexpenses"
                onChange={handleChange}
                placeholder="0"
                type="number"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Footer / Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Qolgan mablag' (Foyda)
            </p>
            <span
              className={`text-sm font-bold block mt-0.5 ${
                livePayoff < 0
                  ? 'text-rose-600'
                  : livePayoff > 0
                  ? 'text-emerald-600'
                  : 'text-slate-700'
              }`}
            >
              {livePayoff.toLocaleString('uz-UZ')} so'm
            </span>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium px-5 py-2 rounded-md text-xs transition-all shadow-2xs cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>
    </form>
  )
}

export default OrderForm