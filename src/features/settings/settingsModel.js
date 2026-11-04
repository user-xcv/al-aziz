export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'light',
  backgroundColor: '#f8fafc',
  surfaceColor: '#ffffff',
  textColor: '#1e293b',
  accentColor: '#2563eb',
  density: 'comfortable',
  sidebarCollapsed: false,
})

export const THEME_PRESETS = Object.freeze({
  light: {
    theme: 'light',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#1e293b',
    accentColor: '#2563eb',
  },
  dark: {
    theme: 'dark',
    backgroundColor: '#111827',
    surfaceColor: '#1f2937',
    textColor: '#f9fafb',
    accentColor: '#2563eb',
  },
})

const settingKeys = Object.keys(DEFAULT_SETTINGS)
const colorKeys = ['backgroundColor', 'surfaceColor', 'textColor', 'accentColor']

const getLuminance = (hexColor) => {
  const channels = hexColor.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16) / 255)
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

const hasReadableContrast = (foreground, background) => {
  const values = [getLuminance(foreground), getLuminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05) >= 4.5
}

export const validateSettings = (settings) => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return 'Sozlamalar formati noto‘g‘ri.'
  }
  if (settingKeys.some((key) => !(key in settings)) || Object.keys(settings).length !== settingKeys.length) {
    return 'Sozlamalar tarkibi to‘liq emas.'
  }
  if (!['light', 'dark', 'custom'].includes(settings.theme)) {
    return 'Rang mavzusini to‘g‘ri tanlang.'
  }
  if (!['comfortable', 'compact'].includes(settings.density)) {
    return 'Ko‘rinish zichligini to‘g‘ri tanlang.'
  }
  if (typeof settings.sidebarCollapsed !== 'boolean') {
    return 'Yon menyu holati noto‘g‘ri.'
  }
  if (colorKeys.some((key) => typeof settings[key] !== 'string' || !/^#[\da-f]{6}$/i.test(settings[key]))) {
    return 'Barcha ranglar 6 belgili HEX formatida bo‘lishi kerak.'
  }
  if (
    !hasReadableContrast(settings.textColor, settings.backgroundColor) ||
    !hasReadableContrast(settings.textColor, settings.surfaceColor) ||
    !hasReadableContrast('#ffffff', settings.accentColor)
  ) {
    return 'Matn va fon kontrasti kamida 4.5:1 bo‘lishi kerak. Ranglarni o‘zgartiring.'
  }
  return ''
}

const mix = (foreground, background, foregroundPercent) =>
  `color-mix(in srgb, ${foreground} ${foregroundPercent}%, ${background})`

export const getThemeVariables = (settings) => {
  const { backgroundColor: background, surfaceColor: surface, textColor: text, accentColor: accent } = settings
  const slate = {
    50: background,
    100: mix(text, surface, 6),
    200: mix(text, surface, 13),
    300: mix(text, surface, 28),
    400: mix(text, surface, 44),
    500: mix(text, surface, 58),
    600: mix(text, surface, 72),
    700: mix(text, surface, 84),
    800: text,
    900: mix(text, background, 8),
    950: mix(text, background, 4),
  }
  const blue = {
    50: mix(accent, surface, 5),
    100: mix(accent, surface, 10),
    200: mix(accent, surface, 22),
    300: mix(accent, surface, 38),
    400: mix(accent, surface, 62),
    500: accent,
    600: mix('#000000', accent, 12),
    700: mix('#000000', accent, 25),
    800: mix('#000000', accent, 40),
    900: mix('#000000', accent, 56),
    950: mix('#000000', accent, 70),
  }
  const variables = {
    '--crm-background': background,
    '--crm-surface': surface,
    '--crm-text': text,
    '--crm-accent': accent,
    '--color-white': surface,
  }
  for (const [shade, color] of Object.entries(slate)) {
    variables[`--color-slate-${shade}`] = color
  }
  for (const [shade, color] of Object.entries(blue)) {
    variables[`--color-blue-${shade}`] = color
  }
  return variables
}

export const applyThemePreset = (settings, presetName) => {
  if (presetName === 'custom') return { ...settings, theme: 'custom' }
  if (!THEME_PRESETS[presetName]) return settings
  return { ...settings, ...THEME_PRESETS[presetName] }
}
