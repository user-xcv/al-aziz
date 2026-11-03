import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHistoryOrders } from '../history/historyThunk'
import { fetchClients } from '../clients/clientsThunk'
import {
  FileText,
  Printer,
  Download,
  Search,
  Calendar,
  User,
  CheckCircle,
  X
} from 'lucide-react'

const InvoicesForm = () => {
  const dispatch = useDispatch()
  const { historyList } = useSelector((state) => state.history)
  const { clients } = useSelector((state) => state.clients)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchHistoryOrders())
    dispatch(fetchClients())
  }, [dispatch])

  const filteredOrders = historyList.filter(item =>
    item.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePrint = () => {
    window.print()
  }

  const handlePreview = (order) => {
    setSelectedOrder(order)
    setIsPreviewOpen(true)
  }

  const calculateTotal = (order) => {
    const materialsTotal = (order.order_materials || []).reduce((sum, mat) =>
      sum + Number(mat.totalprice || 0), 0
    )
    const expensesTotal =
      Number(order.bazis || 0) +
      Number(order.cutting || 0) +
      Number(order.kromka || 0) +
      Number(order.piercing || 0) +
      Number(order.rover || 0) +
      Number(order.masterfee || 0) +
      Number(order.spares || 0) +
      Number(order.anotherexpenses || 0)

    return {
      materials: materialsTotal,
      expenses: expensesTotal,
      total: materialsTotal + expensesTotal
    }
  }

  return (
    <div className="space-y-4 font-sans text-slate-700">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Hisob-kitoblar (Fakturalar)</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {filteredOrders.length} ta
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Mijoz ismi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none rounded-md pl-10 pr-4 py-2 text-xs"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center text-slate-400">
            <FileText className="w-8 h-8 stroke-[1.25] text-slate-300 mb-1.5" />
            <p className="text-xs font-medium text-slate-600">Buyurtmalar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredOrders.map((order) => {
              const totals = calculateTotal(order)
              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {order.clients?.name || 'Noma\'lum mijoz'}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {order.date ? new Date(order.date).toLocaleString('uz-UZ') : 'Vaqt yo\'q'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 block">
                        {totals.total.toLocaleString('uz-UZ')} so'm
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {Number(order.overallmoney || 0).toLocaleString('uz-UZ')} olingan
                      </span>
                    </div>

                    <button
                      onClick={() => handlePreview(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Hisob
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invoice Preview Modal */}
      {isPreviewOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Hisob-kitob
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h1 className="text-xl font-bold text-slate-800">ASMON MEBEL</h1>
                <p className="text-xs text-slate-500 mt-1">Hisob-kitob faktura</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  #{selectedOrder.id} · {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString('uz-UZ') : ''}
                </p>
              </div>

              {/* Client Info */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-bold text-slate-700">Mijoz ma'lumotlari</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{selectedOrder.clients?.name || 'Noma\'lum'}</p>
                {selectedOrder.clients?.phone_number && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.clients.phone_number}</p>
                )}
              </div>

              {/* Materials */}
              {selectedOrder.order_materials && selectedOrder.order_materials.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Materiallar</p>
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-semibold text-slate-600">Nomi</th>
                          <th className="text-center p-2 font-semibold text-slate-600">Soni</th>
                          <th className="text-right p-2 font-semibold text-slate-600">Narxi</th>
                          <th className="text-right p-2 font-semibold text-slate-600">Jami</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_materials.map((mat, index) => (
                          <tr key={index} className="border-t border-slate-100">
                            <td className="p-2 text-slate-700">{mat.material_name}</td>
                            <td className="p-2 text-center text-slate-700">{mat.count}</td>
                            <td className="p-2 text-right text-slate-700">{Number(mat.price).toLocaleString('uz-UZ')}</td>
                            <td className="p-2 text-right font-semibold text-slate-800">{Number(mat.totalPrice).toLocaleString('uz-UZ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Services */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Xizmatlar</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Number(selectedOrder.bazis) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Bazis</span>
                      <span className="font-semibold">{Number(selectedOrder.bazis).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.cutting) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Arra</span>
                      <span className="font-semibold">{Number(selectedOrder.cutting).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.kromka) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Kromka</span>
                      <span className="font-semibold">{Number(selectedOrder.kromka).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.piercing) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Teshish</span>
                      <span className="font-semibold">{Number(selectedOrder.piercing).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.rover) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Rover</span>
                      <span className="font-semibold">{Number(selectedOrder.rover).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.masterfee) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Usta haqqi</span>
                      <span className="font-semibold">{Number(selectedOrder.masterfee).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.spares) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Zapchast</span>
                      <span className="font-semibold">{Number(selectedOrder.spares).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                  {Number(selectedOrder.anotherexpenses) > 0 && (
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Boshqa</span>
                      <span className="font-semibold">{Number(selectedOrder.anotherexpenses).toLocaleString('uz-UZ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Jami summa:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {calculateTotal(selectedOrder).total.toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Olingan pul:</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {Number(selectedOrder.overallmoney || 0).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                  <span className="text-sm font-semibold text-slate-700">Qolgan (Foyda):</span>
                  <span className={`text-lg font-bold ${Number(selectedOrder.payoff || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {Number(selectedOrder.payoff || 0).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Chop etish
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoicesForm
