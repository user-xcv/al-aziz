import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from './orderThunk'
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

const emptyLine = { materialId: '', count: '' }

const OrderForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [] } = useSelector((state) => state.wareHouse || {})

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
  })
  const [lines, setLines] = useState([emptyLine])
  const [open, setOpen] = useState(false)

  const materialOptions = useMemo(() => {
    return materials.map((item) => {
      const category = categories.find((c) => String(c.id) === String(item.category_id))
      const format = (category?.formats || []).find(
        (f) => String(f.id) === String(item.format) || f.name === item.format
      )
      const label = [category?.name, format?.name, item.name].filter(Boolean).join(' · ')
      return { ...item, label }
    })
  }, [materials, categories])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const selectedLines = lines
    .map((line) => {
      const item = materials.find((m) => String(m.id) === String(line.materialId))
      if (!item || !line.count) return null
      const count = Number(line.count)
      const price = Number(item.sell_price || 0)
      return {
        material_id: item.id,
        material_name: [item.categories?.name || '', item.name].filter(Boolean).join(' '),
        count,
        price,
        totalPrice: count * price,
        stock: Number(item.stock_count || 0),
        name: item.name,
      }
    })
    .filter(Boolean)

  const materialsTotal = selectedLines.reduce((sum, line) => sum + line.totalPrice, 0)

  const allExpenses =
    Number(form.bazis || 0) +
    Number(form.cutting || 0) +
    Number(form.kromka || 0) +
    Number(form.piercing || 0) +
    Number(form.rover || 0) +
    Number(form.masterfee || 0) +
    Number(form.spares || 0) +
    Number(form.anotherexpenses || 0) +
    materialsTotal

  const livePayoff = Number(form.overallmoney || 0) - allExpenses

  const handleSubmit = (e) => {
    e.preventDefault()

    const overStock = selectedLines.find((line) => line.count > line.stock)
    if (overStock) {
      alert(`${overStock.name}: omborda faqat ${overStock.stock} dona bor`)
      return
    }

    dispatch(
      createOrder({
        ...form,
        payoff: livePayoff,
        materials: selectedLines,
      })
    )
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
        })
        setLines([emptyLine])
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
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-800">Yangi hisob qo‘shish</h2>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Kalkulyator
        </span>
      </div>

      <div className="p-4 space-y-4">
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
              required
              className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <HandCoins className="w-3.5 h-3.5 text-slate-400" />
              Olingan pul (so‘m)
            </label>
            <input
              value={form.overallmoney}
              name="overallmoney"
              onChange={handleChange}
              placeholder="0"
              type="number"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs font-bold"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Xizmatlar xarajatlari
            </p>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md"
            >
              {open ? <X className="w-3 h-3" /> : <PackagePlus className="w-3 h-3" />}
              {open ? 'Yopish' : 'Ombordan material'}
            </button>
          </div>

          {open && (
            <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
              {materialOptions.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  Omborda material yo‘q. Avval Ombor bo‘limidan list qo‘shing.
                </p>
              )}
              {lines.map((line, index) => {
                const item = materials.find((m) => String(m.id) === String(line.materialId))
                const total = item ? Number(line.count || 0) * Number(item.sell_price || 0) : 0
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      value={line.materialId}
                      onChange={(e) => {
                        const next = [...lines]
                        next[index] = { ...next[index], materialId: e.target.value }
                        setLines(next)
                      }}
                      className="col-span-7 border border-slate-200 rounded p-1.5 text-xs bg-white"
                    >
                      <option value="">Material tanlang</option>
                      {materialOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.stock_count} dona)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={line.count}
                      onChange={(e) => {
                        const next = [...lines]
                        next[index] = { ...next[index], count: e.target.value }
                        setLines(next)
                      }}
                      placeholder="Soni"
                      className="col-span-3 border border-slate-200 rounded p-1.5 text-xs"
                    />
                    <div className="col-span-2 text-right text-[11px] font-bold text-blue-600">
                      {total ? `${total.toLocaleString('uz-UZ')}` : ''}
                    </div>
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => setLines([...lines, emptyLine])}
                className="text-[11px] font-semibold text-blue-600"
              >
                + Yana material
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {[
              ['bazis', 'Bazis', Layers],
              ['cutting', 'Arra', Scissors],
              ['kromka', 'Kromka', Sparkles],
              ['piercing', 'Teshish', CircleDot],
              ['rover', 'Rover', Monitor],
              ['masterfee', 'Usta haqqi', Wrench],
              ['spares', 'Zapchast', Cpu],
              ['anotherexpenses', 'Boshqa xarajatlar', HelpCircle],
            ].map(([name, label, Icon]) => (
              <div key={name} className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Icon className="w-3 h-3 text-slate-400" /> {label}
                </label>
                <input
                  value={form[name]}
                  name={name}
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Qolgan mablag‘ (Foyda)
            </p>
            <span
              className={`text-sm font-bold block mt-0.5 ${
                livePayoff < 0 ? 'text-rose-600' : livePayoff > 0 ? 'text-emerald-600' : 'text-slate-700'
              }`}
            >
              {livePayoff.toLocaleString('uz-UZ')} so‘m
            </span>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-xs"
          >
            Saqlash
          </button>
        </div>
      </div>
    </form>
  )
}

export default OrderForm
