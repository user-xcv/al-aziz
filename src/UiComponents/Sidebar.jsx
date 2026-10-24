     // src/UiComponents/Sidebar.jsx
import React from 'react'
import {
  PlusCircle,
  History,
  Warehouse,
  Menu,
  ShoppingBag,
  TrendingUp,
  Settings,
  Info,
  Grid
} from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'enterData', title: 'Yangi Hisob (Kassa)', icon: PlusCircle },
    { id: 'history', title: 'Xaridlar Tarixi', icon: History },
    { id: 'wareHouse', title: 'Ombor kuzatuvi', icon: Warehouse },
  ]

  return (
    <aside className="w-14 bg-white border-r border-slate-200/80 flex flex-col items-center py-2 justify-between shrink-0 select-none z-20">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Menu Toggle Button */}
        <button className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="w-8 h-[1px] bg-slate-100 my-0.5" />

        {/* Asosiy Ishchi Tugmalar */}
        <div className="flex flex-col items-center gap-2 w-full px-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.title}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pastki Yordamchi Ikonkalar */}
      <div className="flex flex-col items-center gap-2 w-full px-1.5 pt-2 border-t border-slate-100">
        <button title="Sozlamalar" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <button title="Ma'lumot" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <Info className="w-4 h-4" />
        </button>
        <button title="Modullar" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <Grid className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar