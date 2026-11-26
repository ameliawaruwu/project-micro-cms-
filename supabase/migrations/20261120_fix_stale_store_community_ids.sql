-- Beberapa toko masih menyimpan ID komunitas lama (mis. 'comm_1793843915683') yang sudah tidak ada
-- setelah ID komunitas diganti ke format COMxxx. Panel mencocokkannya lewat nama sehingga toko tampil
-- sebagai anggota, tetapi aksi berbasis ID (Lepas Toko, domain induk toko) gagal.
-- Arahkan ulang ke komunitas yang namanya sama persis (hanya bila namanya unik).
UPDATE public.stores s
   SET community_id = c.id,
       community_name = c.name,
       updated_at = now()
  FROM public.communities c
 WHERE s.community_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.communities x WHERE x.id = s.community_id)
   AND lower(btrim(c.name)) = lower(btrim(s.community_name))
   AND (SELECT count(*) FROM public.communities y WHERE lower(btrim(y.name)) = lower(btrim(s.community_name))) = 1;
