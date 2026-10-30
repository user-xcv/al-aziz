import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  ChevronRight,
  Edit2,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react'
import { fetchWareHouseData } from './wareHouseThunk'
import {
  addCategoryAPI,
  addFormatAPI,
  addMaterialAPI,
  deleteMaterialAPI,
  matchesFormat,
  updateMaterialAPI,
} from './wareHouseService'

const emptyMaterial = {
  id: null,
  name: '',
  stock_count: '',
  cost_price: '',
  sell_price: '',
}

const WareHouseForm = () => {
  const dispatch = useDispatch()
  const { materials = [], categories = [], isLoading } = useSelector(
    (state) => state.wareHouse || {}
  )

  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentFormat, setCurrentFormat] = useState(null)
  const [newCatName, setNewCatName] = useState('')
  const [newFormatName, setNewFormatName] = useState('')
  const [materialForm, setMaterialForm] = useState(emptyMaterial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    dispatch(fetchWareHouseData())
  }, [dispatch])

  const liveCategory =
    categories.find((c) => String(c.id) === String(currentCategory?.id)) || currentCategory
  const liveFormat =
    (liveCategory?.formats || []).find((f) => String(f.id) === String(currentFormat?.id)) ||
    currentFormat

  const reload = async () => {
    await dispatch(fetchWareHouseData())
  }

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2500)
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setSaving(true)
    try {
      await addCategoryAPI(newCatName.trim())
      setNewCatName('')
      await reload()
      showMessage('Kategoriya qo‘shildi')
    } catch (err) {
      showMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFormat = async (e) => {
    e.preventDefault()
    if (!liveCategory || !newFormatName.trim()) return
    setSaving(true)
    try {
      await addFormatAPI(Number(liveCategory.id), newFormatName.trim())
      setNewFormatName('')
      await reload()
      showMessage('Format qo‘shildi')
    } catch (err) {
      showMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMaterial = async (e) => {
    e.preventDefault()
    if (!liveCategory || !liveFormat) return
    setSaving(true)
    try {
      const payload = {
        category_id: Number(liveCategory.id),
        format_id: liveFormat.id,
        name: materialForm.name.trim(),
        stock_count: Number(materialForm.stock_count),
        cost_price: Number(materialForm.cost_price),
        sell_price: Number(materialForm.sell_price),
      }
      if (materialForm.id) {
        await updateMaterialAPI({ id: materialForm.id, updatedFields: payload })
        showMessage('Material yangilandi')
      } else {
        await addMaterialAPI(payload)
        showMessage('Material omborga qo‘shildi')
      }
      setMaterialForm(emptyMaterial)
      await reload()
    } catch (err) {
      showMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Materialni o'chirasizmi?")) return
    await deleteMaterialAPI(id)
    await reload()
  }

  const formatMaterials = liveCategory && liveFormat
    ? materials.filter(
        (m) =>
          String(m.category_id) === String(liveCategory.id) && matchesFormat(m, liveFormat)
      )
    : []

  const stockInCategory = (cat) =>
    materials
      .filter((m) => String(m.category_id) === String(cat.id))
      .reduce((sum, item) => sum + Number(item.stock_count || 0), 0)

  const stockInFormat = (fmt) =>
    materials
      .filter(
        (m) =>
          String(m.category_id) === String(liveCategory?.id) && matchesFormat(m, fmt)
      )
      .reduce((sum, item) => sum + Number(item.stock_count || 0), 0)

  return (
    <div className="space-y-4 font-sans text-slate-800">
      <div className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium">
          <button
            onClick={() => {
              setCurrentCategory(null)
              setCurrentFormat(null)
              setMaterialForm(emptyMaterial)
            }}
            className={`flex items-center gap-1 hover:text-blue-600 ${
              !liveCategory ? 'font-bold text-blue-600' : 'text-slate-500'
            }`}
          >
            <Folder className="w-4 h-4" /> Ombor
          </button>

          {liveCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button
                onClick={() => {
                  setCurrentFormat(null)
                  setMaterialForm(emptyMaterial)
                }}
                className={`flex items-center gap-1 hover:text-blue-600 ${
                  !liveFormat ? 'font-bold text-blue-600' : 'text-slate-500'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-amber-500" /> {liveCategory.name}
              </button>
            </>
          )}

          {liveFormat && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-blue-600 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-500" /> {liveFormat.name}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {message && <span className="text-emerald-600 font-semibold">{message}</span>}
          {(liveCategory || liveFormat) && (
            <button
              onClick={() => {
                if (liveFormat) {
                  setCurrentFormat(null)
                  setMaterialForm(emptyMaterial)
                } else setCurrentCategory(null)
              }}
              className="flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Orqaga
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/80 p-4">
          <div className="pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {!liveCategory
                ? 'Kategoriyalar'
                : !liveFormat
                  ? `${liveCategory.name} formatlari`
                  : `${liveCategory.name} · ${liveFormat.name}`}
            </h2>
          </div>

          {isLoading && <p className="text-xs text-slate-400">Yuklanmoqda...</p>}

          {!liveCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCurrentCategory(cat)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-6 h-6 text-amber-500 fill-amber-100" />
                    <div>
                      <h3 className="text-xs font-bold">{cat.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(cat.formats || []).length} ta format
                      </p>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {stockInCategory(cat)} dona
                  </span>
                </button>
              ))}
            </div>
          )}

          {liveCategory && !liveFormat && (
            <div className="grid grid-cols-2 gap-2">
              {(liveCategory.formats || []).map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setCurrentFormat(fmt)}
                  className="p-3 rounded-md border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">{fmt.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                    {stockInFormat(fmt)} dona
                  </span>
                </button>
              ))}
            </div>
          )}

          {liveCategory && liveFormat && (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {formatMaterials.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">
                  Bu formatda hali material yo‘q. O‘ng tarafdan qo‘shing.
                </p>
              ) : (
                formatMaterials.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-md border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          Olish: {Number(item.cost_price).toLocaleString('uz-UZ')} so‘m · Sotish:{' '}
                          <b className="text-blue-600">
                            {Number(item.sell_price).toLocaleString('uz-UZ')} so‘m
                          </b>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{item.stock_count} dona</span>
                      <button
                        type="button"
                        onClick={() =>
                          setMaterialForm({
                            id: item.id,
                            name: item.name,
                            stock_count: item.stock_count,
                            cost_price: item.cost_price,
                            sell_price: item.sell_price,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/80 p-4 space-y-3 text-xs">
          {!liveCategory && (
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <h3 className="font-bold border-b border-slate-100 pb-1">Yangi kategoriya</h3>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="masalan: Kromka"
                className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
              />
              <button
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md"
              >
                Saqlash
              </button>
            </form>
          )}

          {liveCategory && !liveFormat && (
            <form onSubmit={handleCreateFormat} className="space-y-3">
              <h3 className="font-bold border-b border-slate-100 pb-1">
                {liveCategory.name} ga format qo‘shish
              </h3>
              <input
                value={newFormatName}
                onChange={(e) => setNewFormatName(e.target.value)}
                placeholder="masalan: 4.57 kv"
                className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
              />
              <button
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md"
              >
                Formatni qo‘shish
              </button>
            </form>
          )}

          {liveCategory && liveFormat && (
            <form onSubmit={handleSaveMaterial} className="space-y-3">
              <h3 className="font-bold border-b border-slate-100 pb-1 flex items-center gap-1">
                <Plus className="w-4 h-4 text-blue-600" />
                {materialForm.id ? 'Materialni tahrirlash' : 'List qo‘shish'}
              </h3>
              <p className="text-slate-500">
                {liveCategory.name} → {liveFormat.name}
              </p>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nomi / rangi</label>
                <input
                  required
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  placeholder="masalan: Oq Premier"
                  className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Soni</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={materialForm.stock_count}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, stock_count: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Olish</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={materialForm.cost_price}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, cost_price: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Sotish</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={materialForm.sell_price}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, sell_price: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded p-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md"
              >
                {materialForm.id ? 'Yangilash' : 'Omborga qo‘shish'}
              </button>
              {materialForm.id && (
                <button
                  type="button"
                  onClick={() => setMaterialForm(emptyMaterial)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-2 rounded-md"
                >
                  Bekor qilish
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default WareHouseForm
