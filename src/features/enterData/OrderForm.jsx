import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from './orderThunk'
import { matchesFormat } from '../wareHouse/wareHouseService'
import { supabase } from '../../api/supabase'
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

const emptyLine = { categoryId: '', formatId: '', materialId: '', count: '', customPrice: '' }

const OrderForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [] } = useSelector((state) => state.wareHouse || {})
  const { clients = [] } = useSelector((state) => state.clients || {})

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
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone_number: ''
  })

  const materialOptions = useMemo(() => {
    return materials.map((item) => {
      const category = categories.find((c) => String(c.id) === String(item.category_id))
      const format = (category?.formats || []).find(
        (f) => String(f.id) === String(item.format_id) || f.name === item.format_id
      )
      const label = [category?.name, format?.name, item.name].filter(Boolean).join(' · ')
      return { ...item, label }
    })
  }, [materials, categories])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
  }

  const handleAddNewClient = async (e) => {
    e.preventDefault()
    if (!newClientForm.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: newClientForm.name.trim(),
          phone_number: newClientForm.phone_number || null
        }])
        .select()
        .single()

      if (error) throw error

      setForm({
        ...form,
        client_id: data.id,
        name: data.name,
        phone_number: data.phone_number || ''
      })
      setShowNewClientModal(false)
      setNewClientForm({ name: '', phone_number: '' })
    } catch (err) {
      alert('Xatolik: ' + err.message)
    }
  }

  const selectedLines = lines
    .map((line) => {
      const category = categories.find((c) => String(c.id) === String(line.categoryId))
      const format = category?.formats?.find((f) => String(f.id) === String(line.formatId))
      const item = materials.find((m) =>
        String(m.category_id) === String(line.categoryId) &&
        matchesFormat(m, format)
      )
      if (!item || !line.count) return null
      const count = Number(line.count)
      const basePrice = format?.default_price || item.sell_price || 0
      const price = line.customPrice ? Number(line.customPrice) : Number(basePrice)
      return {
        material_id: item.id,
        material_name: [category?.name || '', item.name, format?.name].filter(Boolean).join(' · '),
        count,
        price,
        totalPrice: count * price,
        stock: Number(item.stock_count || 0),
        name: item.name,
        format_id: line.formatId,
        format_name: format?.name,
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
      })
      .catch((err) => {
        alert('Xatolik yuz berdi: ' + err)
      })
  }

  return (
    <>
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
                  Omborda material yo'q. Avval Ombor bo'limidan list qo'shing.
                </p>
              )}
              {lines.map((line, index) => {
                const category = categories.find((c) => String(c.id) === String(line.categoryId))
                const formats = category?.formats || []
                const selectedFormat = formats.find((f) => String(f.id) === String(line.formatId))
                const item = materials.find((m) =>
                  String(m.category_id) === String(line.categoryId) &&
                  matchesFormat(m, selectedFormat)
                )
                const basePrice = item?.sell_price || 0
                const price = line.customPrice ? Number(line.customPrice) : Number(basePrice)
                const total = Number(line.count || 0) * price

                return (
                  <div key={index} className="p-2 bg-white rounded border border-slate-200 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={line.categoryId}
                        onChange={(e) => {
                          const next = [...lines]
                          next[index] = { ...next[index], categoryId: e.target.value, formatId: '', materialId: '', customPrice: '' }
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
                        value={line.count}
                        onChange={(e) => {
                          const next = [...lines]
                          next[index] = { ...next[index], count: e.target.value }
                          setLines(next)
                        }}
                        placeholder="Soni"
                        className="col-span-2 border border-slate-200 rounded p-1.5 text-xs"
                      />
                      <div className="col-span-3 text-right">
                        <p className="text-[10px] text-slate-400">Jami</p>
                        <p className="text-xs font-bold text-blue-600">
                          {total ? `${total.toLocaleString('uz-UZ')}` : '0'}
                        </p>
                      </div>
                    </div>

                    {category && formats.length > 0 && (
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <select
                          value={line.formatId}
                          onChange={(e) => {
                            const next = [...lines]
                            next[index] = { ...next[index], formatId: e.target.value, materialId: '', customPrice: '' }
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
                        <input
                          type="number"
                          min="0"
                          value={line.customPrice}
                          onChange={(e) => {
                            const next = [...lines]
                            next[index] = { ...next[index], customPrice: e.target.value }
                            setLines(next)
                          }}
                          placeholder="Narx (ixtiyoriy)"
                          className="col-span-2 border border-slate-200 rounded p-1.5 text-xs"
                        />
                        <div className="col-span-3 text-right">
                          <p className="text-[10px] text-slate-400">Birligi</p>
                          <p className="text-xs font-semibold text-slate-600">
                            {price.toLocaleString('uz-UZ')}
                          </p>
                        </div>
                      </div>
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
