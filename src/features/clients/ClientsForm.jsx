import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchClients,
  createClient,
  editClient,
  removeClient,
  searchClients
} from './clientsThunk'
import {
  UserPlus,
  Search,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  X,
  Clock,
  History
} from 'lucide-react'
import { getCustomerBusinessHistory } from '../inventorySales/inventorySaleCalculations'

const ClientsForm = () => {
  const dispatch = useDispatch()
  const { clients, isLoading } = useSelector((state) => state.clients)
  const { historyList = [] } = useSelector((state) => state.history || {})
  const { sales = [] } = useSelector((state) => state.inventorySales || {})

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [historyClient, setHistoryClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.length > 0) {
      dispatch(searchClients(term))
    } else {
      dispatch(fetchClients())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await dispatch(editClient({ id: editingClient.id, updatedFields: formData })).unwrap()
      } else {
        await dispatch(createClient(formData)).unwrap()
      }
      setIsModalOpen(false)
      setEditingClient(null)
      setFormData({ name: '', phone_number: '', address: '', notes: '' })
    } catch (err) {
      alert('Xatolik: ' + err)
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone_number: client.phone_number || '',
      address: client.address || '',
      notes: client.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) {
      try {
        await dispatch(removeClient(id)).unwrap()
      } catch (err) {
        alert('Xatolik: ' + err)
      }
    }
  }

  const handleOpenModal = () => {
    setEditingClient(null)
    setFormData({ name: '', phone_number: '', address: '', notes: '' })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    setFormData({ name: '', phone_number: '', address: '', notes: '' })
  }

  return (
    <div className="space-y-4 font-sans text-slate-700">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Mijozlar bazasi</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {clients.length} ta
          </span>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-xs flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Yangi mijoz
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Mijoz ismi yoki telefon raqami bo'yicha qidirish..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none rounded-md pl-10 pr-4 py-2 text-xs"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <p className="text-center text-xs text-slate-400 py-10">Yuklanmoqda...</p>
        ) : clients.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center text-slate-400">
            <UserPlus className="w-8 h-8 stroke-[1.25] text-slate-300 mb-1.5" />
            <p className="text-xs font-medium text-slate-600">Mijozlar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {clients.map((client) => {
              const clientOrderCount = historyList.filter(
                (order) => String(order.client_id) === String(client.id),
              ).length
              const clientSaleCount = sales.filter(
                (sale) => String(sale.client_id) === String(client.id),
              ).length
              return (
              <div
                key={client.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{client.name}</p>
                    {client.phone_number && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {client.phone_number}
                      </p>
                    )}
                    {client.address && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {client.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHistoryClient(client)}
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    title="Mijoz tarixi"
                  >
                    <History className="h-3.5 w-3.5" />
                    Tarix ({clientOrderCount + clientSaleCount})
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="O'chirish"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingClient ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                  Mijoz ismi *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ism va familiya"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Telefon raqami
                </label>
                <input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Manzil
                </label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Shahar, ko'cha, uy"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Izohlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-md px-3 py-2 text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-md text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-xs"
                >
                  {editingClient ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section role="dialog" aria-modal="true" aria-label={`${historyClient.name} tarixi`} className="max-h-[90vh] w-full max-w-2xl space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{historyClient.name} — mijoz tarixi</h3>
                <p className="text-[11px] text-slate-500">{historyClient.phone_number || ''}</p>
              </div>
              <button type="button" onClick={() => setHistoryClient(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Yopish">
                <X className="h-4 w-4" />
              </button>
            </header>
            {(() => {
              const events = getCustomerBusinessHistory(historyClient.id, historyList, sales)
              if (!events.length) {
                return <p className="py-8 text-center text-xs text-slate-500">Bu mijoz uchun tarix hali yo‘q.</p>
              }
              return (
                <div className="space-y-2">
                  {events.map((event) => {
                    if (event.type === 'order') {
                      const order = event.order
                      return (
                      <article key={`order-${event.id}`} className="space-y-1 rounded-md border border-slate-200 p-3 text-xs">
                        <div className="flex justify-between gap-2">
                          <b>Buyurtma #{event.id} · {event.date ? new Date(event.date).toLocaleDateString('uz-UZ') : ''}</b>
                          <b>{event.revenue.toLocaleString('uz-UZ')} so‘m</b>
                        </div>
                        <p className="text-slate-600">
                          Tushum xizmatlari: {[['Bazis', order.bazis], ['Kesish', order.cutting], ['Kromka', order.kromka], ['Teshish', order.piercing], ['Rover', order.rover]]
                            .filter(([, amount]) => Number(amount || 0) > 0)
                            .map(([name, amount]) => `${name} ${Number(amount).toLocaleString('uz-UZ')}`)
                            .join(' · ') || 'Xizmat kiritilmagan'}
                        </p>
                        <p className="text-slate-600">
                          Materiallar: {(order.order_materials || []).map((line) => `${line.material_name} × ${line.count}`).join(', ') || 'yo‘q'}
                        </p>
                        <p className="flex flex-wrap justify-between gap-2 text-slate-600">
                          <span>To‘langan: {event.received.toLocaleString('uz-UZ')} so‘m</span>
                          <span>Foyda: {event.profit.toLocaleString('uz-UZ')} so‘m</span>
                        </p>
                      </article>
                      )
                    }
                    const sale = event.sale
                    return (
                      <article key={`sale-${event.id}`} className="space-y-1 rounded-md border border-blue-100 bg-blue-50/40 p-3 text-xs">
                        <div className="flex justify-between gap-2">
                          <b>Material sotuvi #{event.id} · {event.date ? new Date(event.date).toLocaleDateString('uz-UZ') : ''}</b>
                          <b>{event.revenue.toLocaleString('uz-UZ')} so‘m</b>
                        </div>
                        <p>{sale.material_name} × {sale.quantity} dona · Tannarx {event.cost.toLocaleString('uz-UZ')} so‘m</p>
                        <p className="flex flex-wrap justify-between gap-2 text-slate-600">
                          <span>Olingan: {event.received.toLocaleString('uz-UZ')} · Qolgan: {event.balance.toLocaleString('uz-UZ')} so‘m</span>
                          <span className="font-semibold text-emerald-700">Foyda: {event.profit.toLocaleString('uz-UZ')} so‘m</span>
                        </p>
                      </article>
                    )
                  })}
                </div>
              )
            })()}
          </section>
        </div>
      )}
    </div>
  )
}

export default ClientsForm
