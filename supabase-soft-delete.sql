-- ============================================
-- SOFT DELETE VA REFERENTIAL INTEGRITY MIGRATSIYASI
-- Mebel sexi CRM tizimi uchun
-- ============================================
-- Ushbu fayl quyidagi vazifalarni bajaradi:
-- 1. clients, materials, formats jadvallarga deleted_at ustunini qo'shadi
-- 2. Foreign Key larni ON DELETE SET NULL ga o'tkazadi
-- 3. Soft-delete triggerlarini o'rnatadi
-- 4. Tarixiy hisob-kitob (overallmoney, payoff) saqlanishi ta'minlanadi

BEGIN;

-- -------------------------------------------------
-- A. clients jadvali
-- -------------------------------------------------
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.expenses
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.payments
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.inventory_sales
  ALTER COLUMN client_id DROP NOT NULL;

-- -------------------------------------------------
-- B. materials jadvali
-- -------------------------------------------------
ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.order_materials
  ALTER COLUMN material_id DROP NOT NULL;

ALTER TABLE public.inventory_sales
  ALTER COLUMN material_id DROP NOT NULL;

-- -------------------------------------------------
-- C. formats jadvali
-- -------------------------------------------------
ALTER TABLE public.formats
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- -------------------------------------------------
-- D. Foreign Key larni yangilash (ON DELETE SET NULL)
-- -------------------------------------------------

-- expenses.client_id -> clients(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'expenses_client_id_fkey'
      AND table_name = 'expenses'
  ) THEN
    ALTER TABLE public.expenses DROP CONSTRAINT expenses_client_id_fkey;
  END IF;
END $$;
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- payments.client_id -> clients(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_client_id_fkey'
      AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments DROP CONSTRAINT payments_client_id_fkey;
  END IF;
END $$;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- inventory_sales.client_id -> clients(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'inventory_sales_client_id_fkey'
      AND table_name = 'inventory_sales'
  ) THEN
    ALTER TABLE public.inventory_sales DROP CONSTRAINT inventory_sales_client_id_fkey;
  END IF;
END $$;
ALTER TABLE public.inventory_sales
  ADD CONSTRAINT inventory_sales_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


-- -------------------------------------------------
-- E. Soft-delete trigger funksiyalari
-- -------------------------------------------------

-- Mijoz "o'chirilganda" (deleted_at sozlaganda) bog'liq jadvallarda client_id NULL bo'ladi
CREATE OR REPLACE FUNCTION public.soft_delete_clients()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.expenses
      SET client_id = NULL
      WHERE client_id = NEW.id;

    UPDATE public.payments
      SET client_id = NULL
      WHERE client_id = NEW.id;

    UPDATE public.inventory_sales
      SET client_id = NULL
      WHERE client_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Material "o'chirilganda" order_materials va inventory_sales da material_id NULL bo'ladi
CREATE OR REPLACE FUNCTION public.soft_delete_materials()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.order_materials
      SET material_id = NULL
      WHERE material_id = NEW.id;

    UPDATE public.inventory_sales
      SET material_id = NULL
      WHERE material_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Format "o'chirilganda" materials da format_id NULL bo'ladi
CREATE OR REPLACE FUNCTION public.soft_delete_formats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.materials
      SET format_id = NULL
      WHERE format_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- -------------------------------------------------
-- F. Triggerlarni o'rnatish
-- -------------------------------------------------
DROP TRIGGER IF EXISTS trg_soft_delete_clients ON public.clients;
CREATE TRIGGER trg_soft_delete_clients
  BEFORE UPDATE OF deleted_at ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_clients();

DROP TRIGGER IF EXISTS trg_soft_delete_materials ON public.materials;
CREATE TRIGGER trg_soft_delete_materials
  BEFORE UPDATE OF deleted_at ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_materials();

DROP TRIGGER IF EXISTS trg_soft_delete_formats ON public.formats;
CREATE TRIGGER trg_soft_delete_formats
  BEFORE UPDATE OF deleted_at ON public.formats
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_formats();

-- -------------------------------------------------
-- G. Indexlar (tez qidiruv uchun)
-- -------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_materials_deleted_at ON public.materials(deleted_at);
CREATE INDEX IF NOT EXISTS idx_formats_deleted_at ON public.formats(deleted_at);

COMMIT;
-- order_materials.material_id -> materials(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_materials_material_id_fkey'
      AND table_name = 'order_materials'
  ) THEN
    ALTER TABLE public.order_materials DROP CONSTRAINT order_materials_material_id_fkey;
  END IF;
END $$;
ALTER TABLE public.order_materials
  ADD CONSTRAINT order_materials_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE SET NULL;

-- inventory_sales.material_id -> materials(id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'inventory_sales_material_id_fkey'
      AND table_name = 'inventory_sales'
  ) THEN
    ALTER TABLE public.inventory_sales DROP CONSTRAINT inventory_sales_material_id_fkey;
  END IF;
END $$;
ALTER TABLE public.inventory_sales
  ADD CONSTRAINT inventory_sales_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE SET NULL;