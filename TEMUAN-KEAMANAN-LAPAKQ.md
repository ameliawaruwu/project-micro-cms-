# Temuan Keamanan & Tindak Lanjut LapakQ

Dicatat: 9 November 2026. Sumber: audit saat memperbaiki fitur Publish Toko (commit lokal `f9de84c`).
Dokumen ini sengaja **tidak** memuat nilai password, token, atau key. Semua nilai rahasia yang disebut di bawah harus dianggap sudah bocor dan wajib diganti.

## Ringkasan prioritas

| # | Temuan | Tingkat | Status |
|---|---|---|---|
| 1 | Password master/bawaan admin tertanam di kode frontend | KRITIS | Belum diperbaiki |
| 2 | Login diputuskan di browser, tanpa sesi server | KRITIS | Belum diperbaiki |
| 3 | Password sudo NAS pernah di-commit (masih di riwayat git) | KRITIS | Kode sudah dihapus, **rotasi + bersihkan riwayat belum** |
| 4 | URL & anon key Supabase sebagai fallback di kode | SEDANG | Perlu cek RLS |
| 5 | Token Cloudflare di `.env` tidak terpakai lagi | SEDANG | Perlu dicabut |
| 6 | Route `/cloudflare/*` tanpa autentikasi | TINGGI | ✅ Sudah dihapus di `f9de84c` |
| 7 | Perubahan lokal belum di-commit & push ke remote ditolak | INFO | Perlu dirapikan |

---

## 1. Password master/bawaan admin di kode frontend — KRITIS

**Lokasi:** `src/services/authService.ts` (daftar akun bawaan sekitar baris 55–105 dan pengecekan `isSuperAdminMasterPassword` / `isSubAdmin*DefaultPassword` sekitar baris 345–365).

Kode login menerima beberapa password tetap (master password super admin dan password bawaan sub-admin) untuk email admin tertentu. Karena file ini ikut ter-bundle ke JavaScript yang diunduh browser, siapa pun bisa membuka DevTools, membaca password itu, lalu login sebagai super admin.

**Perbaikan:**
- Hapus seluruh daftar password tetap dan percabangan master password dari kode.
- Ganti semua password akun admin yang pernah memakai nilai tersebut.
- Verifikasi hanya lewat server (lihat poin 2).

## 2. Login diputuskan di browser, tanpa sesi server — KRITIS

**Lokasi:** `src/services/authService.ts` (`login`), backend Express.

Hasil login disimpan di `localStorage` dan dipercaya oleh UI. Ada jalur fallback yang mengambil kolom `password_hash` dari tabel user ke browser lalu membandingkannya di sisi klien. Artinya:
- hash password bisa dibaca klien (bisa di-crack offline);
- status "sudah login" bisa dipalsukan dengan mengubah `localStorage`;
- endpoint backend (`/api/deploy/*`) tidak bisa tahu siapa pemanggilnya, sehingga sekarang hanya memvalidasi slug/domain terhadap tabel `stores`.

**Perbaikan:**
- Pakai Supabase Auth (atau sesi/JWT yang ditandatangani server Express).
- Jangan pernah `select` kolom `password_hash` dari klien; cabut akses kolom itu lewat RLS/grant.
- Backend memverifikasi token sesi di setiap route yang mengubah data (publish, unpublish, domain), lalu cek bahwa toko memang milik user itu.

## 3. Password sudo NAS di riwayat git — KRITIS

**Lokasi lama:** `backend/nginxDeployer.ts` (sudah dihapus di `f9de84c`).

File sudah dihapus, tetapi nilainya masih bisa dibaca dari commit lama (`git log -p`).

**Perbaikan:**
- Minta admin server mengganti password sudo tersebut (bukan wewenang aplikasi).
- Bersihkan riwayat repo (`git filter-repo` / BFG) sebelum repo dibagikan atau di-push ke tempat lain.
- Aplikasi tidak lagi butuh sudo: publish toko kini lewat API panel Kroombox (lihat bagian Setup).

## 4. URL & anon key Supabase sebagai fallback — SEDANG

**Lokasi:** `src/services/supabaseClient.ts` baris 3–4.

Anon/publishable key memang publik secara desain, jadi ini bukan kebocoran rahasia. Risikonya ada di **RLS**: bila tabel (`users`, `stores`, pesanan, dsb.) tidak dikunci dengan policy yang benar, siapa pun yang memegang key ini bisa membaca/menulis langsung ke database.

**Perbaikan:**
- Audit RLS semua tabel di dashboard Supabase; pastikan kolom sensitif (`password_hash`, data pembeli) tidak bisa dibaca anon.
- Ambil nilai dari env build saja (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), hapus fallback di kode.

## 5. Token Cloudflare di `.env` tidak terpakai — SEDANG

Integrasi Cloudflare langsung sudah dihapus. Token lama di `.env` tidak dipakai lagi.

**Perbaikan:** cabut (revoke) token itu di dashboard Cloudflare, lalu hapus barisnya dari `.env`.

## 6. Route `/cloudflare/*` tanpa autentikasi — ✅ Selesai

Route yang dulu bisa membuat/menghapus record DNS tanpa login sudah dihapus di `f9de84c`. Router backend sekarang hanya terpasang di `/deploy` dan `/api/deploy`.

## 7. Kebersihan repo — INFO

- Ada perubahan lokal yang belum di-commit: `ecosystem.config.cjs`, `index.html`, `package-lock.json`. Tinjau, lalu commit atau buang.
- Push ke remote `panel` ditolak (HTTP 403). Commit `f9de84c` baru ada di lokal; perlu kredensial/hak push yang benar.

---

## Setup Publish Toko lewat API panel (wajib sebelum deploy)

1. Di **Admin Panel → API Management → Create API Token**:
   - Nama: `LapakQ Publish`
   - **Pemilik token:** `akun@kroombox.com` (wajib diisi, agar key hanya menjangkau situs akun ini)
   - Scope: `domains:read` dan `domains:write` saja
2. Isi env situs LapakQ (Environment Variables di panel), lalu restart aplikasi:
   - `KROOMBOX_PANEL_API_URL` — URL API panel
   - `KROOMBOX_SITE_ID` = `s_1789953949220_1ee44e`
   - `KROOMBOX_PANEL_API_KEY` — token dari langkah 1 (jangan di-commit)
3. Deploy ulang LapakQ, lalu uji: Publish Toko → buka `https://<slug>.lapakq.com`.

Toko memakai subdomain `*.lapakq.com` (domain BYOD aktif akun ini), dengan kuota 200 subdomain per situs, terpisah dari kuota 10 custom domain.

## Catatan pemulihan (9 November 2026)

File ini sempat terhapus oleh rebuild pukul 15:44 karena deploy menjalankan `git clean -fd` (file yang dibuat di file manager tidak ada di repo). Panel sudah diperbaiki (commit `aa4a2483`): rebuild kini hanya menghapus file untracked yang bertabrakan dengan file di branch, dan commit/perubahan lokal dibackup ke `refs/kroombox/backup/*` sebelum reset.

Catatan: commit lokal `f9de84c` tidak ada di branch saat ini (tertimpa reset rebuild). Agar tidak hilang lagi, push commit itu ke remote atau terapkan ulang perubahannya.
