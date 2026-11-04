import { validateSettings } from './settingsModel.js'

const requireClient = (client) => {
  if (!client) throw new Error('Supabase mijoz sozlanmagan.')
  return client
}

export const fetchSettingsAPI = async (client) => {
  const { data, error } = await requireClient(client)
    .from('crm_settings')
    .select('settings')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      throw new Error('crm_settings jadvali topilmadi. Supabase SQL Editor’da supabase-app-settings.sql migratsiyasini ishga tushiring.')
    }
    throw new Error(error.message)
  }
  if (!data?.settings) {
    throw new Error('CRM sozlamalari topilmadi. Supabase sozlamalar migratsiyasini ishga tushiring.')
  }
  const validationError = validateSettings(data.settings)
  if (validationError) throw new Error(validationError)
  return data.settings
}

export const saveSettingsAPI = async (settings, client) => {
  const validationError = validateSettings(settings)
  if (validationError) throw new Error(validationError)

  const { data, error } = await requireClient(client).rpc('save_crm_settings', {
    settings_data: settings,
  })

  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('Sozlamalarni saqlash funksiyasi topilmadi. supabase-app-settings.sql migratsiyasini ishga tushiring.')
    }
    throw new Error(error.message)
  }
  const savedSettings = data?.save_crm_settings ?? data
  if (!savedSettings || validateSettings(savedSettings)) {
    throw new Error('Supabase saqlangan sozlamalarni tasdiqlamadi.')
  }
  return savedSettings
}
