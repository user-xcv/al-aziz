import React from 'react'
import {
  PlusCircle,
  History,
  Warehouse,
  RotateCw,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  CircleDollarSign,
} from 'lucide-react'

const MainLayout = ({ children, activeTab, setActiveTab }) => {
  // Sarlavhani tanlangan bo'limga qarab o'zgartirish
  const getPageTitle = () => {
    switch (activeTab) {
      case 'enterData':
        return 'Yangi buyurtma'
      case 'history':
        return 'Buyurtmalar tarixi'
      case 'wareHouse':
        return 'Ombor'
      case 'materialSales':
        return 'Material savdosi'
      case 'clients':
        return 'Mijozlar bazasi'
      case 'payments':
        return 'To\'lovlar boshqaruvi'
      case 'reports':
        return 'Statistika'
      case 'invoices':
        return 'Hisob-kitoblar'
      default:
        return 'Asmon ERP'
    }
  }

  const menuItems = [
    { id: 'enterData', title: 'Yangi buyurtma', icon: PlusCircle },
    { id: 'history', title: 'Buyurtmalar tarixi', icon: History },
    { id: 'wareHouse', title: 'Ombor', icon: Warehouse },
    { id: 'materialSales', title: 'Material savdosi', icon: CircleDollarSign },
    { id: 'clients', title: 'Mijozlar', icon: Users },
    { id: 'payments', title: 'To\'lovlar', icon: DollarSign },
    { id: 'invoices', title: 'Hisob-kitob', icon: FileText },
    { id: 'reports', title: 'Statistika', icon: BarChart3 },
  ]

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50/80 font-sans text-slate-800">
      {/* 1. YUQORI NAVBAR */}
      <header className="h-12 bg-blue-500 text-white flex items-center justify-between px-4 shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-6">
          <span className="font-bold text-base tracking-wide flex items-center gap-2">
            Asmon
          </span>
          <h1 className="text-xs font-medium text-blue-100 border-l border-blue-400/60 pl-4 hidden sm:block">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            title="Yangilash"
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-blue-600 rounded-md text-blue-100 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

        </div>
      </header>

      {/* 2. ISHCHI MAYDON (SIDEBAR + CONTENT) */}
      <div className="flex flex-1 overflow-hidden">
        {/* CHAP SIDEBAR */}
        <aside className="w-12 sm:w-48 bg-white border-r border-slate-200/80 flex flex-col py-3 px-1 sm:px-2 shrink-0 select-none z-10">
          <div className="flex flex-col gap-3 w-full">
            {/* Navigation Buttons */}
            <nav aria-label="Asosiy bo‘limlar" className="flex flex-col gap-1 w-full">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    title={item.title}
                    className={`w-full min-h-10 rounded-lg flex items-center justify-center sm:justify-start gap-0 sm:gap-3 px-1 sm:px-3 text-left text-sm transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline">{item.title}</span>
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

        </aside>

        {/* O'RTA CHILD KONTENT MAYDONI */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout