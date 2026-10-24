import React from 'react'
import {
  PlusCircle,
  History,
  Warehouse,
  Menu,
  Settings,
  Info,
  Grid,
  Search,
  RotateCw
} from 'lucide-react'

const MainLayout = ({ children, activeTab, setActiveTab }) => {
  // Sarlavhani tanlangan bo'limga qarab o'zgartirish
  const getPageTitle = () => {
    switch (activeTab) {
      case 'enterData':
        return 'Yangi Hisob va Xizmatlar'
      case 'history':
        return 'Xaridlar tarixi'
      case 'wareHouse':
        return 'Ombor kuzatuvi'
      default:
        return 'Asmon ERP'
    }
  }

  const menuItems = [
    { id: 'enterData', title: 'Yangi Hisob', icon: PlusCircle },
    { id: 'history', title: 'Xaridlar Tarixi', icon: History },
    { id: 'wareHouse', title: 'Ombor kuzatuvi', icon: Warehouse },
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
          {/* Qidiruv inputi */}
          <div className="relative w-44 sm:w-60">
            <Search className="w-3.5 h-3.5 text-blue-200 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Qidiruv..."
              className="w-full bg-blue-600/50 focus:bg-blue-600 text-white placeholder-blue-200 text-xs rounded-md pl-8 pr-3 py-1 outline-none transition-all border border-blue-400/40"
            />
          </div>

          <button
            title="Yangilash"
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-blue-600 rounded-md text-blue-100 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-blue-300/30">
            A
          </div>
        </div>
      </header>

      {/* 2. ISHCHI MAYDON (SIDEBAR + CONTENT) */}
      <div className="flex flex-1 overflow-hidden">
        {/* CHAP SIDEBAR */}
        <aside className="w-12 bg-white border-r border-slate-200/80 flex flex-col items-center py-2 justify-between shrink-0 select-none z-10">
          <div className="flex flex-col items-center gap-3 w-full">
            <button className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <Menu className="w-4 h-4 stroke-[2]" />
            </button>

            <div className="w-6 h-[1px] bg-slate-100 my-0.5" />

            {/* Navigation Buttons */}
            <div className="flex flex-col items-center gap-2 w-full px-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={item.title}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-1 pt-2 border-t border-slate-100">
            <button title="Sozlamalar" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button title="Ma'lumot" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <Info className="w-3.5 h-3.5" />
            </button>
            <button title="Modullar" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <Grid className="w-3.5 h-3.5" />
            </button>
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