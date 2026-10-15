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
        spares: '',         // Zapchast uchun
        anotherexpenses: '',
        overallmoney: '',
        payoff: '',
        materials: []
    })

    // LDSP uchun state
    const [ldsp, setLdsp] = useState({ count: '', price: '' })
    // XDF uchun state
    const [xdf, setXdf] = useState({ count: '', price: '' })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // LDSP va XDF ning alohida umumiy summalari
    const ldspTotal = Number(ldsp.count) * Number(ldsp.price)
    const xdfTotal = Number(xdf.count) * Number(xdf.price)

    // Barcha xarajatlarni yig'indisi
    const allExpenses =
        Number(form.bazis) +
        Number(form.cutting) +
        Number(form.kromka) +
        Number(form.piercing) +
        Number(form.rover) +
        Number(form.masterfee) +
        Number(form.spares) +
        Number(form.anotherexpenses) +
        ldspTotal +
        xdfTotal

    const livePayoff = Number(form.overallmoney) - allExpenses

    const handleSubmit = (e) => {
        e.preventDefault()

        // Materiallarni massivga yig'amiz
        const materialsList = []
        if (ldsp.count && ldsp.price) {
            materialsList.push({
                material_name: 'LDSP',
                count: Number(ldsp.count),
                price: Number(ldsp.price),
                totalPrice: ldspTotal
            })
        }
        if (xdf.count && xdf.price) {
            materialsList.push({
                material_name: 'XDF',
                count: Number(xdf.count),
                price: Number(xdf.price),
                totalPrice: xdfTotal
            })
        }

        const finalData = {
            ...form,
            payoff: livePayoff,
            materials: materialsList
        }

        // Redux Thunk orqali bazaga yuborish
        dispatch(createOrder(finalData))
            .unwrap()
            .then(() => {
                alert("Zakaz muvaffaqiyatli saqlandi!");
                // Formani tozalash
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
                    materials: []
                })
                setLdsp({ count: '', price: '' })
                setXdf({ count: '', price: '' })
            })
            .catch((err) => {
                alert("Xatolik yuz berdi: " + err);
            });
    }

    return (
        <form onSubmit={handleSubmit} className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
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
                            value={form.name}
                            name="name"
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
                            value={form.overallmoney}
                            name="overallmoney"
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
                        {/* Ldsp */}
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-slate-400" /> Ldsp
                                </label>
                                {ldspTotal > 0 && (
                                    <span className="text-[10px] font-bold text-indigo-600">
                                        Jami: {ldspTotal.toLocaleString('uz-UZ')} so'm
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center rounded-xl overflow-hidden border border-slate-200">
                                <input
                                    type="number"
                                    value={ldsp.count}
                                    onChange={(e) => setLdsp({ ...ldsp, count: e.target.value })}
                                    className='w-1/3 bg-slate-100 p-2 outline-none text-xs font-medium'
                                    placeholder='soni'
                                />
                                <input
                                    type="number"
                                    value={ldsp.price}
                                    onChange={(e) => setLdsp({ ...ldsp, price: e.target.value })}
                                    className='w-2/3 p-2 bg-slate-50 outline-none text-xs font-medium'
                                    placeholder='dona narxi'
                                />
                            </div>
                        </div>

                        {/* Xdf */}
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-slate-400" /> Xdf
                                </label>
                                {xdfTotal > 0 && (
                                    <span className="text-[10px] font-bold text-indigo-600">
                                        Jami: {xdfTotal.toLocaleString('uz-UZ')} so'm
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center rounded-xl overflow-hidden border border-slate-200">
                                <input
                                    type="number"
                                    value={xdf.count}
                                    onChange={(e) => setXdf({ ...xdf, count: e.target.value })}
                                    className='w-1/3 bg-slate-100 p-2 outline-none text-xs font-medium'
                                    placeholder='soni'
                                />
                                <input
                                    type="number"
                                    value={xdf.price}
                                    onChange={(e) => setXdf({ ...xdf, price: e.target.value })}
                                    className='w-2/3 p-2 bg-slate-50 outline-none text-xs font-medium'
                                    placeholder='dona narxi'
                                />
                            </div>
                        </div>

                        {/* Bazis */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-slate-400" /> Bazis
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

                        {/* Arra (cutting) */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Scissors className="w-3 h-3 text-slate-400" /> Arra
                            </label>
                            <input
                                value={form.cutting}
                                name="cutting"
                                onChange={handleChange}
                                placeholder="0"
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                            />
                        </div>

                        {/* Kromka */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-slate-400" /> Kromka
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

                        {/* Teshish (piercing) */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <CircleDot className="w-3 h-3 text-slate-400" /> Teshish
                            </label>
                            <input
                                value={form.piercing}
                                name="piercing"
                                onChange={handleChange}
                                placeholder="0"
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                            />
                        </div>

                        {/* Rover */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Monitor className="w-3 h-3 text-slate-400" /> Rover
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

                        {/* Usta haqqi (masterfee) */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-slate-400" /> Usta haqqi
                            </label>
                            <input
                                value={form.masterfee}
                                name="masterfee"
                                onChange={handleChange}
                                placeholder="0"
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                            />
                        </div>

                        {/* Zapchast (spares) */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-slate-400" /> Zapchast
                            </label>
                            <input
                                value={form.spares}
                                name="spares"
                                onChange={handleChange}
                                placeholder="0"
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3 py-2 text-sm text-slate-800 transition-all"
                            />
                        </div>
                    </div>

                    {/* Boshqa xarajatlar */}
                    <div className="space-y-1 mt-3">
                        <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-slate-400" /> Boshqa xarajatlar
                        </label>
                        <input
                            value={form.anotherexpenses}
                            name="anotherexpenses"
                            onChange={handleChange}
                            placeholder="0"
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white outline-none rounded-xl px-3.5 py-2 text-sm text-slate-800 transition-all"
                        />
                    </div>
                </div>

                {/* Footer / Submit */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Qolgan mablag' (Foyda)
                        </p>
                        <span className={`text-xl font-bold ${livePayoff < 0 ? 'text-rose-600' : livePayoff > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {livePayoff.toLocaleString('uz-UZ')} so'm
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        Saqlash
                    </button>
                </div>
            </div>
        </form>
    )
}

export default OrderForm