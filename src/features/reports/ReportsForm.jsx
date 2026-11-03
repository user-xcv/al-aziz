import React, { useState } from 'react'
import { useSelector } from 'react-redux'
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
import {
  getOrderFinancials,
  operatingCostFields,
  serviceRevenueFields,
} from '../enterData/orderCalculations'
import { getOrderTotal } from '../enterData/orderAmounts'
import {
  aggregateCrmFinancials,
  getInventorySaleFinancials,
  isWithinReportPeriod,
  sumInventorySalePayments,
} from '../inventorySales/inventorySaleCalculations'

const ReportsForm = () => {
  const { historyList } = useSelector((state) => state.history)
  const { clients } = useSelector((state) => state.clients)
  const { payments } = useSelector((state) => state.payments)
  const { materials } = useSelector((state) => state.wareHouse)
  const { sales = [] } = useSelector((state) => state.inventorySales || {})

  const [dateFilter, setDateFilter] = useState('month')

  const filteredHistory = historyList.filter((item) => isWithinReportPeriod(item.date, dateFilter))
  const filteredSales = sales.filter((item) => isWithinReportPeriod(item.date, dateFilter))
  const filteredPayments = payments.filter((payment) => isWithinReportPeriod(payment.date, dateFilter))

  const financialSummary = aggregateCrmFinancials(filteredHistory, filteredSales)
  const stats = {
    totalRevenue: financialSummary.totalRevenue,
    totalProfit: financialSummary.totalProfit,
    materialCosts: financialSummary.totalMaterialCosts,
    materialMarkup: financialSummary.orderMaterialProfit + financialSummary.standaloneMaterialProfit,
    serviceRevenue: financialSummary.serviceRevenue,
    operatingCosts: financialSummary.operatingCosts,
    materialSales: financialSummary.orderMaterialSales + financialSummary.standaloneMaterialRevenue,
    standaloneMaterialSales: financialSummary.standaloneMaterialRevenue,
    standaloneMaterialCosts: financialSummary.standaloneMaterialCosts,
    standaloneMaterialProfit: financialSummary.standaloneMaterialProfit,
    standaloneMaterialSalesCount: financialSummary.standaloneMaterialSalesCount,
    standaloneMaterialQuantity: financialSummary.standaloneMaterialQuantity,
    totalOrders: filteredHistory.length,
    totalClients: clients.length,
    totalPayments:
      filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) +
      sumInventorySalePayments(sales, dateFilter) +
      filteredHistory.reduce((sum, order) =>
        sum + ((order.payments || []).length === 0 ? Number(order.opening_paid || 0) : 0), 0),
    totalMaterials: materials.reduce((sum, m) => sum + Number(m.stock_count || 0), 0),
  }
  const serviceRevenueByField = financialSummary.serviceRevenueByField
  const operatingCostsByField = financialSummary.operatingCostsByField
  const serviceLabels = {
    bazis: 'Bazis',
    cutting: 'Arra / kesish',
    kromka: 'Kromka',
    piercing: 'Teshish',
    rover: 'Rover',
  }
  const operatingCostLabels = {
    masterfee: 'Usta haqi',
    spares: 'Zapchast xarajati',
    anotherexpenses: 'Boshqa xarajat',
  }

  const topClients = [...clients]
    .sort((a, b) => {
      const aOrders = filteredHistory.filter((item) => String(item.client_id) === String(a.id)).length
      const bOrders = filteredHistory.filter((item) => String(item.client_id) === String(b.id)).length
      const aSales = filteredSales.filter((item) => String(item.client_id) === String(a.id)).length
      const bSales = filteredSales.filter((item) => String(item.client_id) === String(b.id)).length
      return (bOrders + bSales) - (aOrders + aSales)
    })
    .slice(0, 5)

  const recentOrders = [...filteredHistory]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const handleExport = () => {
    const csvCell = (value) => {
      if (typeof value === 'number') return String(value)
      const text = String(value ?? '')
      const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
      return `"${safeText.replaceAll('"', '""')}"`
    }
    const rows = [
      [
        'Turi', 'Sana', 'Mijoz', 'Materiallar', 'Mijoz jami', 'Material savdosi', 'Material tannarxi',
        'Material ustamasi', ...serviceRevenueFields.map((field) => serviceLabels[field]),
        ...operatingCostFields.map((field) => operatingCostLabels[field]), 'Jami foyda',
      ],
      ...filteredHistory.map((order) => {
        const orderFinancials = getOrderFinancials(order)
        return [
          'Buyurtma',
          order.date ? new Date(order.date).toLocaleDateString('uz-UZ') : '',
          order.clients?.name || 'Noma’lum mijoz',
          (order.order_materials || []).map((line) => `${line.material_name} × ${line.count}`).join('; '),
          orderFinancials.revenue,
          orderFinancials.materialCosts + orderFinancials.materialMarkup,
          orderFinancials.materialCosts,
          orderFinancials.materialMarkup,
          ...serviceRevenueFields.map((field) => Number(order[field] || 0)),
          ...operatingCostFields.map((field) => Number(order[field] || 0)),
          orderFinancials.profit,
        ]
      }),
      ...filteredSales.map((sale) => {
        const saleFinancials = getInventorySaleFinancials(sale)
        return [
          'Alohida material sotuvi',
          sale.date ? new Date(sale.date).toLocaleDateString('uz-UZ') : '',
          sale.clients?.name || 'Mijozsiz material sotuvi',
          `${sale.material_name} × ${sale.quantity}`,
          saleFinancials.revenue,
          saleFinancials.revenue,
          saleFinancials.cost,
          saleFinancials.profit,
          ...serviceRevenueFields.map(() => 0),
          ...operatingCostFields.map(() => 0),
          saleFinancials.profit,
        ]
      }),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `crm-hisobot-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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
          <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-xs flex items-center gap-1.5">
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
            <span className="text-[10px] text-slate-400">Mijoz jami / tushum</span>
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
            Moliyaviy holat ({dateFilter === 'month' ? 'shu oy' : dateFilter === 'week' ? 'shu hafta' : 'barcha davr'})
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Materiallar sotuv summasi</span>
              <span className="text-xs font-bold text-slate-800">
                {stats.materialSales.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Material savdosidan foyda</span>
              <span className="text-xs font-bold text-emerald-700">
                {stats.materialMarkup.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-xs text-slate-600">Materialning alohida sotuvi (tushum)</span>
              <span className="text-xs font-bold text-blue-700">
                {stats.standaloneMaterialSales.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-xs text-slate-600">Alohida sotuvlar soni / dona</span>
              <span className="text-xs font-semibold text-slate-800">
                {stats.standaloneMaterialSalesCount} ta / {stats.standaloneMaterialQuantity} dona
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-xs text-slate-600">Alohida sotilgan material tannarxi</span>
              <span className="text-xs font-semibold text-slate-800">
                {stats.standaloneMaterialCosts.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-xs text-slate-600">Alohida sotuv foydasi</span>
              <span className="text-xs font-bold text-emerald-700">
                {stats.standaloneMaterialProfit.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Xizmatlardan jami tushum</span>
              <span className="text-xs font-bold text-blue-700">
                {stats.serviceRevenue.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            {serviceRevenueFields.map((field) => (
              <div key={field} className="flex justify-between items-center p-2 pl-5 bg-slate-50 rounded">
                <span className="text-xs text-slate-600">{serviceLabels[field]} tushumi</span>
                <span className="text-xs font-semibold text-slate-800">
                  {serviceRevenueByField[field].toLocaleString('uz-UZ')} so‘m
                </span>
              </div>
            ))}
            <p className="rounded bg-amber-50 p-2 text-[10px] text-amber-800">
              Har bir xizmat bo‘yicha tushum alohida ko‘rsatiladi. Xizmat tannarxi alohida yozilmagani uchun xizmatning sof foydasi hisoblanmaydi; umumiy foydadan faqat kiritilgan ichki xarajatlar ayriladi.
            </p>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Qabul qilingan to‘lovlar (mijozlar bo‘yicha)</span>
              <span className="text-xs font-bold text-emerald-700">
                {stats.totalPayments.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Materiallar xarajati</span>
              <span className="text-xs font-bold text-slate-800">
                {stats.materialCosts.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Ichki xarajatlar jami</span>
              <span className="text-xs font-bold text-rose-700">
                {stats.operatingCosts.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
            {operatingCostFields.map((field) => (
              <div key={field} className="flex justify-between items-center p-2 pl-5 bg-slate-50 rounded">
                <span className="text-xs text-slate-600">{operatingCostLabels[field]}</span>
                <span className="text-xs font-semibold text-slate-800">
                  {operatingCostsByField[field].toLocaleString('uz-UZ')} so‘m
                </span>
              </div>
            ))}
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
              const clientOrders = filteredHistory.filter((order) => String(order.client_id) === String(client.id))
              const clientSales = filteredSales.filter((sale) => String(sale.client_id) === String(client.id))
              const clientSpent = clientOrders.reduce((sum, order) => sum + getOrderTotal(order), 0) +
                clientSales.reduce((sum, sale) => sum + getInventorySaleFinancials(sale).revenue, 0)
              return (
                <div key={client.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                    <span className="text-xs font-semibold text-slate-800">{client.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">{clientSpent.toLocaleString('uz-UZ')} so'm</p>
                    <p className="text-[10px] text-slate-400">{clientOrders.length} buyurtma · {clientSales.length} material savdosi</p>
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
              const payoff = getOrderFinancials(order).profit
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
                    <p className="text-[10px] text-slate-400">{getOrderTotal(order).toLocaleString('uz-UZ')} buyurtma summasi</p>
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
