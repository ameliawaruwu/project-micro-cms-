-- Suspend/aktifkan toko binaan hanya untuk admin platform & Sub-Admin Utama komunitas.
-- Sebelumnya semua staf komunitas (termasuk Sub-Admin Produk / community_admin) bisa
-- mengubah stores.is_suspended langsung lewat PostgREST walau tombolnya disembunyikan di UI.
CREATE OR REPLACE FUNCTION app_private.guard_store_money_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF app_private.is_trusted_writer() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.balance := 0;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := 'free';
      NEW.is_suspended := false;
      NEW.custom_domain := NULL;
    END IF;
  ELSE
    NEW.balance := OLD.balance;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := OLD.plan;
      NEW.custom_domain := OLD.custom_domain;
      IF NOT (
        coalesce(app_private.session_role() IN ('sub_admin', 'sub_admin_umum'), false)
        AND app_private.store_in_my_community(OLD.id)
      ) THEN
        NEW.is_suspended := OLD.is_suspended;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
