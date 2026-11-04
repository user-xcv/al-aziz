-- Shared CRM appearance settings for the current no-login deployment.
-- Anyone who can access the public app can change this shared preference.
BEGIN;

CREATE TABLE IF NOT EXISTS public.crm_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  settings JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO public.crm_settings (id, settings)
VALUES (
  1,
  '{"theme":"light","backgroundColor":"#f8fafc","surfaceColor":"#ffffff","textColor":"#1e293b","accentColor":"#2563eb","density":"comfortable","sidebarCollapsed":false}'::JSONB
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crm_settings_read ON public.crm_settings;
CREATE POLICY crm_settings_read
  ON public.crm_settings
  FOR SELECT
  TO anon, authenticated
  USING (id = 1);

REVOKE ALL ON public.crm_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.crm_settings TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.crm_color_luminance(hex_color TEXT)
RETURNS NUMERIC
LANGUAGE SQL
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  WITH channels AS (
    SELECT
      get_byte(decode(substr(hex_color, 2, 2), 'hex'), 0) / 255.0 AS red,
      get_byte(decode(substr(hex_color, 4, 2), 'hex'), 0) / 255.0 AS green,
      get_byte(decode(substr(hex_color, 6, 2), 'hex'), 0) / 255.0 AS blue
  ),
  linearized AS (
    SELECT
      CASE WHEN red <= 0.04045 THEN red / 12.92 ELSE power((red + 0.055) / 1.055, 2.4) END AS red,
      CASE WHEN green <= 0.04045 THEN green / 12.92 ELSE power((green + 0.055) / 1.055, 2.4) END AS green,
      CASE WHEN blue <= 0.04045 THEN blue / 12.92 ELSE power((blue + 0.055) / 1.055, 2.4) END AS blue
    FROM channels
  )
  SELECT red * 0.2126 + green * 0.7152 + blue * 0.0722
  FROM linearized;
$$;

CREATE OR REPLACE FUNCTION public.crm_color_contrast_ratio(foreground TEXT, background TEXT)
RETURNS NUMERIC
LANGUAGE SQL
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  WITH colors AS (
    SELECT
      public.crm_color_luminance(foreground) AS foreground_luminance,
      public.crm_color_luminance(background) AS background_luminance
  )
  SELECT
    (GREATEST(foreground_luminance, background_luminance) + 0.05) /
    (LEAST(foreground_luminance, background_luminance) + 0.05)
  FROM colors;
$$;

REVOKE ALL ON FUNCTION public.crm_color_luminance(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.crm_color_contrast_ratio(TEXT, TEXT) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.save_crm_settings(settings_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  color_value TEXT;
  key_count INTEGER;
  white_color CONSTANT TEXT := '#ffffff';
BEGIN
  IF jsonb_typeof(settings_data) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Sozlamalar obyekti noto‘g‘ri';
  END IF;

  SELECT COUNT(*) INTO key_count
  FROM jsonb_object_keys(settings_data);

  IF key_count <> 7 OR EXISTS (
    SELECT 1
    FROM jsonb_object_keys(settings_data) AS keys(setting_key)
    WHERE setting_key NOT IN (
      'theme', 'backgroundColor', 'surfaceColor', 'textColor',
      'accentColor', 'density', 'sidebarCollapsed'
    )
  ) THEN
    RAISE EXCEPTION 'Sozlamalar tarkibi noto‘g‘ri';
  END IF;

  IF settings_data->>'theme' IS NULL
    OR settings_data->>'theme' NOT IN ('light', 'dark', 'custom')
    OR settings_data->>'density' IS NULL
    OR settings_data->>'density' NOT IN ('comfortable', 'compact')
    OR jsonb_typeof(settings_data->'sidebarCollapsed') IS DISTINCT FROM 'boolean' THEN
    RAISE EXCEPTION 'Sozlama qiymati noto‘g‘ri';
  END IF;

  FOREACH color_value IN ARRAY ARRAY[
    settings_data->>'backgroundColor',
    settings_data->>'surfaceColor',
    settings_data->>'textColor',
    settings_data->>'accentColor'
  ]
  LOOP
    IF color_value IS NULL OR color_value !~ '^#[0-9A-Fa-f]{6}$' THEN
      RAISE EXCEPTION 'Rang HEX formatida bo‘lishi kerak';
    END IF;
  END LOOP;

  IF public.crm_color_contrast_ratio(
      settings_data->>'textColor', settings_data->>'backgroundColor'
    ) < 4.5
    OR public.crm_color_contrast_ratio(
      settings_data->>'textColor', settings_data->>'surfaceColor'
    ) < 4.5
    OR public.crm_color_contrast_ratio(white_color, settings_data->>'accentColor') < 4.5 THEN
    RAISE EXCEPTION 'Matn va fon kontrasti kamida 4.5:1 bo‘lishi kerak';
  END IF;

  INSERT INTO public.crm_settings (id, settings, updated_at)
  VALUES (1, settings_data, NOW())
  ON CONFLICT (id) DO UPDATE
    SET settings = EXCLUDED.settings, updated_at = NOW();

  RETURN settings_data;
END;
$$;

REVOKE ALL ON FUNCTION public.save_crm_settings(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_crm_settings(JSONB) TO anon, authenticated;

COMMIT;
