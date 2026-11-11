-- Domain kustom toko ditetapkan super admin (menu Toko → Domain) atau server (pembayaran domain
-- lunas, app_private.mark_domain_paid). Merchant tidak boleh mengisi stores.custom_domain sendiri:
-- backend memakai kolom ini sebagai izin untuk mendaftarkan host ke Kroombox Panel.
-- Sama dengan versi 20261110_security_phase2b4 ditambah penguncian custom_domain.

CREATE OR REPLACE FUNCTION app_private.guard_store_money_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
      IF NOT app_private.store_in_my_community(OLD.id) THEN
        NEW.is_suspended := OLD.is_suspended;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
