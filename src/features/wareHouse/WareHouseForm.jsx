import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWareHouseData } from './wareHouseThunk'
import { addCategoryAPI, addFormatAPI, addMaterialAPI, updateMaterialAPI, deleteMaterialAPI } from './wareHouseService'
import { Folder, FolderOpen, FileText, ChevronRight, ArrowLeft, Plus, Edit2, Trash2, Layers, Tag, Package, ShieldCheck } from 'lucide-react'

const WareHouseForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [], isLoading } = useSelector((state) => state.wareHouse || {})

  // Navigation state (Fayl navigatsiyasi)
  const [currentCategory, setCurrentCategory] = useState(null) // null = Asosiy kategoriyalar
  const [currentFormat, setCurrentFormat] = useState(null)     // null = Formatlar darajasi

  // Admin formasi uchun tablar ('material', 'category', 'format')
  const [adminTab, setAdminTab] = useState('material')

  // Inputs
  const [newCatName, setNewCatName] = useState('')
  const [newFormatName, setNewFormatName] = useState('')
  const [selectedCatForFormat, setSelectedCatForFormat] = useState('')

  const [materialForm, setMaterialForm] = useState({
    id: null,
    category_id: '',
    format_id: '',
    name: '',
    stock_count: '',
    cost_price: '',
    sell_price: ''
  })

  useEffect(() => {
    dispatch(fetchWareHouseData())
  }, [dispatch])

  // Qayta yuklash
  const reloadData = () => {
    dispatch(fetchWareHouseData())
  }

  // 1. Yangi Kategoriya Yaratish
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      await addCategoryAPI(newCatName.trim())
      alert("Kategoriya yaratildi!")
      setNewCatName('')
      reloadData()
    } catch (err) {
      alert("Xatolik: " + err.message)
    }
  }

  // 2. Yangi Format Yaratish
  const handleCreateFormat = async (e) => {
    e.preventDefault()
    if (!selectedCatForFormat || !newFormatName.trim()) return
    try {
      await addFormatAPI(Number(selectedCatForFormat), newFormatName.trim())
      alert("Format biriktirildi!")
      setNewFormatName('')
      reloadData()
    } catch (err) {
      alert("Xatolik: " + err.message)
    }
  }

  // 3. Material Qo'shish / Tahrirlash
  const handleSaveMaterial = async (e) => {
    e.preventDefault()
    const payload = {
      category_id: Number(materialForm.category_id),
      format_id: materialForm.format_id ? Number(materialForm.format_id) : null,
      name: materialForm.name,
      stock_count: Number(materialForm.stock_count),
      cost_price: Number(materialForm.cost_price),
      sell_price: Number(materialForm.sell_price)
    }

    try {
      if (materialForm.id) {
        await updateMaterialAPI({ id: materialForm.id, updatedFields: payload })
        alert("Material tahrirlandi!")
      } else {
        await addMaterialAPI(payload)
        alert("Yangi material omborga qo'shildi!")
      }
      setMaterialForm({ id: null, category_id: '', format_id: '', name: '', stock_count: '', cost_price: '', sell_price: '' })
      reloadData()
    } catch (err) {
      alert("Xatolik: " + err.message)
    }
  }

  const handleEditItem = (item) => {
    setAdminTab('material')
    setMaterialForm({
      id: item.id,
      category_id: item.category_id,
      format_id: item.format_id || '',
      name: item.name,
      stock_count: item.stock_count,
      cost_price: item.cost_price,
      sell_price: item.sell_price
    })
  }

  const handleDeleteItem = async (id) => {
    if (window.confirm("Materialni o'chirishni tasdiqlaysizmi?")) {
      await deleteMaterialAPI(id)
      reloadData()
    }
  }

  // Chap taraf navigatsiya filtri
  const getNavItems = () => {
    if (!currentCategory) {
      return { type: 'categories', items: categories }
    }
    if (currentCategory && !currentFormat) {
      const catFormats = currentCategory.formats || []
      const catMaterialsNoFormat = materials.filter(m => String(m.category_id) === String(currentCategory.id) && !m.format_id)
      return { type: 'formats', formats: catFormats, materials: catMaterialsNoFormat }
    }
    if (currentCategory && currentFormat) {
      const filtered = materials.filter(
        m => String(m.category_id) === String(currentCategory.id) && String(m.format_id) === String(currentFormat.id)
      )
      return { type: 'materials', items: filtered }
    }
  }

  const navData = getNavItems()

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Dynamic Header Path */}
      <div className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium">
          <button 
            onClick={() => { setCurrentCategory(null); setCurrentFormat(null) }}
            className={`flex items-center gap-1 hover:text-blue-600 ${!currentCategory ? 'font-bold text-blue-600' : 'text-slate-500'}`}
          >
            <Folder className="w-4 h-4" /> Ombordagi Papkalar
          </button>

          {currentCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button 
                onClick={() => setCurrentFormat(null)}
                className={`flex items-center gap-1 hover:text-blue-600 ${!currentFormat ? 'font-bold text-blue-600' : 'text-slate-500'}`}
              >
                <FolderOpen className="w-4 h-4 text-amber-500" /> {currentCategory.name}
              </button>
            </>
          )}

          {currentFormat && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-blue-600 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-500" /> {currentFormat.name}
              </span>
            </>
          )}
        </div>

        {(currentCategory || currentFormat) && (
          <button
            onClick={() => {
              if (currentFormat) setCurrentFormat(null)
              else if (currentCategory) setCurrentCategory(null)
            }}
            className="flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded transition-all cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Orqaga
          </button>
        )}
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
        
        {/* ================= CHAP PANEL: FAYLLAR VA PAPKALAR (7-col) ================= */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {!currentCategory ? 'Kategoriyalar' : !currentFormat ? `${currentCategory.name} Formatlari` : `${currentFormat.name} Materiallari`}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Fayl-tizim interfeysi</span>
            </div>

            {/* 1. KATEGORIYALAR DARAJI */}
            {navData.type === 'categories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const catMatCount = materials.filter(m => String(m.category_id) === String(cat.id)).reduce((a, b) => a + Number(b.stock_count || 0), 0)
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat)}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-6 h-6 text-amber-500 fill-amber-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">{cat.name}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{(cat.formats || []).length} ta format mavjud</p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        {catMatCount} dona
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 2. FORMATLAR DARAJI */}
            {navData.type === 'formats' && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 mb-2">FORMAT PAPKALARI:</p>
                <div className="grid grid-cols-2 gap-2">
                  {navData.formats.map((fmt) => {
                    const fmtCount = materials.filter(m => String(m.format_id) === String(fmt.id)).reduce((a, b) => a + Number(b.stock_count || 0), 0)
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => setCurrentFormat(fmt)}
                        className="p-3 rounded-md border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-bold text-slate-800">{fmt.name}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{fmtCount} dona</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. MATERIALLAR DARAJI (HAQIQIY TOVARLAR) */}
            {navData.type === 'materials' && (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {navData.items.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-10">Ushbu formatda material kiritilmagan.</p>
                ) : (
                  navData.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-md border border-slate-200 hover:bg-slate-50/80 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            Olish: {Number(item.cost_price).toLocaleString('uz-UZ')} so'm | Sotish: <b className="text-blue-600">{Number(item.sell_price).toLocaleString('uz-UZ')} so'm</b>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-slate-800 text-xs block">{item.stock_count} dona</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            Foyda: {((Number(item.sell_price) - Number(item.cost_price)) * Number(item.stock_count)).toLocaleString('uz-UZ')} so'm
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditItem(item)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-slate-300 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= O'NG PANEL: ADMIN TAHRIRLASH MARKAZI (5-col) ================= */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs space-y-4">
          
          {/* Admin Nav Tablar */}
          <div className="flex border-b border-slate-100 gap-2 pb-2">
            <button
              onClick={() => setAdminTab('material')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                adminTab === 'material' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Material Kiritish
            </button>
            <button
              onClick={() => setAdminTab('category')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                adminTab === 'category' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              + Kategoriya
            </button>
            <button
              onClick={() => setAdminTab('format')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                adminTab === 'format' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              + Format
            </button>
          </div>

          {/* TAB 1: MATERIAL KIRITISH/TAHRIRLASH */}
          {adminTab === 'material' && (
            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                {materialForm.id ? 'Materialni Tahrirlash' : 'Omborga Tovar Qo\'shish'}
              </h3>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Kategoriya</label>
                <select
                  required
                  value={materialForm.category_id}
                  onChange={(e) => setMaterialForm({ ...materialForm, category_id: e.target.value, format_id: '' })}
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2 bg-white"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Format (Kvadratura)</label>
                <select
                  value={materialForm.format_id}
                  onChange={(e) => setMaterialForm({ ...materialForm, format_id: e.target.value })}
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2 bg-white"
                >
                  <option value="">Formatni tanlang</option>
                  {(categories.find(c => String(c.id) === String(materialForm.category_id))?.formats || []).map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>{fmt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Material Nomi / Rangi</label>
                <input
                  type="text"
                  required
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  placeholder="masalan: LDSP 16mm Oq Premier"
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Soni</label>
                  <input
                    type="number"
                    required
                    value={materialForm.stock_count}
                    onChange={(e) => setMaterialForm({ ...materialForm, stock_count: e.target.value })}
                    placeholder="0"
                    className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Olish Narxi</label>
                  <input
                    type="number"
                    required
                    value={materialForm.cost_price}
                    onChange={(e) => setMaterialForm({ ...materialForm, cost_price: e.target.value })}
                    placeholder="0"
                    className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Sotish Narxi</label>
                  <input
                    type="number"
                    required
                    value={materialForm.sell_price}
                    onChange={(e) => setMaterialForm({ ...materialForm, sell_price: e.target.value })}
                    placeholder="0"
                    className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md shadow-2xs cursor-pointer transition-all"
                >
                  {materialForm.id ? 'Yangilashni Saqlash' : 'Omborga Qo\'shish'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KATEGORIYA YARATISH */}
          {adminTab === 'category' && (
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1">Yangi Kategoriya Qo'shish</h3>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Kategoriya Nomi</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="masalan: AGT, HDF, MDF"
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md shadow-2xs">
                Kategoriyani Saqlash
              </button>
            </form>
          )}

          {/* TAB 3: FORMAT YARATISH */}
          {adminTab === 'format' && (
            <form onSubmit={handleCreateFormat} className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1">Kategoriyaga Format Biriktirish</h3>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Kategoriya</label>
                <select
                  required
                  value={selectedCatForFormat}
                  onChange={(e) => setSelectedCatForFormat(e.target.value)}
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2 bg-white"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Format (Kvadratura) Nomi</label>
                <input
                  type="text"
                  required
                  value={newFormatName}
                  onChange={(e) => setNewFormatName(e.target.value)}
                  placeholder="masalan: 4.57 kv, 5.03 kv"
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 rounded p-2"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md shadow-2xs">
                Formatni Biriktirish
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  )
}

export default WareHouseForm