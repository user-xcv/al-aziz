import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const setupSql = readFileSync(new URL('../supabase-setup.sql', import.meta.url), 'utf8')
const updatedAtRepairSql = readFileSync(
  new URL('../supabase-fix-updated-at-trigger.sql', import.meta.url),
  'utf8',
)
const repairSql = readFileSync(
  new URL('../supabase-repair-order-materials-policy.sql', import.meta.url),
  'utf8',
)
const inventorySalesMigrationSql = readFileSync(
  new URL('../supabase-material-sales.sql', import.meta.url),
  'utf8',
)
const appSettingsMigrationSql = readFileSync(
  new URL('../supabase-app-settings.sql', import.meta.url),
  'utf8',
)
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const layoutSource = readFileSync(
  new URL('../src/layout/mainLayout.jsx', import.meta.url),
  'utf8',
)
const paymentsFormSource = readFileSync(
  new URL('../src/features/payments/PaymentsForm.jsx', import.meta.url),
  'utf8',
)
const clientsFormSource = readFileSync(
  new URL('../src/features/clients/ClientsForm.jsx', import.meta.url),
  'utf8',
)

test('Supabase setup executes as one transaction for safe reruns', () => {
  assert.match(setupSql, /(?:^|\r?\n)BEGIN;/)
  assert.match(setupSql, /COMMIT;\s*$/)
})

test('setup replaces only the named legacy and CRM-owned RLS policies', () => {
  assert.match(setupSql, /DROP POLICY IF EXISTS %I ON public\.%I/)
  assert.match(setupSql, /'Allow all access to ' \|\| table_name/)
  assert.match(setupSql, /table_name \|\| '_authenticated_access'/)
  assert.match(setupSql, /table_name \|\| '_crm_access'/)
  assert.match(
    setupSql,
    /DROP POLICY IF EXISTS %I ON public\.%I[\s\S]*?DROP POLICY IF EXISTS %I ON public\.%I[\s\S]*?CREATE POLICY %I ON public\.%I FOR ALL TO anon, authenticated USING \(true\) WITH CHECK \(true\)/,
  )
  assert.match(setupSql, /GRANT EXECUTE ON FUNCTION create_order_with_materials\(JSONB\) TO anon, authenticated/)
  assert.match(setupSql, /GRANT EXECUTE ON FUNCTION delete_order_with_restock\(BIGINT\) TO anon, authenticated/)
  assert.match(setupSql, /GRANT EXECUTE ON FUNCTION create_inventory_sale\(JSONB\) TO anon, authenticated/)
  assert.match(setupSql, /GRANT EXECUTE ON FUNCTION record_inventory_sale_payment\(BIGINT, NUMERIC, TEXT, TEXT\) TO anon, authenticated/)
  assert.match(setupSql, /REVOKE INSERT, UPDATE, DELETE ON inventory_sales, inventory_sale_payments FROM anon, authenticated/)

  for (const table of [
    'categories',
    'formats',
    'materials',
    'clients',
    'expenses',
    'order_materials',
    'payments',
    'inventory_sales',
    'inventory_sale_payments',
  ]) {
    assert.ok(setupSql.includes(`'${table}'`), `RLS migration includes ${table}`)
  }
})

test('direct inventory sales snapshot prices and update stock atomically', () => {
  assert.match(setupSql, /CREATE TABLE IF NOT EXISTS inventory_sales/)
  assert.match(setupSql, /CREATE TABLE IF NOT EXISTS inventory_sale_payments/)
  assert.match(setupSql, /CREATE OR REPLACE FUNCTION create_inventory_sale\(sale_data JSONB\)[\s\S]*?FOR UPDATE/)
  assert.match(setupSql, /sale_total_value := material_row\.sell_price \* quantity_value/)
  assert.match(setupSql, /total_cost_value := material_row\.cost_price \* quantity_value/)
  assert.match(setupSql, /UPDATE materials[\s\S]*?SET stock_count = stock_count - quantity_value/)
  assert.match(setupSql, /inventory_sales[\s\S]*?unit_cost,[\s\S]*?unit_sale_price,[\s\S]*?total_cost,[\s\S]*?sale_total,[\s\S]*?profit/)
  assert.match(setupSql, /validate_inventory_sale_payment_trigger/)
  assert.match(setupSql, /already_paid \+ NEW\.amount > sale_total_value/)
  assert.match(setupSql, /SECURITY DEFINER\s+SET search_path = ''/)
})

test('standalone sales migration is transactional, repeatable and avoids historical rewrites', () => {
  assert.match(inventorySalesMigrationSql, /BEGIN;[\s\S]*COMMIT;\s*$/)
  assert.match(inventorySalesMigrationSql, /CREATE TABLE IF NOT EXISTS public\.inventory_sales/)
  assert.match(inventorySalesMigrationSql, /CREATE TABLE IF NOT EXISTS public\.inventory_sale_payments/)
  assert.match(inventorySalesMigrationSql, /CREATE OR REPLACE FUNCTION public\.create_inventory_sale\(sale_data JSONB\)/)
  assert.match(inventorySalesMigrationSql, /CREATE OR REPLACE FUNCTION public\.record_inventory_sale_payment/)
  assert.match(inventorySalesMigrationSql, /UPDATE public\.materials[\s\S]*?SET stock_count = stock_count - quantity_value/)
  assert.match(inventorySalesMigrationSql, /REVOKE ALL ON FUNCTION public\.create_inventory_sale\(JSONB\) FROM PUBLIC/)
  assert.match(inventorySalesMigrationSql, /CREATE POLICY inventory_sales_crm_access[\s\S]*FOR SELECT/)
  assert.match(inventorySalesMigrationSql, /REVOKE ALL ON public\.inventory_sales, public\.inventory_sale_payments/)
  assert.doesNotMatch(
    inventorySalesMigrationSql,
    /\b(UPDATE|DELETE|TRUNCATE)\s+(public\.)?(clients|categories|formats|expenses|order_materials|payments)\b/i,
  )
})

test('shared settings migration is repeatable, read-only to clients, and validates RPC writes', () => {
  const luminanceFunction = appSettingsMigrationSql.indexOf('CREATE OR REPLACE FUNCTION public.crm_color_luminance')
  const contrastFunction = appSettingsMigrationSql.indexOf('CREATE OR REPLACE FUNCTION public.crm_color_contrast_ratio')
  const saveFunction = appSettingsMigrationSql.indexOf('CREATE OR REPLACE FUNCTION public.save_crm_settings')

  assert.match(appSettingsMigrationSql, /BEGIN;[\s\S]*COMMIT;\s*$/)
  assert.ok(luminanceFunction >= 0 && luminanceFunction < contrastFunction)
  assert.ok(contrastFunction < saveFunction)
  assert.match(appSettingsMigrationSql, /CREATE TABLE IF NOT EXISTS public\.crm_settings/)
  assert.match(appSettingsMigrationSql, /ON CONFLICT \(id\) DO NOTHING/)
  assert.match(appSettingsMigrationSql, /ALTER TABLE public\.crm_settings ENABLE ROW LEVEL SECURITY/)
  assert.match(appSettingsMigrationSql, /FOR SELECT\s+TO anon, authenticated/)
  assert.match(appSettingsMigrationSql, /REVOKE ALL ON public\.crm_settings FROM PUBLIC, anon, authenticated/)
  assert.match(appSettingsMigrationSql, /GRANT SELECT ON public\.crm_settings TO anon, authenticated/)
  assert.match(appSettingsMigrationSql, /SECURITY DEFINER\s+SET search_path = ''/)
  assert.match(appSettingsMigrationSql, /jsonb_object_keys\(settings_data\)/)
  assert.ok(appSettingsMigrationSql.includes("color_value !~ '^#[0-9A-Fa-f]{6}$'"))
  assert.match(appSettingsMigrationSql, /get_byte\(decode\(substr\(hex_color, 2, 2\), 'hex'\), 0\)/)
  assert.match(appSettingsMigrationSql, /GRANT EXECUTE ON FUNCTION public\.save_crm_settings\(JSONB\) TO anon, authenticated/)
  assert.doesNotMatch(appSettingsMigrationSql, /\b(UPDATE|DELETE|TRUNCATE)\s+(public\.)?(clients|categories|formats|materials|expenses|payments)\b/i)
})

test('material-sale receipts and client history are wired into their existing screens', () => {
  assert.match(paymentsFormSource, /inventory_sale_payments/)
  assert.match(paymentsFormSource, /Material sotuvi #/)
  assert.match(paymentsFormSource, /inventorySalePayments\.reduce/)
  assert.match(clientsFormSource, /getCustomerBusinessHistory/)
  assert.match(clientsFormSource, /Mijoz tarixi/)
})

test('setup drops its named triggers before recreating them', () => {
  for (const trigger of [
    'validate_payment_order_trigger',
    'sync_order_payments_total_trigger',
    'update_categories_updated_at',
    'update_formats_updated_at',
    'update_materials_updated_at',
    'update_clients_updated_at',
  ]) {
    const drop = setupSql.indexOf(`DROP TRIGGER IF EXISTS ${trigger}`)
    const create = setupSql.indexOf(`CREATE TRIGGER ${trigger}`)
    assert.notEqual(drop, -1, `setup drops ${trigger}`)
    assert.ok(create > drop, `setup recreates ${trigger} after dropping it`)
  }
})

test('setup migrates markup snapshots and applies the new profit formula', () => {
  assert.match(setupSql, /ALTER TABLE materials ADD COLUMN IF NOT EXISTS markup_price/)
  assert.match(setupSql, /ALTER TABLE order_materials ADD COLUMN IF NOT EXISTS unit_markup/)
  assert.match(setupSql, /ALTER TABLE order_materials ADD COLUMN IF NOT EXISTS total_markup/)
  assert.match(setupSql, /order_total_value := service_revenue \+ material_revenue/)
  assert.match(setupSql, /order_total_value - material_costs - operating_costs/)
  assert.match(setupSql, /operating_costs :=[\s\S]*?'masterfee'[\s\S]*?'spares'[\s\S]*?'anotherexpenses'/)
  assert.match(setupSql, /WHERE unit_markup IS DISTINCT FROM/)
  assert.match(setupSql, /WHERE payoff IS DISTINCT FROM/)
})

test('setup enforces that a material format belongs to the same category', () => {
  assert.match(setupSql, /CREATE UNIQUE INDEX IF NOT EXISTS idx_formats_category_id_id/)
  assert.match(
    setupSql,
    /UPDATE materials AS material[\s\S]*?SET format_id = NULL[\s\S]*?NOT EXISTS[\s\S]*?format\.category_id = material\.category_id/,
  )
  assert.match(setupSql, /DROP CONSTRAINT IF EXISTS materials_category_format_fkey/)
  assert.match(
    setupSql,
    /FOREIGN KEY \(category_id, format_id\)\s+REFERENCES formats\(category_id, id\)/,
  )
  assert.match(setupSql, /ON DELETE SET NULL \(format_id\)/)
})

test('setup adds missing updated_at columns and trigger handles schemas without that field', () => {
  for (const table of ['categories', 'formats', 'materials', 'clients']) {
    assert.match(
      setupSql,
      new RegExp(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW\\(\\)`),
    )
  }
  assert.match(setupSql, /IF to_jsonb\(NEW\) \? 'updated_at' THEN/)
  assert.match(setupSql, /jsonb_populate_record\(NEW, jsonb_build_object\('updated_at', NOW\(\)\)\)/)
  assert.doesNotMatch(setupSql, /NEW\.updated_at = NOW\(\)/)
  assert.ok(
    setupSql.indexOf('CREATE OR REPLACE FUNCTION update_updated_at_column()') <
      setupSql.indexOf('SET markup_price = sell_price - cost_price'),
    'trigger must be repaired before setup migration updates run',
  )
})

test('updated_at recovery script is idempotent and restores the client columns used by the frontend', () => {
  for (const table of ['categories', 'formats', 'materials', 'clients']) {
    assert.match(
      updatedAtRepairSql,
      new RegExp(`ALTER TABLE public\\.${table}[\\s\\S]*?ADD COLUMN IF NOT EXISTS updated_at`),
    )
    assert.match(updatedAtRepairSql, new RegExp(`DROP TRIGGER IF EXISTS update_${table}_updated_at`))
  }
  assert.match(updatedAtRepairSql, /ALTER TABLE public\.clients[\s\S]*?ADD COLUMN IF NOT EXISTS phone_number/)
  assert.match(updatedAtRepairSql, /ALTER TABLE public\.clients[\s\S]*?ADD COLUMN IF NOT EXISTS address/)
  assert.match(updatedAtRepairSql, /ALTER TABLE public\.clients[\s\S]*?ADD COLUMN IF NOT EXISTS notes/)
  assert.match(updatedAtRepairSql, /CREATE OR REPLACE FUNCTION public\.update_updated_at_column\(\)/)
  assert.match(updatedAtRepairSql, /IF to_jsonb\(NEW\) \? 'updated_at' THEN/)
  assert.match(updatedAtRepairSql, /BEGIN;[\s\S]*COMMIT;\s*$/)
  assert.doesNotMatch(updatedAtRepairSql, /\b(UPDATE|DELETE) FROM public\.(materials|expenses|payments)\b/i)
})

test('order materials policy repair changes only the two setup-owned policies', () => {
  assert.match(repairSql, /DROP POLICY IF EXISTS "Allow all access to order_materials"/)
  assert.match(
    repairSql,
    /DROP POLICY IF EXISTS "order_materials_authenticated_access"/,
  )
  assert.match(repairSql, /DROP POLICY IF EXISTS "order_materials_crm_access"/)
  assert.match(
    repairSql,
    /CREATE POLICY "order_materials_crm_access"[\s\S]*?TO anon, authenticated[\s\S]*?USING \(true\)/,
  )
  assert.match(repairSql, /ON public\.order_materials/)
  assert.match(repairSql, /BEGIN;[\s\S]*COMMIT;\s*$/)
})

test('CRM opens without authentication and loads its data immediately', () => {
  assert.doesNotMatch(appSource, /AuthForm|supabase\.auth|session/)
  assert.match(appSource, /dispatch\(fetchHistoryOrders\(\)\)/)
  assert.doesNotMatch(layoutSource, /onSignOut|Chiqish/)
})

test('all Supabase data loading errors are shown with their section names', () => {
  assert.match(appSource, /dataErrors\.map\(\(\{ section, message \}\)/)
  assert.match(appSource, /<span className="font-semibold">\{section\}:<\/span> \{message\}/)
  assert.doesNotMatch(appSource, /dataErrors\[0\]/)
})

test('settings page is linked to global layout and shared Supabase preferences', () => {
  assert.match(appSource, /fetchSettingsAPI\(supabase\)/)
  assert.match(appSource, /saveSettingsAPI\(settings, supabase\)/)
  assert.match(appSource, /activeTab === 'settings'/)
  assert.match(layoutSource, /id: 'settings', title: 'Sozlamalar'/)
  assert.match(layoutSource, /style=\{getThemeVariables\(settings\)\}/)
  assert.match(layoutSource, /settings\.density/)
})

test('new order shows sales history beside the form while reports remain separate', () => {
  const newOrderBlock = appSource.match(
    /activeTab === 'enterData' && \(([\s\S]*?)\n            \)\}/,
  )?.[1]
  const historyBlock = appSource.match(
    /activeTab === 'history' && \(([\s\S]*?)\n            \)\}/,
  )?.[1]
  const reportsBlock = appSource.match(
    /activeTab === 'reports' && \(([\s\S]*?)\n            \)\}/,
  )?.[1]

  assert.match(newOrderBlock, /<OrderForm \/>[\s\S]*<HistoryForm \/>/)
  assert.doesNotMatch(newOrderBlock, /<ReportsForm \/>/)
  assert.match(historyBlock, /<HistoryForm \/>/)
  assert.match(reportsBlock, /<ReportsForm \/>/)
  assert.doesNotMatch(
    readFileSync(new URL('../src/features/history/HistoryForm.jsx', import.meta.url), 'utf8'),
    /Hisobot \(|Jami qilingan sof foyda|Buyurtmalar summasi/,
  )
  assert.match(layoutSource, /title: 'Statistika'/)
  assert.match(layoutSource, /title: 'Buyurtmalar tarixi'/)
  assert.match(layoutSource, /title: 'Material savdosi'/)
  assert.match(appSource, /activeTab === 'materialSales'/)
})
