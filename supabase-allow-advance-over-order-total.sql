-- Allow order-linked payments to exceed the order's quoted total.
-- The trigger still verifies that the order exists and belongs to the customer.

BEGIN;

CREATE OR REPLACE FUNCTION public.validate_payment_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  order_client_id BIGINT;
BEGIN
  IF NEW.expense_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT e.client_id
  INTO order_client_id
  FROM public.expenses AS e
  WHERE e.id = NEW.expense_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bog‘langan buyurtma topilmadi';
  END IF;
  IF order_client_id <> NEW.client_id THEN
    RAISE EXCEPTION 'To‘lov mijozini buyurtma mijoziga moslang';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_order_payments_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_order_id BIGINT;
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.expense_id IS DISTINCT FROM NEW.expense_id) THEN
    affected_order_id := OLD.expense_id;
    IF affected_order_id IS NOT NULL THEN
      UPDATE public.expenses
      SET overallmoney = opening_paid + COALESCE(
          (SELECT SUM(amount) FROM public.payments WHERE expense_id = affected_order_id), 0
        ),
        payoff = opening_paid + COALESCE(
          (SELECT SUM(amount) FROM public.payments WHERE expense_id = affected_order_id), 0
        ) -
        COALESCE((SELECT SUM(COALESCE(NULLIF(total_cost, 0), unit_cost * count))
                  FROM public.order_materials WHERE expense_id = affected_order_id), 0) -
        COALESCE(masterfee, 0) - COALESCE(spares, 0) - COALESCE(anotherexpenses, 0)
      WHERE id = affected_order_id;
    END IF;
  END IF;

  IF TG_OP <> 'DELETE' AND NEW.expense_id IS NOT NULL THEN
    UPDATE public.expenses
    SET overallmoney = opening_paid + COALESCE(
        (SELECT SUM(amount) FROM public.payments WHERE expense_id = NEW.expense_id), 0
      ),
      payoff = opening_paid + COALESCE(
        (SELECT SUM(amount) FROM public.payments WHERE expense_id = NEW.expense_id), 0
      ) -
      COALESCE((SELECT SUM(COALESCE(NULLIF(total_cost, 0), unit_cost * count))
                FROM public.order_materials WHERE expense_id = NEW.expense_id), 0) -
      COALESCE(masterfee, 0) - COALESCE(spares, 0) - COALESCE(anotherexpenses, 0)
    WHERE id = NEW.expense_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
