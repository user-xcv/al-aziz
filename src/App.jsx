import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHistoryOrders } from './features/history/historyThunk'
import HistoryForm from './features/history/HistoryForm'
import { TrendingUp } from 'lucide-react'
import OrderForm from './features/enterData/OrderForm.'

const App = () => {
    const dispatch = useDispatch()
    const { historyList } = useSelector((state) => state.history)

    useEffect(() => {
        dispatch(fetchHistoryOrders())
    }, [dispatch])

    const totalPayoff = historyList.reduce((sum, item) => sum + Number(item.payoff || 0), 0)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Top Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                        Al-Aziz
                    </h1>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>
                                Jami Sof Foyda: {totalPayoff.toLocaleString('uz-UZ')} so'm
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Chap tomon: Yangi hisob kiritish formasi */}
                    <div className="lg:col-span-6 xl:col-span-5">
                        <OrderForm />
                    </div>

                    {/* O'ng tomon: Tarix va Statistika bloki */}
                    <div className="lg:col-span-6 xl:col-span-7">
                        <HistoryForm />
                    </div>

                </div>
            </main>
        </div>
    )
}

export default App