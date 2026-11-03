-- Repair only the policy names owned by this CRM setup on public.order_materials.
-- Run this only if the legacy policy still blocks the current setup script.
BEGIN;

ALTER TABLE public.order_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to order_materials"
  ON public.order_materials;
DROP POLICY IF EXISTS "order_materials_authenticated_access"
  ON public.order_materials;
DROP POLICY IF EXISTS "order_materials_crm_access"
  ON public.order_materials;

CREATE POLICY "order_materials_crm_access"
  ON public.order_materials
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.order_materials
  TO anon, authenticated;

DO $$
DECLARE
  sequence_name TEXT;
BEGIN
  sequence_name := pg_get_serial_sequence('public.order_materials', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO anon, authenticated', sequence_name);
  END IF;
END $$;

COMMIT;
