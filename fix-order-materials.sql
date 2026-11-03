-- ============================================
-- ORDER_MATERIALS JADVALINI Tuzatish
-- ============================================

-- Agar jadval allaqachon bo'lsa, format_id va format_name ustunlarini qo'shish
DO $$
BEGIN
  -- format_id ustunini qo'shish (agar yo'q bo'lsa)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'order_materials'
    AND column_name = 'format_id'
  ) THEN
    ALTER TABLE order_materials ADD COLUMN format_id BIGINT;
  END IF;

  -- format_name ustunini qo'shish (agar yo'q bo'lsa)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'order_materials'
    AND column_name = 'format_name'
  ) THEN
    ALTER TABLE order_materials ADD COLUMN format_name VARCHAR(255);
  END IF;
END $$;

-- TAYOR!
