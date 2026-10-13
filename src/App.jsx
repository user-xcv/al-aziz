import React, { useEffect, useState } from 'react'
import {
  Aperture,
  HandCoins,
  Monitor,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  Receipt,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Scissors,
  CircleDot,
  Wrench,
  HelpCircle,
  DollarSign,
  X
} from 'lucide-react'

const App = () => {
  const [records, setRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modal, setModal] = useState(false)
  const [xdfChecked, setXdfChecked] = useState(false)
  const [ldspChecked, setLdspChecked] = useState(false)

  // Load records on initial render
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('alAziz')) || []
    setRecords(data)
  }, [])

  const [form, setForm] = useState({
    xaridor: '',
    olinganPul: '',
    bazis: '',
    arra: '',
    kromka: '',
    teshish: '',
    rover: '',
    ustaHaqqi: '',
    boshqaXarajatlar: '',
    payoff: '',
    date: '',
    ldsp: '',
    xdf: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const allExpenses =
    Number(form.bazis) +
    Number(form.arra) +
    Number(form.kromka) +
    Number(form.teshish) +
    Number(form.rover) +
    Number(form.ustaHaqqi) +
    Number(form.boshqaXarajatlar)+
    Number(form.ldsp)+
    Number(form.xdf)

  const livePayoff = Number(form.olinganPul) - allExpenses

  const submit = () => {
    if (form.xaridor.trim() === '') {
      alert("Iltimos xaridor ismini kiriting !!!")
      return
    }

    const currenTime = new Date().toLocaleString('uz-UZ')
    const oldData = JSON.parse(localStorage.getItem('alAziz'))
    const fullData = { ...form, payoff: livePayoff, date: currenTime }

    if (oldData === null) {
      const firstArray = [fullData]
      localStorage.setItem('alAziz', JSON.stringify(firstArray))
      setRecords(firstArray)
      alert('Muvaffaqiyatli saqlandi !!')
    } else {
      const updateDate = [...oldData, fullData]
      localStorage.setItem('alAziz', JSON.stringify(updateDate))
      setRecords(updateDate)
      alert('Muvaffaqiyatli saqlandi !!')
    }

    setForm({
      xaridor: '',
      olinganPul: '',
      bazis: '',
      arra: '',
      kromka: '',
      teshish: '',
      rover: '',
      ustaHaqqi: '',
      boshqaXarajatlar: '',
      payoff: '',
      ldsp: '',
      xdf: ''
    })
    setXdfChecked(false)
    setLdspChecked(false)
  }

  const handleDelete = (indexToDelete) => {
    const updated = records.filter((_, idx) => idx !== indexToDelete)
    localStorage.setItem('alAziz', JSON.stringify(updated))
    setRecords(updated)
  }

  const totalPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.payoff || 0)
  }, 0)

  const bazisPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.bazis || 0)
  }, 0)

  const kromkaPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.kromka || 0)
  }, 0)

  const roverPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.rover || 0)
  }, 0)

  const boshqaXarajatlarPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.boshqaXarajatlar || 0)
  }, 0)

  const arraPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.arra || 0)
  }, 0)

  const teshishPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.teshish || 0)
  }, 0)

  const ustaHaqqiPayoff = records.reduce((previousSum, newSum) => {
    return previousSum + Number(newSum.ustaHaqqi || 0)
  }, 0)

  // Filter records based on search query
  const filteredRecords = records.filter((r) =>
    r.xaridor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-200">
      {/* Top Header Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Al-Aziz
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                Jami Sof Foyda: {totalPayoff.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Form Input Section */}
          <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-slate-700" />
                <h2 className="text-base font-semibold text-slate-900">
                  Yangi hisob qo'shish
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Xizmatlar kalkulyatori
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Client & Received Cash */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Xaridor ismi
                  </label>
                  <input
                    value={form.xaridor}
                    name="xaridor"
                    onChange={handleChange}
                    placeholder="Mijoz ismi va familiyasi"
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <HandCoins className="w-3.5 h-3.5 text-slate-400" />
                    Olingan pul (so'm)
                  </label>
                  <input
                    value={form.olinganPul}
                    name="olinganPul"
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Service Expense Breakdown Grid */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Xizmatlar xarajatlari
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <button 
                      type="button"
                      onClick={() => setModal(true)} 
                      className="w-full h-full min-h-[42px] border border-dashed border-slate-300 hover:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                      Material kiritish
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Bazis
                    </label>
                    <input
                      value={form.bazis}
                      name="bazis"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-slate-400" />
                      Arra
                    </label>
                    <input
                      value={form.arra}
                      name="arra"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-400" />
                      Kromka
                    </label>
                    <input
                      value={form.kromka}
                      name="kromka"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <CircleDot className="w-3 h-3 text-slate-400" />
                      Teshish
                    </label>
                    <input
                      value={form.teshish}
                      name="teshish"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-slate-400" />
                      Rover
                    </label>
                    <input
                      value={form.rover}
                      name="rover"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      Usta haqqi
                    </label>
                    <input
                      value={form.ustaHaqqi}
                      name="ustaHaqqi"
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    Boshqa xarajatlar
                  </label>
                  <input
                    value={form.boshqaXarajatlar}
                    name="boshqaXarajatlar"
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3.5 py-2 text-sm text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Real-time calculated live payoff footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Qolgan mablag' (Foyda)
                  </p>
                  <span
                    className={`text-xl font-bold ${livePayoff < 0
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
                  onClick={submit}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Transaction History & Dashboard Summary */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">

            {/* Detailed Service Expense Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 truncate">Bazis</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {bazisPayoff.toLocaleString('uz-UZ')} so'm
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 truncate">Arra</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {arraPayoff.toLocaleString('uz-UZ')} so'm
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 truncate">Kromka</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {kromkaPayoff.toLocaleString('uz-UZ')} so'm
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 truncate">Rover</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {roverPayoff.toLocaleString('uz-UZ')} so'm
                </p>
              </div>
            </div>

            {/* Main History Table / List Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[460px]">
              {/* Header & Filter Controls */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-semibold text-slate-900">
                    Xaridlar tarixi
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-700 ml-1">
                    {records.length} ta
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Xaridor ismi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 outline-none rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Record List */}
              <div className="flex-1 p-4 sm:p-5">
                {records.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
                    <Receipt className="w-12 h-12 stroke-[1.25] text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-600">
                      Hozircha xaridlar yo'q
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Kalkulyatordan yangi hisob-kitoblarni saqlang
                    </p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                    <p className="text-sm font-medium text-slate-600">
                      Axtarilgan ism bo'yicha hech narsa topilmadi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {filteredRecords.map((item, index) => {
                      const isPositive = Number(item.payoff) >= 0
                      return (
                        <div
                          key={index}
                          className="group p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200/90 transition-all flex items-center justify-between gap-4 shadow-2xs hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPositive
                                ? 'bg-emerald-100/70 text-emerald-700'
                                : 'bg-rose-100/70 text-rose-700'
                                }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {item.xaridor}
                              </p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-300" />
                                {item.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <span
                                className={`text-sm font-bold block ${isPositive
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                                  }`}
                              >
                                {Number(item.payoff).toLocaleString('uz-UZ')} so'm
                              </span>
                              {item.olinganPul && (
                                <span className="text-[11px] text-slate-400 block">
                                  Olingan: {Number(item.olinganPul).toLocaleString('uz-UZ')}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleDelete(index)}
                              title="O'chirish"
                              className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sticky Summary Bar */}
              {records.length > 0 && (
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 mt-auto">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Jami qilingan sof foyda
                      </p>
                      <p className="text-xs text-slate-400">
                        Barcha qayd etilgan xaridlar natijasi
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {totalPayoff.toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Material Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Material kiritish</h3>
              <button 
                onClick={() => setModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* XDF qismi */}
              <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={xdfChecked} 
                      onChange={(e) => setXdfChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer" 
                    />
                    XDF materiali
                  </label>
                </div>
                {xdfChecked && (
                  <input 
                    name="xdf" 
                    value={form.xdf} 
                    type="number" 
                    placeholder="XDF miqdori / summasi" 
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition-all mt-1" 
                  />
                )}
              </div>

              {/* LDSP qismi */}
              <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={ldspChecked} 
                      onChange={(e) => setLdspChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer" 
                    />
                    LDSP materiali
                  </label>
                </div>
                {ldspChecked && (
                  <input 
                    name="ldsp" 
                    value={form.ldsp} 
                    type="number" 
                    placeholder="LDSP miqdori / summasi" 
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition-all mt-1" 
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App