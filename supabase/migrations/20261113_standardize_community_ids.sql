-- ============================================================================
-- MIGRATION: SERAGAMKAN ID KOMUNITAS KE FORMAT COMxxx
-- Komunitas lama dibuat dengan ID "comm_<timestamp>" (mis. comm_1793843915683),
-- sedangkan yang baru memakai COM002, COM003, ... Migrasi ini:
--   1. Mengganti setiap ID komunitas non-standar menjadi COMxxx (COM001 dipakai
--      lebih dulu bila masih kosong, berikutnya dari seq_communities_id) beserta
--      seluruh referensinya (users, stores, store_communities, join requests,
--      invoice omset, tiket support, partner API key).
--   2. Memasang trigger agar ID komunitas baru selalu berformat COMxxx.
-- Catatan: portal partner yang menyimpan ID lama perlu memakai ID baru.
-- ============================================================================

DO $$
DECLARE
  r record;
  v_new text;
BEGIN
  FOR r IN
    SELECT id FROM public.communities
    WHERE id !~ '^COM[0-9]{3,}$'
    ORDER BY created_at
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.communities WHERE id = 'COM001') THEN
      v_new := 'COM001';
    ELSE
      LOOP
        v_new := format_prefixed_id('COM', nextval('seq_communities_id'));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.communities WHERE id = v_new);
      END LOOP;
    END IF;

    -- Salin baris dengan ID baru (FK anak tidak ON UPDATE CASCADE)
    INSERT INTO public.communities
    SELECT (jsonb_populate_record(NULL::public.communities, to_jsonb(c) || jsonb_build_object('id', v_new))).*
    FROM public.communities c
    WHERE c.id = r.id;

    UPDATE public.store_communities       SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.community_join_requests SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.community_invoices      SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.stores                  SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.users                   SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.support_tickets         SET community_id = v_new WHERE community_id = r.id;
    UPDATE public.partner_api_keys        SET community_id = v_new WHERE community_id = r.id;

    DELETE FROM public.communities WHERE id = r.id;
    RAISE NOTICE 'Komunitas % -> %', r.id, v_new;
  END LOOP;

  -- Pastikan sequence tidak membagikan ID yang sudah terpakai
  PERFORM setval(
    'seq_communities_id',
    GREATEST(
      (SELECT COALESCE(MAX(substring(id FROM 4)::bigint), 1) FROM public.communities WHERE id ~ '^COM[0-9]{3,}$'),
      (SELECT last_value FROM seq_communities_id)
    )
  );
END $$;

-- Trigger: ID komunitas baru selalu COMxxx
CREATE OR REPLACE FUNCTION public.trg_assign_community_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.id IS NULL OR NEW.id !~ '^COM[0-9]{3,}$' THEN
    NEW.id := format_prefixed_id('COM', nextval('seq_communities_id'));
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_communities_id ON public.communities;
CREATE TRIGGER trg_communities_id
  BEFORE INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.trg_assign_community_id();

NOTIFY pgrst, 'reload schema';
