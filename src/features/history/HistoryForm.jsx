import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { deleteHistoryOrder } from './historyThunk'
import {
    Receipt,
    Search,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    User,
    X,
    Clock,
    Wrench,
    Cpu,
    HelpCircle,
    Layers
} from 'lucide-react'

const HistoryForm = () => {
    const dispatch = useDispatch()
    const { historyList, isLoading } = useSelector((state) => state.history)

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [dateFilter, setDateFilter] = useState('all')

    // Sana bo'yicha filterlash
    const filteredByDate = historyList.filter(item => {
        if (!item.date) return true
        const itemDate = new Date(item.date)
        const now = new Date()

        if (dateFilter === 'month') {
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
        }
        return true
    })

    // Qidiruv bo'yicha filterlash
    const filteredRecords = filteredByDate.filter(item =>
        item.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // O'chirish
    const handleDelete = (id) => {
        if (window.confirm("Haqiqatan ham bu tarixni o'chirmoqchimisiz?")) {
            dispatch(deleteHistoryOrder(id))
        }
    }

    // Statistika va umumiy hisoblar
    const stats = filteredRecords.reduce(
        (acc, item) => {
            acc.totalPayoff += Number(item.payoff || 0)
            acc.overallMoney += Number(item.overallmoney || 0)
            acc.bazis += Number(item.bazis || 0)
            acc.cutting += Number(item.cutting || 0)
            acc.kromka += Number(item.kromka || 0)
            acc.rover += Number(item.rover || 0)
            acc.masterFee += Number(item.masterfee || 0)
            acc.spares += Number(item.spares || 0)

            if (item.order_materials && Array.isArray(item.order_materials)) {
                item.order_materials.forEach(mat => {
                    acc.totalMaterialCount += Number(mat.count || 0)
                    acc.totalMaterialCost += Number(mat.totalPrice || 0)
                })
            }
            return acc
        },
        { 
            totalPayoff: 0, 
            overallMoney: 0, 
            bazis: 0, 
            cutting: 0, 
            kromka: 0, 
            rover: 0, 
            masterFee: 0, 
            spares: 0,
            totalMaterialCount: 0,
            totalMaterialCost: 0
        }
    )

    return (
        <div className="space-y-4">
            {/* Tepadagi Stanoklar Xarajati Grid'i */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-medium text-slate-400 truncate">Bazis</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {stats.bazis.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-medium text-slate-400 truncate">Arra</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {stats.cutting.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-medium text-slate-400 truncate">Kromka</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {stats.kromka.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-medium text-slate-400 truncate">Rover</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {stats.rover.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
            </div>

            {/* Asosiy History Ro'yxat Blok */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
                
                {/* Header & Search & Date Filter */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-700" />
                        <h2 className="text-sm font-semibold text-slate-900">
                            Xaridlar tarixi
                        </h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                            {filteredRecords.length} ta
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white border border-slate-200 focus:border-slate-800 outline-none rounded-xl px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer"
                        >
                            <option value="all">Barcha davr</option>
                            <option value="month">Shu oy</option>
                        </select>

                        <div className="relative w-full sm:w-44">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Xaridor ismi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-slate-800 outline-none rounded-xl pl-8 pr-2.5 py-1 text-xs text-slate-800 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Ro'yxat qismi */}
                <div className="p-3.5 sm:p-4">
                    {isLoading ? (
                        <p className="text-center text-xs text-slate-400 py-10">Yuklanmoqda...</p>
                    ) : filteredRecords.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400">
                            <Receipt className="w-8 h-8 stroke-[1.25] text-slate-300 mb-1.5" />
                            <p className="text-xs font-medium text-slate-600">Ma'lumot topilmadi</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                            {filteredRecords.map((item) => {
                                const payoffVal = Number(item.payoff || 0)
                                const isPositive = payoffVal >= 0
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedOrder(item)}
                                        className="group p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200/90 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-xs"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-100/70 text-emerald-700' : 'bg-rose-100/70 text-rose-700'}`}>
                                                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {item.clients?.name || 'Noma\'lum'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-2.5 h-2.5 text-slate-300" />
                                                    {item.date ? new Date(item.date).toLocaleString('uz-UZ') : 'Vaqt yo\'q'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <span className={`text-xs font-bold block ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {payoffVal.toLocaleString('uz-UZ')} so'm
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    Olingan: {Number(item.overallmoney || 0).toLocaleString('uz-UZ')}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(item.id)
                                                }}
                                                title="O'chirish"
                                                className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* PASTKI ANALITIKA PANEL (Pastga qadab qo'yilgan) */}
                <div className="mt-auto bg-slate-50 border-t border-slate-200/80 p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                           Hisobot ({dateFilter === 'month' ? 'Shu oy' : 'Barcha davr'})
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Jami Olingan Pul</span>
                            <span className="font-bold text-slate-800 text-xs">{stats.overallMoney.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Jami Sof Foyda</span>
                            <span className="font-bold text-emerald-600 text-xs">{stats.totalPayoff.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Usta Haqqi</span>
                            <span className="font-semibold text-slate-700 text-xs">{stats.masterFee.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Zapchast Xarajati</span>
                            <span className="font-semibold text-slate-700 text-xs">{stats.spares.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Sotilgan Materiallar</span>
                            <span className="font-semibold text-slate-700 text-[11px]">{stats.totalMaterialCount} dona</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                            <span className="text-slate-400 text-[9px] block">Stanoklar Jami</span>
                            <span className="font-semibold text-slate-700 text-xs">{(stats.bazis + stats.cutting + stats.kromka + stats.rover).toLocaleString('uz-UZ')} so'm</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Summary Bar */}
                {filteredRecords.length > 0 && (
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <div>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                    Jami qilingan sof foyda
                                </p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">
                            {stats.totalPayoff.toLocaleString('uz-UZ')} so'm
                        </span>
                    </div>
                )}
            </div>

            {/* TO'LIQ INFORMATSIYA MODAL OYNASI */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    {selectedOrder.clients?.name || 'Noma\'lum xaridor'}
                                </h3>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-300" />
                                    Sana: {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString('uz-UZ') : 'Noma\'lum'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Asosiy Pul / Sof Foyda */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Olingan Pul</p>
                                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                                    {Number(selectedOrder.overallmoney || 0).toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sof Foyda (Payoff)</p>
                                <p className={`text-sm font-extrabold mt-0.5 ${Number(selectedOrder.payoff || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {Number(selectedOrder.payoff || 0).toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>
                        </div>

                        {/* Materiallar Ro'yxati */}
                        {selectedOrder.order_materials && selectedOrder.order_materials.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Ishlatilgan Materiallar
                                </p>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 max-h-36 overflow-y-auto">
                                    {selectedOrder.order_materials.map((mat) => (
                                        <div key={mat.id} className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-200/50 pb-1.5 last:border-none last:pb-0">
                                            <span className="font-medium">{mat.material_name}: <b className="text-slate-900">{mat.count} dona</b> (x {Number(mat.price).toLocaleString('uz-UZ')} so'm)</span>
                                            <span className="font-bold text-slate-900">{Number(mat.totalPrice).toLocaleString('uz-UZ')} so'm</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Barcha Stanoklar va Xarajatlar Tafsiloti */}
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Wrench className="w-3.5 h-3.5 text-indigo-500" /> Stanoklar va Xarajatlar
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium">Bazis:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.bazis || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium">Arra (Cutting):</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.cutting || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium">Kromka:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.kromka || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium">Teshish (Piercing):</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.piercing || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium">Rover:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.rover || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium flex items-center gap-1">
                                        <Wrench className="w-3 h-3 text-slate-400" /> Usta haqqi:
                                    </span>
                                    <span className="font-bold text-indigo-600">{Number(selectedOrder.masterfee || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium flex items-center gap-1">
                                        <Cpu className="w-3 h-3 text-slate-400" /> Zapchast:
                                    </span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.spares || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 font-medium flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3 text-slate-400" /> Boshqa xarajat:
                                    </span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.anotherexpenses || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-xs transition-all mt-2 cursor-pointer shadow-sm"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HistoryForm