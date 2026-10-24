// src/UiComponents/Navbar.jsx
import React from 'react'
import { Search, RotateCw, User } from 'lucide-react'

const Navbar = ({ activeTab }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'enterData': return 'Yangi Hisob va Xizmatlar'
      case 'history': return 'Xaridlar tarixi'
      case 'wareHouse': return 'Ombor kuzatuvi'
      default: return 'Asmon ERP'
    }
  }

  return (
    <header className="h-12 bg-blue-500 text-white flex items-center justify-between px-4 shrink-0 shadow-2xs z-10">
      {/* Brand & Page Title */}
      <div className="flex items-center gap-6">
        <span className="font-bold text-base tracking-wide flex items-center gap-2">
          Asmon
        </span>
        <h1 className="text-xs font-medium text-blue-100 border-l border-blue-400/60 pl-4 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      {/* Search & User Profile */}
      <div className="flex items-center gap-3">
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-blue-200 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Qidiruv..."
            className="w-full bg-blue-600/50 hover:bg-blue-600/70 focus:bg-blue-600 text-white placeholder-blue-200 text-xs rounded-md pl-8 pr-3 py-1 outline-none transition-all border border-blue-400/40"
          />
        </div>

        <button title="Yangilash" className="p-1.5 hover:bg-blue-600 rounded-md text-blue-100 transition-colors">
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-blue-300/30">
          A
        </div>
      </div>
    </header>
  )
}

export default Navbar