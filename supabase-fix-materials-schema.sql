-- ============================================
-- MATERIALS JADVALINI SCHEMA GA MOSLASHTIRISH
-- ============================================

BEGIN;

-- 1. Eski 'format' field ni o'chirish (agar bo'lsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials'
    AND column_name = 'format'
  ) THEN
    ALTER TABLE materials DROP COLUMN format;
  END IF;
END $$;

-- 2. category_id ni NOT NULL qilish
ALTER TABLE materials ALTER COLUMN category_id SET NOT NULL;

-- 3. stock_count ni INTEGER va NOT NULL qilish
ALTER TABLE materials
  ALTER COLUMN stock_count TYPE INTEGER USING stock_count::INTEGER,
  ALTER COLUMN stock_count SET NOT NULL,
  ALTER COLUMN stock_count SET DEFAULT 0,
  ADD CONSTRAINT check_stock_count CHECK (stock_count >= 0);

-- 4. cost_price ni NOT NULL qilish
ALTER TABLE materials
  ALTER COLUMN cost_price SET NOT NULL,
  ALTER COLUMN cost_price SET DEFAULT 0,
  ADD CONSTRAINT check_cost_price CHECK (cost_price >= 0);

-- 5. sell_price ni NOT NULL qilish
ALTER TABLE materials
  ALTER COLUMN sell_price SET NOT NULL,
  ALTER COLUMN sell_price SET DEFAULT 0,
  ADD CONSTRAINT check_sell_price CHECK (sell_price >= 0);

-- 6. markup_price default 0 qo'shish (agar yo'q bo'lsa)
ALTER TABLE materials ALTER COLUMN markup_price SET DEFAULT 0;

COMMIT;

-- ============================================
-- TAYOR!
-- ============================================
