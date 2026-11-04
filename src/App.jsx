import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isSupabaseConfigured, supabase } from './api/supabase'
import { fetchHistoryOrders } from './features/history/historyThunk'
import { fetchWareHouseData } from './features/wareHouse/wareHouseThunk'
import { fetchClients } from './features/clients/clientsThunk'
import { fetchPayments } from './features/payments/paymentsThunk'
import MainLayout from './layout/mainLayout'
import OrderForm from './features/enterData/OrderForm'
import HistoryForm from './features/history/HistoryForm'
import WareHouseForm from './features/wareHouse/WareHouseForm'
import ClientsForm from './features/clients/ClientsForm'
import PaymentsForm from './features/payments/PaymentsForm'
import ReportsForm from './features/reports/ReportsForm'
import InventorySalesForm from './features/inventorySales/InventorySalesForm'
import { fetchInventorySales } from './features/inventorySales/inventorySalesThunk'
import SettingsForm from './features/settings/SettingsForm'
import { DEFAULT_SETTINGS } from './features/settings/settingsModel'
import { fetchSettingsAPI, saveSettingsAPI } from './features/settings/settingsService'

const App = () => {
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('enterData')
    const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS)
    const [displaySettings, setDisplaySettings] = useState(DEFAULT_SETTINGS)
    const [settingsReady, setSettingsReady] = useState(false)
    const [settingsError, setSettingsError] = useState('')
    const [sidebarSaving, setSidebarSaving] = useState(false)
    const historyError = useSelector((state) => state.history?.error)
    const warehouseError = useSelector((state) => state.wareHouse?.error)
    const clientsError = useSelector((state) => state.clients?.error)
    const paymentsError = useSelector((state) => state.payments?.error)
    const inventorySalesError = useSelector((state) => state.inventorySales?.error)
    const dataErrors = [
        historyError,
        warehouseError,
        clientsError,
        paymentsError,
        activeTab === 'materialSales' ? null : inventorySalesError,
    ].filter(Boolean)
    useEffect(() => {
        if (!isSupabaseConfigured) return
        dispatch(fetchHistoryOrders())
        dispatch(fetchWareHouseData())
        dispatch(fetchClients())
        dispatch(fetchPayments())
        dispatch(fetchInventorySales())
    }, [dispatch])

    const loadSettings = useCallback(async () => {
        setSettingsError('')
        setSettingsReady(false)
        try {
            const settings = await fetchSettingsAPI(supabase)
            setSavedSettings(settings)
            setDisplaySettings(settings)
            setSettingsReady(true)
        } catch (error) {
            setSettingsError(`Sozlamalarni yuklab bo‘lmadi: ${error.message}`)
        }
    }, [])

    useEffect(() => {
        if (!isSupabaseConfigured) return undefined

        let isCurrent = true
        fetchSettingsAPI(supabase)
            .then((settings) => {
                if (!isCurrent) return
                setSavedSettings(settings)
                setDisplaySettings(settings)
                setSettingsReady(true)
            })
            .catch((error) => {
                if (isCurrent) setSettingsError(`Sozlamalarni yuklab bo‘lmadi: ${error.message}`)
            })

        return () => {
            isCurrent = false
        }
    }, [])

    const previewSettings = (settings) => setDisplaySettings(settings)

    const persistSettings = async (settings) => {
        const previousSettings = savedSettings
        setDisplaySettings(settings)
        setSettingsError('')
        try {
            const saved = await saveSettingsAPI(settings, supabase)
            setSavedSettings(saved)
            setDisplaySettings(saved)
            setSettingsReady(true)
            return saved
        } catch (error) {
            setDisplaySettings(previousSettings)
            setSettingsError(`Sozlamalarni saqlab bo‘lmadi: ${error.message}`)
            throw error
        }
    }

    const toggleSidebar = () => {
        if (!settingsReady || sidebarSaving) return
        const previousSettings = displaySettings
        const nextSidebarState = !displaySettings.sidebarCollapsed
        const settingsToSave = { ...savedSettings, sidebarCollapsed: nextSidebarState }
        setSidebarSaving(true)
        setDisplaySettings({ ...displaySettings, sidebarCollapsed: nextSidebarState })
        setSettingsError('')
        saveSettingsAPI(settingsToSave, supabase)
            .then((saved) => {
                setSavedSettings(saved)
                setDisplaySettings((current) => ({
                    ...current,
                    sidebarCollapsed: saved.sidebarCollapsed,
                }))
            })
            .catch((error) => {
                setDisplaySettings(previousSettings)
                setSettingsError(`Yon menyu sozlamasini saqlab bo‘lmadi: ${error.message}`)
            })
            .finally(() => setSidebarSaving(false))
    }

    const refreshData = () => {
        dispatch(fetchHistoryOrders())
        dispatch(fetchWareHouseData())
        dispatch(fetchClients())
        dispatch(fetchPayments())
        dispatch(fetchInventorySales())
    }

    if (!isSupabaseConfigured) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <section role="alert" className="max-w-xl bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
                    <h1 className="text-lg font-bold text-slate-800">Supabase sozlamalari kerak</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Loyihaning ildizidagi <code>.env</code> faylida <code>VITE_SUPABASE_URL</code> va
                        <code> VITE_SUPABASE_ANON_KEY</code> qiymatlarini belgilang, so‘ng ilovani qayta ishga tushiring.
                    </p>
                </section>
            </main>
        )
    }
    return (
        <MainLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={displaySettings}
            settingsReady={settingsReady}
            sidebarSaving={sidebarSaving}
            onToggleSidebar={toggleSidebar}
        >
            {settingsError && (
                <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <span>{settingsError}</span>
                    {!settingsReady && (
                        <button
                            type="button"
                            onClick={loadSettings}
                            className="shrink-0 rounded bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100"
                        >
                            Qayta urinish
                        </button>
                    )}
                </div>
            )}
            {!settingsReady && !settingsError && (
                <p role="status" className="mb-3 text-xs text-slate-500">Ko‘rinish sozlamalari yuklanmoqda…</p>
            )}
            {dataErrors.length > 0 && (
                <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <span>Supabase xatosi: {dataErrors[0]}</span>
                    <button
                        type="button"
                        onClick={refreshData}
                        className="shrink-0 rounded bg-white px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100"
                    >
                        Qayta yuklash
                    </button>
                </div>
            )}
            {/* 1. Kassa va Hisob-kitoblar */}
            {activeTab === 'enterData' && (
                <div className="grid grid-cols-1 items-start gap-4 lg:h-[calc(100dvh-5.5rem)] lg:min-h-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:overflow-hidden">
                    <section className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                        <OrderForm />
                    </section>
                    <section className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto">
                        <HistoryForm />
                    </section>
                </div>
            )}

            {/* 2. Xaridlar Tarixi */}
            {activeTab === 'history' && (
                <div className="max-w-6xl mx-auto">
                    <HistoryForm />
                </div>
            )}

            {/* 3. Ombor Kuzatuvi */}
            {activeTab === 'wareHouse' && (
                <WareHouseForm />
            )}

            {activeTab === 'materialSales' && (
                <InventorySalesForm />
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
                <div className="max-w-5xl mx-auto">
                    <ReportsForm />
                </div>
            )}

            {activeTab === 'settings' && (
                <SettingsForm
                    settings={savedSettings}
                    settingsReady={settingsReady}
                    onPreview={previewSettings}
                    onSave={persistSettings}
                />
            )}

        </MainLayout>
    )
}

export default App