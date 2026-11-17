-- Rapikan ID user menjadi berurutan USR001, USR002, ... (urut created_at, lalu id).
--
-- Latar belakang: ID user bolong-bolong (USR001, USR005, USR008, ...) karena sequence
-- tetap maju saat registrasi gagal/user dihapus, dan ada satu ID manual "USR005_GMPS"
-- (admin komunitas GMPS) yang dibuat langsung di database di luar get_next_id().
--
-- Kolom yang menyimpan ID user (dipindai 2026-11-17):
--   FK  : stores.user_id, notifications.user_id, community_join_requests.user_id,
--         app_private.sessions.user_id
--   Teks: support_tickets.requester_id, community_join_requests.decided_by,
--         partner_api_keys.sub_admin_user_id, products.user_id
--
-- Efek samping yang disengaja:
--   * Semua sesi login dihapus. Frontend menyimpan objek user (beserta id) di
--     localStorage, jadi setiap user wajib login ulang agar memakai id baru.
--   * Referensi ke user yang SUDAH DIHAPUS (mis. tiket milik USR004/USR015 lama)
--     diberi awalan "DEL_" agar tidak "berpindah" ke user baru yang kebetulan
--     mendapat nomor yang sama.

BEGIN;

LOCK TABLE public.users IN EXCLUSIVE MODE;

-- 1. Paksa login ulang.
DELETE FROM app_private.sessions;

-- 2. Peta id lama -> id baru.
CREATE TEMP TABLE usr_map ON COMMIT DROP AS
SELECT id AS old_id,
       public.format_prefixed_id('USR', row_number() OVER (ORDER BY created_at, id)) AS new_id
FROM public.users;

-- 3. Tandai referensi yatim (user sudah dihapus) sebelum nomor lama dipakai ulang.
UPDATE public.support_tickets SET requester_id = 'DEL_' || requester_id
 WHERE requester_id ~ '^USR' AND requester_id NOT IN (SELECT old_id FROM usr_map);
UPDATE public.community_join_requests SET decided_by = 'DEL_' || decided_by
 WHERE decided_by ~ '^USR' AND decided_by NOT IN (SELECT old_id FROM usr_map);
UPDATE public.partner_api_keys SET sub_admin_user_id = 'DEL_' || sub_admin_user_id
 WHERE sub_admin_user_id ~ '^USR' AND sub_admin_user_id NOT IN (SELECT old_id FROM usr_map);
UPDATE public.products SET user_id = 'DEL_' || user_id
 WHERE user_id ~ '^USR' AND user_id NOT IN (SELECT old_id FROM usr_map);

-- 4. Lepas FK sementara; trigger penjaga/notifikasi dimatikan agar perubahan id
--    tidak memicu notifikasi atau mengubah updated_at.
ALTER TABLE public.stores DROP CONSTRAINT stores_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
ALTER TABLE public.community_join_requests DROP CONSTRAINT community_join_requests_user_id_fkey;
ALTER TABLE app_private.sessions DROP CONSTRAINT sessions_user_id_fkey;

ALTER TABLE public.users DISABLE TRIGGER USER;
ALTER TABLE public.stores DISABLE TRIGGER USER;
ALTER TABLE public.community_join_requests DISABLE TRIGGER USER;
ALTER TABLE public.support_tickets DISABLE TRIGGER USER;

-- 5. Ganti id user (dua tahap agar tidak bentrok dengan PK, mis. USR009 -> USR005
--    selagi USR005 lama masih ada).
UPDATE public.users u SET id = 'TMP_' || m.new_id FROM usr_map m WHERE u.id = m.old_id;
UPDATE public.users SET id = substr(id, 5) WHERE id LIKE 'TMP\_%';

UPDATE public.stores t SET user_id = m.new_id FROM usr_map m WHERE t.user_id = m.old_id;
UPDATE public.notifications t SET user_id = m.new_id FROM usr_map m WHERE t.user_id = m.old_id;
UPDATE public.community_join_requests t SET user_id = m.new_id FROM usr_map m WHERE t.user_id = m.old_id;
UPDATE public.community_join_requests t SET decided_by = m.new_id FROM usr_map m WHERE t.decided_by = m.old_id;
UPDATE public.support_tickets t SET requester_id = m.new_id FROM usr_map m WHERE t.requester_id = m.old_id;
UPDATE public.partner_api_keys t SET sub_admin_user_id = m.new_id FROM usr_map m WHERE t.sub_admin_user_id = m.old_id;
UPDATE public.products t SET user_id = m.new_id FROM usr_map m WHERE t.user_id = m.old_id;

-- 6. Pulihkan trigger & FK persis seperti semula (FK divalidasi ulang di sini).
ALTER TABLE public.users ENABLE TRIGGER USER;
ALTER TABLE public.stores ENABLE TRIGGER USER;
ALTER TABLE public.community_join_requests ENABLE TRIGGER USER;
ALTER TABLE public.support_tickets ENABLE TRIGGER USER;

ALTER TABLE public.stores ADD CONSTRAINT stores_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.community_join_requests ADD CONSTRAINT community_join_requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE app_private.sessions ADD CONSTRAINT sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 7. Sequence lanjut dari nomor terakhir (user baru berikutnya = USR(n+1)).
SELECT setval('public.seq_users_id', GREATEST((SELECT count(*) FROM usr_map), 1), (SELECT count(*) FROM usr_map) > 0);

-- 8. Pastikan hasilnya rapi.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id !~ '^USR[0-9]{3,}$') THEN
    RAISE EXCEPTION 'Masih ada id user tidak standar';
  END IF;
END $$;

COMMIT;
