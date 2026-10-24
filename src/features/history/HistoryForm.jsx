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
        <div className="space-y-4 font-sans text-slate-700">
            {/* Tepadagi Stanoklar Xarajati Grid'i (Minimalist Card) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Bazis</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                        {stats.bazis.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Arra</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                        {stats.cutting.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Kromka</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                        {stats.kromka.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Rover</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                        {stats.rover.toLocaleString('uz-UZ')} so'm
                    </p>
                </div>
            </div>

            {/* Asosiy Tarix Kartochkasi (Minimalist Card Layout) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                
                {/* Header & Search & Date Filter */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Xaridlar tarixi
                        </h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {filteredRecords.length} ta
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs text-slate-700 font-medium cursor-pointer shadow-2xs"
                        >
                            <option value="all">Barcha davr</option>
                            <option value="month">Shu oy</option>
                        </select>

                        <div className="relative w-full sm:w-52">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Xaridor ismi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 shadow-2xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Ro'yxat qismi */}
                <div className="p-4">
                    {isLoading ? (
                        <p className="text-center text-xs text-slate-400 py-10">Yuklanmoqda...</p>
                    ) : filteredRecords.length === 0 ? (
                        <div className="h-36 flex flex-col items-center justify-center text-center text-slate-400">
                            <Receipt className="w-8 h-8 stroke-[1.25] text-slate-300 mb-1.5" />
                            <p className="text-xs font-medium text-slate-600">Ma'lumot topilmadi</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {filteredRecords.map((item) => {
                                const payoffVal = Number(item.payoff || 0)
                                const isPositive = payoffVal >= 0
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedOrder(item)}
                                        className="group p-3 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between gap-3 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                    {item.clients?.name || 'Noma\'lum'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-2.5 h-2.5 text-slate-300" />
                                                    {item.date ? new Date(item.date).toLocaleString('uz-UZ') : 'Vaqt yo\'q'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
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
                                                className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-rose-50"
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

                {/* PASTKI ANALITIKA PANEL */}
                <div className="mt-auto bg-slate-50/80 border-t border-slate-200 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        Hisobot ({dateFilter === 'month' ? 'Shu oy' : 'Barcha davr'})
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Jami Olingan Pul</span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5 block">{stats.overallMoney.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Jami Sof Foyda</span>
                            <span className="font-bold text-emerald-600 text-xs mt-0.5 block">{stats.totalPayoff.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Usta Haqqi</span>
                            <span className="font-semibold text-slate-700 text-xs mt-0.5 block">{stats.masterFee.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Zapchast Xarajati</span>
                            <span className="font-semibold text-slate-700 text-xs mt-0.5 block">{stats.spares.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Sotilgan Materiallar</span>
                            <span className="font-semibold text-slate-700 text-xs mt-0.5 block">{stats.totalMaterialCount} dona</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 text-[10px] block font-medium">Stanoklar Jami</span>
                            <span className="font-semibold text-slate-700 text-xs mt-0.5 block">{(stats.bazis + stats.cutting + stats.kromka + stats.rover).toLocaleString('uz-UZ')} so'm</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Summary Bar */}
                {filteredRecords.length > 0 && (
                    <div className="p-3 bg-blue-600 text-white flex items-center justify-between border-t border-blue-700">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-200" />
                            <p className="text-xs font-semibold uppercase tracking-wider">
                                Jami qilingan sof foyda
                            </p>
                        </div>
                        <span className="text-sm font-bold">
                            {stats.totalPayoff.toLocaleString('uz-UZ')} so'm
                        </span>
                    </div>
                )}
            </div>

            {/* TO'LIQ INFORMATSIYA MODAL OYNASI */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    {selectedOrder.clients?.name || 'Noma\'lum xaridor'}
                                </h3>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-300" />
                                    Sana: {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString('uz-UZ') : 'Noma\'lum'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Asosiy Pul / Sof Foyda */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Olingan Pul</p>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    {Number(selectedOrder.overallmoney || 0).toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Sof Foyda</p>
                                <p className={`text-xs font-bold mt-0.5 ${Number(selectedOrder.payoff || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {Number(selectedOrder.payoff || 0).toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>
                        </div>

                        {/* Materiallar Ro'yxati */}
                        {selectedOrder.order_materials && selectedOrder.order_materials.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-blue-600" /> Ishlatilgan Materiallar
                                </p>
                                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2 max-h-36 overflow-y-auto">
                                    {selectedOrder.order_materials.map((mat) => (
                                        <div key={mat.id} className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-200/60 pb-1.5 last:border-none last:pb-0">
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
                                <Wrench className="w-3.5 h-3.5 text-blue-600" /> Stanoklar va Xarajatlar
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Bazis:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.bazis || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Arra:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.cutting || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Kromka:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.kromka || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Teshish:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.piercing || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Rover:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.rover || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Usta haqqi:</span>
                                    <span className="font-bold text-blue-600">{Number(selectedOrder.masterfee || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Zapchast:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.spares || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-slate-500">Boshqa xarajat:</span>
                                    <span className="font-bold text-slate-800">{Number(selectedOrder.anotherexpenses || 0).toLocaleString('uz-UZ')} so'm</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-md text-xs transition-all mt-2 cursor-pointer shadow-2xs"
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