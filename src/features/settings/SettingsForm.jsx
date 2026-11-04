import React, { useState } from 'react'
import { Check, LayoutDashboard, LoaderCircle, Palette, RotateCcw, Save } from 'lucide-react'
import {
  applyThemePreset,
  DEFAULT_SETTINGS,
  THEME_PRESETS,
  validateSettings,
} from './settingsModel'

const colorOptions = [
  { key: 'backgroundColor', label: 'Sahifa foni', description: 'Sahifa va ishchi maydon rangi' },
  { key: 'surfaceColor', label: 'Kartalar foni', description: 'Formalar, panellar va kartalar rangi' },
  { key: 'textColor', label: 'Matn rangi', description: 'Asosiy yozuvlar rangi' },
  { key: 'accentColor', label: 'Asosiy rang', description: 'Navigatsiya va muhim tugmalar rangi' },
]

const SettingsForm = ({
  settings,
  settingsReady,
  onPreview,
  onSave,
}) => {
  const [draftState, setDraftState] = useState({
    base: settings || DEFAULT_SETTINGS,
    draft: settings || DEFAULT_SETTINGS,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const draft = JSON.stringify(draftState.base) === JSON.stringify(settings)
    ? draftState.draft
    : { ...draftState.draft, sidebarCollapsed: settings?.sidebarCollapsed ?? false }

  const updateDraft = (nextSettings) => {
    setDraftState({ base: settings, draft: nextSettings })
    setSaved(false)
    setError('')
    onPreview(nextSettings)
  }

  const validationError = validateSettings(draft)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const handleSave = async (event) => {
    event.preventDefault()
    if (!isDirty || validationError || !settingsReady || saving) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await onSave(draft)
      setSaved(true)
    } catch (saveError) {
      setError(`Sozlamalar saqlanmadi: ${saveError.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <Palette className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Ranglar va mavzu</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tanlovlar barcha bo‘limlarga qo‘llanadi va CRM sozlamalarida umumiy saqlanadi.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: 'light', title: 'Yorug‘', preview: 'bg-slate-50' },
            { id: 'dark', title: 'Qorong‘i', preview: 'bg-slate-800' },
            { id: 'custom', title: 'Maxsus ranglar', preview: 'bg-gradient-to-br from-blue-500 to-slate-800' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={draft.theme === preset.id}
              disabled={!settingsReady}
              onClick={() => updateDraft(
                preset.id === 'custom'
                  ? applyThemePreset(draft, 'custom')
                  : { ...draft, ...THEME_PRESETS[preset.id] },
              )}
              className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                draft.theme === preset.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`h-8 w-8 shrink-0 rounded-md border border-slate-200 ${preset.preview}`} aria-hidden="true" />
              <span className="flex-1">{preset.title}</span>
              {draft.theme === preset.id && <Check className="h-4 w-4 text-blue-700" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {draft.theme === 'custom' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {colorOptions.map(({ key, label, description }) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <span>
                  <span className="block text-xs font-semibold text-slate-800">{label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">{description}</span>
                </span>
                <input
                  type="color"
                  aria-label={label}
                  disabled={!settingsReady}
                  value={draft[key]}
                  onChange={(event) => updateDraft({ ...draft, [key]: event.target.value, theme: 'custom' })}
                  className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                />
              </label>
            ))}
          </div>
        )}
        {validationError && (
          <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {validationError}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Ish maydoni</h2>
            <p className="mt-1 text-xs text-slate-500">Tartib va navigatsiya ko‘rinishini moslang.</p>
          </div>
        </div>

        <fieldset disabled={!settingsReady} className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Tarkib zichligi</legend>
          {[
            { id: 'comfortable', title: 'Qulay', description: 'Kengroq oraliqlar va o‘qish uchun qulay tartib' },
            { id: 'compact', title: 'Ixcham', description: 'Kamroq oraliq, ko‘proq ma’lumot ko‘rinadi' },
          ].map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                draft.density === option.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="density"
                value={option.id}
                checked={draft.density === option.id}
                onChange={() => updateDraft({ ...draft, density: option.id })}
                className="mt-0.5 accent-blue-700"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-800">{option.title}</span>
                <span className="mt-1 block text-[11px] text-slate-500">{option.description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
          <span>
            <span className="block text-xs font-semibold text-slate-800">Yon menyuni yig‘iq ochish</span>
            <span className="mt-1 block text-[11px] text-slate-500">Boshlang‘ich ko‘rinishda menyu ikonkalari ko‘rinadi.</span>
          </span>
          <input
            type="checkbox"
            aria-label="Yon menyuni yig‘iq ochish"
            disabled={!settingsReady}
            checked={draft.sidebarCollapsed}
            onChange={(event) => updateDraft({ ...draft, sidebarCollapsed: event.target.checked })}
            className="h-4 w-4 accent-blue-700"
          />
        </label>
      </section>

      {(error || saved) && (
        <p role={error ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-xs ${
          error ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {error || 'Sozlamalar Supabase’da saqlandi.'}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={!isDirty || !settingsReady || saving}
          onClick={() => updateDraft(settings)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={!isDirty || Boolean(validationError) || !settingsReady || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
    </form>
  )
}

export default SettingsForm
