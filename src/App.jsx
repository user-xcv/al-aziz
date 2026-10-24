import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchHistoryOrders } from './features/history/historyThunk'
import { fetchWareHouseData } from './features/wareHouse/wareHouseThunk'
import MainLayout from './layout/mainLayout'
import OrderForm from './features/enterData/OrderForm.'
import HistoryForm from './features/history/HistoryForm'
import WareHouseForm from './features/wareHouse/WareHouseForm'


const App = () => {
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('enterData')

    useEffect(() => {
        dispatch(fetchHistoryOrders())
        dispatch(fetchWareHouseData())
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
        </MainLayout>
    )
}

export default App