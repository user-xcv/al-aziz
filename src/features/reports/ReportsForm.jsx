import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const ReportsForm = () => {
  const dispatch = useDispatch()
  const { historyList } = useSelector((state) => state.history)
  const { clients } = useSelector((state) => state.clients)
  const { payments } = useSelector((state) => state.payments)
  const { materials } = useSelector((state) => state.wareHouse)

  const [dateFilter, setDateFilter] = useState('month')

  const filteredHistory = historyList.filter(item => {
    if (!item.date) return true
    const itemDate = new Date(item.date)
    const now = new Date()

    if (dateFilter === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return itemDate >= weekAgo
    }
    return true
  })

  const stats = {
    totalRevenue: filteredHistory.reduce((sum, item) => sum + Number(item.overallmoney || 0), 0),
    totalProfit: filteredHistory.reduce((sum, item) => sum + Number(item.payoff || 0), 0),
    totalOrders: filteredHistory.length,
    totalClients: clients.length,
    totalPayments: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    totalMaterials: materials.reduce((sum, m) => sum + Number(m.stock_count || 0), 0),
    machineExpenses: filteredHistory.reduce((sum, item) =>
      sum + Number(item.bazis || 0) + Number(item.cutting || 0) +
      Number(item.kromka || 0) + Number(item.rover || 0), 0
    ),
    laborExpenses: filteredHistory.reduce((sum, item) =>
      sum + Number(item.masterfee || 0), 0
    )
  }

  const topClients = [...clients]
    .sort((a, b) => {
      const aOrders = filteredHistory.filter(h => h.client_id === a.id).length
      const bOrders = filteredHistory.filter(h => h.client_id === b.id).length
      return bOrders - aOrders
    })
    .slice(0, 5)

  const recentOrders = [...filteredHistory]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  return (
    <div className="space-y-4 font-sans text-slate-700">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Hisobotlar va Analitika</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-1.5 text-xs"
          >
            <option value="all">Barcha davr</option>
            <option value="month">Shu oy</option>
            <option value="week">Shu hafta</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] text-slate-400">Daromad</span>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {stats.totalRevenue.toLocaleString('uz-UZ')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">so'm</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-slate-400">Sof foyda</span>
          </div>
          <p className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.totalProfit.toLocaleString('uz-UZ')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">so'm</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] text-slate-400">Buyurtmalar</span>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {stats.totalOrders}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">ta</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] text-slate-400">Mijozlar</span>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {stats.totalClients}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">ta</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expenses Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            Xarajatlar Tafsiloti
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Stanoklar (Bazis, Arra, Kromka, Rover)</span>
              <span className="text-xs font-bold text-slate-800">
                {stats.machineExpenses.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Usta haqqi</span>
              <span className="text-xs font-bold text-slate-800">
                {stats.laborExpenses.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Materiallar xarajati</span>
              <span className="text-xs font-bold text-slate-800">
                {(stats.totalRevenue - stats.totalProfit - stats.machineExpenses - stats.laborExpenses).toLocaleString('uz-UZ')} so'm
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Ombor Holati
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Jami materiallar</span>
              <span className="text-xs font-bold text-slate-800">
                {stats.totalMaterials} dona
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Kategoriyalar soni</span>
              <span className="text-xs font-bold text-slate-800">
                {new Set(materials.map(m => m.category_id)).size} ta
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Kam qolgan materiallar</span>
              <span className="text-xs font-bold text-rose-600">
                {materials.filter(m => Number(m.stock_count) < 5).length} ta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Eng Faol Mijozlar ({dateFilter === 'month' ? 'Shu oy' : dateFilter === 'week' ? 'Shu hafta' : 'Barcha davr'})
        </h3>
        {topClients.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Ma'lumot yo'q</p>
        ) : (
          <div className="space-y-2">
            {topClients.map((client, index) => {
              const clientOrders = filteredHistory.filter(h => h.client_id === client.id)
              const clientSpent = clientOrders.reduce((sum, o) => sum + Number(o.overallmoney || 0), 0)
              return (
                <div key={client.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                    <span className="text-xs font-semibold text-slate-800">{client.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">{clientSpent.toLocaleString('uz-UZ')} so'm</p>
                    <p className="text-[10px] text-slate-400">{clientOrders.length} buyurtma</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          So'nggi Buyurtmalar
        </h3>
        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Ma'lumot yo'q</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentOrders.map((order) => {
              const payoff = Number(order.payoff || 0)
              return (
                <div key={order.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${payoff >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {payoff >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{order.clients?.name || 'Noma\'lum'}</p>
                      <p className="text-[10px] text-slate-400">{order.date ? new Date(order.date).toLocaleString('uz-UZ') : 'Vaqt yo\'q'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${payoff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {payoff.toLocaleString('uz-UZ')} so'm
                    </p>
                    <p className="text-[10px] text-slate-400">{Number(order.overallmoney || 0).toLocaleString('uz-UZ')} olingan</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsForm
