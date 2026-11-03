# Al-Aziz CRM

CRM for managing customers, orders, inventory, customer payments, invoices, and reports. Data is stored in Supabase; the browser only keeps the active UI state.

## Supabase setup

1. Create a Supabase project and open its **SQL Editor**.
2. For a new Supabase project, run [`supabase-setup.sql`](./supabase-setup.sql). It creates the CRM tables, no-login policies, and atomic order/material-sale/stock functions in one transaction.
   - For an already configured CRM, run [`supabase-material-sales.sql`](./supabase-material-sales.sql) to add direct material sales only. It is idempotent and does not rewrite existing CRM records. Prefer this incremental file over rerunning the full setup just to add standalone sales: the full setup also contains earlier accounting backfills described below.
   - To repair only the older `updated_at` trigger error, run [`supabase-fix-updated-at-trigger.sql`](./supabase-fix-updated-at-trigger.sql). It is safe to rerun and does not change order, payment, or inventory data.
3. Copy `.env.example` to `.env` and set the project URL and publishable/anon key from **Project Settings → API**:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
   ```

   Never put a `service_role` or secret key in a `VITE_` variable.
4. Install dependencies and start the app:

   ```sh
   npm install
   npm run dev
   ```

   The CRM opens directly without a login.

> **Access warning:** Login is disabled for now. Anyone who can reach the app and its public Supabase URL/key can read, insert, update, and delete records in the CRM tables. RLS is enabled but intentionally permits the `anon` role on these specific tables for this no-login setup. Use only in a trusted, private environment; restore authentication and authenticated-only policies before public deployment or use with sensitive customer data.

## Accounting behavior

- **Buyurtma summasi** (`expenses.order_total`) is material sales plus customer-billed services (Bazis, Arra/kesish, Kromka, Teshish, Rover). Each material's sale price is purchase cost plus an explicit markup (`materials.cost_price + materials.markup_price`). The order stores cost and markup snapshots (`order_materials.unit_cost`, `unit_markup`, `total_cost`, and `total_markup`) so later inventory price changes do not rewrite old orders.
- **Ichki xarajatlar** (Usta haqi, Zapchast xarajati, Boshqa xarajat) are recorded separately and are not added to the customer's bill. Reports list every service revenue separately and show these entered costs separately; because they are not assigned to a specific service, per-service margin is not calculated.
- **Jami foyda** is material markup plus service revenue minus the recorded internal costs. The material purchase cost is subtracted once from revenue; markup is not double-counted. The database stores the computed customer total and profit (`expenses.order_total`, `expenses.payoff`).
- For example, a material with 300,000 so‘m cost and 50,000 so‘m markup sells for 350,000 so‘m. Adding 200,000 so‘m in billable service charges gives a 550,000 so‘m customer total and 250,000 so‘m profit before internal costs. Actual entered internal costs are then subtracted from that profit.
- Re-run `supabase-setup.sql` to add explicit markup snapshots and recalculate stored totals/profit with this model. Historical material costs that were never snapshotted cannot be reconstructed. Older orders are recalculated using the new classification of Usta haqi/Zapchast/Boshqa as internal costs, so verify historical totals if those values were previously entered as customer-billed services.
- The amount received at order creation and subsequent order-linked receipts are recorded as payments; the older `expenses.overallmoney` field reflects total received.
- Creating an order, consuming stock, and writing order materials happen in one database transaction. A stock shortage rejects the whole order. Deleting an order restores its stock in one transaction.
- Use **Material savdosi** to sell stock without creating an order. It uses the material's saved unit cost and sale price, records immutable price/name snapshots, optionally links a client, reduces stock in the same transaction, and records the amount actually received. Partial receipts are recorded against that sale; later receipts cannot exceed its remaining balance. Sale and payment rows are read-only to the browser and are written through the granted RPCs.
- Standalone material sales appear separately in the monthly report and are also included in total revenue and net profit. Their profit is sale revenue minus the saved material cost. A linked customer's history includes both their orders and direct material purchases; sales without a selected client remain in overall reports only.
- Reports sum each order service's revenue separately, standalone material-sale revenue/cost/profit, order material cost/markup, payments collected, and recorded internal costs. Service-specific net profit is not shown because current records do not capture costs per service; internal costs are subtracted only from overall profit and are never treated as customer-billed revenue.
- Inventory materials belong to a category and, when applicable, one of that category's formats. The setup script enforces this category/format pair and ensures `updated_at` exists for older databases; invalid legacy format links are cleared without deleting material rows or stock. Re-run `supabase-setup.sql` to apply these fixes.
- Payments can be recorded against a customer or allocated to one of that customer's orders. Linked payments cannot exceed the order's remaining balance. Reports show order revenue/profit and recorded payments separately; they are not added together as if both were revenue.

## Checks

```sh
npm test
npm run lint
npm run build
```

The database setup script must be applied to the Supabase project before order creation and deletion can use the transactional RPC functions.
