import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPayments,
  createPayment,
  editPayment,
  removePayment
} from './paymentsThunk'
import { fetchClients } from '../clients/clientsThunk'
import {
  DollarSign,
  Search,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const PaymentsForm = () => {
  const dispatch = useDispatch()
  const { payments, isLoading } = useSelector((state) => state.payments)
  const { clients } = useSelector((state) => state.clients)

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    payment_type: 'cash',
    notes: ''
  })

  useEffect(() => {
    dispatch(fetchPayments())
    dispatch(fetchClients())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date().toISOString()
      }

      if (editingPayment) {
        await dispatch(editPayment({ id: editingPayment.id, updatedFields: payload })).unwrap()
      } else {
        await dispatch(createPayment(payload)).unwrap()
      }
      setIsModalOpen(false)
      setEditingPayment(null)
      setFormData({ client_id: '', amount: '', payment_type: 'cash', notes: '' })
    } catch (err) {
      alert('Xatolik: ' + err)
    }
  }

  const handleEdit = (payment) => {
    setEditingPayment(payment)
    setFormData({
      client_id: payment.client_id,
      amount: payment.amount,
      payment_type: payment.payment_type || 'cash',
      notes: payment.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu to'lovni o'chirmoqchimisiz?")) {
      try {
        await dispatch(removePayment(id)).unwrap()
      } catch (err) {
        alert('Xatolik: ' + err)
      }
    }
  }

  const handleOpenModal = () => {
    setEditingPayment(null)
    setFormData({ client_id: '', amount: '', payment_type: 'cash', notes: '' })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPayment(null)
    setFormData({ client_id: '', amount: '', payment_type: 'cash', notes: '' })
  }

  const filteredPayments = payments.filter(p =>
    p.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  return (
    <div className="space-y-4 font-sans text-slate-700">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800">To'lovlar boshqaruvi</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {payments.length} ta
          </span>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-md text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Yangi to'lov
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Jami to'lovlar</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {totalPayments.toLocaleString('uz-UZ')} so'm
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">To'lovlar soni</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {payments.length} ta
          </p>
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
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none rounded-md pl-10 pr-4 py-2 text-xs"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <p className="text-center text-xs text-slate-400 py-10">Yuklanmoqda...</p>
        ) : filteredPayments.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center text-slate-400">
            <DollarSign className="w-8 h-8 stroke-[1.25] text-slate-300 mb-1.5" />
            <p className="text-xs font-medium text-slate-600">To'lovlar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {payment.clients?.name || 'Noma\'lum mijoz'}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {payment.date ? new Date(payment.date).toLocaleString('uz-UZ') : 'Vaqt yo\'q'}
                    </p>
                    {payment.notes && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{payment.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600 block">
                      {Number(payment.amount).toLocaleString('uz-UZ')} so'm
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {payment.payment_type === 'cash' ? 'Naqd' : 'Karta'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(payment)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingPayment ? 'To\'lovni tahrirlash' : 'Yangi to\'lov qo\'shish'}
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                  Mijoz *
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs"
                >
                  <option value="">Mijoz tanlang</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                  Summa (so'm) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                  To'lov turi
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs"
                >
                  <option value="cash">Naqd pul</option>
                  <option value="card">Plastik karta</option>
                  <option value="transfer">Bank o'tkazmasi</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                  Izohlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-md px-3 py-2 text-xs resize-none"
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-md text-xs"
                >
                  {editingPayment ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsForm
