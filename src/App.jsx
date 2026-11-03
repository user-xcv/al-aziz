import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchHistoryOrders } from './features/history/historyThunk'
import { fetchWareHouseData } from './features/wareHouse/wareHouseThunk'
import { fetchClients } from './features/clients/clientsThunk'
import { fetchPayments } from './features/payments/paymentsThunk'
import MainLayout from './layout/mainLayout'
import OrderForm from './features/enterData/OrderForm.'
import HistoryForm from './features/history/HistoryForm'
import WareHouseForm from './features/wareHouse/WareHouseForm'
import ClientsForm from './features/clients/ClientsForm'
import PaymentsForm from './features/payments/PaymentsForm'
import ReportsForm from './features/reports/ReportsForm'
import InvoicesForm from './features/invoices/InvoicesForm'


const App = () => {
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('enterData')

    useEffect(() => {
        dispatch(fetchHistoryOrders())
        dispatch(fetchWareHouseData())
        dispatch(fetchClients())
        dispatch(fetchPayments())
    }, [dispatch])

    return (
        <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* 1. Kassa va Hisob-kitoblar */}
            {activeTab === 'enterData' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5">
                        <OrderForm />
                    </div>
                    <div className="lg:col-span-7">
                        <HistoryForm />
                    </div>
                </div>
            )}

            {/* 2. Xaridlar Tarixi */}
            {activeTab === 'history' && (
                <div className="max-w-5xl mx-auto">
                    <HistoryForm />
                </div>
            )}

            {/* 3. Ombor Kuzatuvi */}
            {activeTab === 'wareHouse' && (
                <WareHouseForm />
            )}

            {/* 4. Mijozlar Bazasi */}
            {activeTab === 'clients' && (
                <div className="max-w-4xl mx-auto">
                    <ClientsForm />
                </div>
            )}

            {/* 5. To'lovlar Boshqaruvi */}
            {activeTab === 'payments' && (
                <div className="max-w-4xl mx-auto">
                    <PaymentsForm />
                </div>
            )}

            {/* 6. Hisobotlar va Analitika */}
            {activeTab === 'reports' && (
                <div className="max-w-6xl mx-auto">
                    <ReportsForm />
                </div>
            )}

            {/* 7. Hisob-kitoblar (Fakturalar) */}
            {activeTab === 'invoices' && (
                <div className="max-w-4xl mx-auto">
                    <InvoicesForm />
                </div>
            )}
        </MainLayout>
    )
}

export default App