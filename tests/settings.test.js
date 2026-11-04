import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyThemePreset,
  DEFAULT_SETTINGS,
  getThemeVariables,
  THEME_PRESETS,
  validateSettings,
} from '../src/features/settings/settingsModel.js'
import {
  fetchSettingsAPI,
  saveSettingsAPI,
} from '../src/features/settings/settingsService.js'

const settings = { ...DEFAULT_SETTINGS }

test('default and preset settings have readable contrast and complete values', () => {
  assert.equal(validateSettings(DEFAULT_SETTINGS), '')
  assert.equal(validateSettings({ ...DEFAULT_SETTINGS, ...THEME_PRESETS.light }), '')
  assert.equal(validateSettings({ ...DEFAULT_SETTINGS, ...THEME_PRESETS.dark }), '')
  assert.deepEqual(applyThemePreset(settings, 'dark'), {
    ...DEFAULT_SETTINGS,
    ...THEME_PRESETS.dark,
  })
  assert.equal(applyThemePreset(settings, 'custom').theme, 'custom')
})

test('settings persistence requires an explicitly configured Supabase client', async () => {
  await assert.rejects(() => fetchSettingsAPI(), /Supabase mijoz sozlanmagan/)
  await assert.rejects(() => saveSettingsAPI(settings), /Supabase mijoz sozlanmagan/)
})

test('settings validation rejects malformed values and inaccessible color combinations', () => {
  assert.match(validateSettings({ ...settings, accentColor: 'blue' }), /HEX formatida/)
  assert.match(validateSettings({ ...settings, density: 'spacious' }), /zichligini/)
  assert.match(validateSettings({ ...settings, sidebarCollapsed: 'false' }), /Yon menyu/)
  assert.match(
    validateSettings({ ...settings, textColor: '#ffffff' }),
    /kontrasti kamida 4.5:1/,
  )
  assert.match(
    validateSettings({ ...settings, accentColor: '#60a5fa' }),
    /kontrasti kamida 4.5:1/,
  )
})

test('theme variables map the selected colors into existing Tailwind utilities', () => {
  const variables = getThemeVariables(settings)
  assert.equal(variables['--crm-background'], settings.backgroundColor)
  assert.equal(variables['--crm-surface'], settings.surfaceColor)
  assert.equal(variables['--crm-text'], settings.textColor)
  assert.equal(variables['--color-white'], settings.surfaceColor)
  assert.equal(variables['--color-blue-500'], settings.accentColor)
  assert.match(variables['--color-slate-200'], /color-mix/)
})

test('settings fetch returns the singleton and surfaces database or missing-migration errors', async () => {
  let query
  const client = {
    from(table) {
      query = { table }
      return {
        select(columns) {
          query.columns = columns
          return {
            eq(column, value) {
              query.filter = [column, value]
              return {
                maybeSingle: async () => ({ data: { settings }, error: null }),
              }
            },
          }
        },
      }
    },
  }
  assert.deepEqual(await fetchSettingsAPI(client), settings)
  assert.deepEqual(query, {
    table: 'crm_settings',
    columns: 'settings',
    filter: ['id', 1],
  })
  await assert.rejects(() => fetchSettingsAPI({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: { message: 'permission denied' } }),
        }),
      }),
    }),
  }), /permission denied/)
  await assert.rejects(() => fetchSettingsAPI({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { code: '42P01', message: 'relation crm_settings does not exist' },
          }),
        }),
      }),
    }),
  }), /supabase-app-settings\.sql/)
  await assert.rejects(() => fetchSettingsAPI({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }), /migratsiyasini/)
})

test('settings save validates locally, calls only its RPC, and surfaces write failures', async () => {
  let call
  const client = {
    async rpc(name, args) {
      call = { name, args }
      return { data: settings, error: null }
    },
  }
  assert.deepEqual(await saveSettingsAPI(settings, client), settings)
  assert.deepEqual(call, {
    name: 'save_crm_settings',
    args: { settings_data: settings },
  })
  await assert.rejects(() => saveSettingsAPI({ ...settings, density: 'wide' }, client), /zichligini/)
  await assert.rejects(() => saveSettingsAPI(settings, {
    async rpc() {
      return { data: null, error: { message: 'write denied' } }
    },
  }), /write denied/)
  await assert.rejects(() => saveSettingsAPI(settings, {
    async rpc() {
      return { data: null, error: null }
    },
  }), /tasdiqlamadi/)
})
