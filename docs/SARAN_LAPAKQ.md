# Saran untuk LapakQ: Integrasi Portal GMPS

Dari: tim Portal GMPS. Untuk: tim LapakQ.
Acuan: LapakQ Public API v1 (`/api/v1`, GET saja), kode `backend/publicApiController.ts`, dan uji langsung API pada 5 November 2026.
Menggantikan `INTEGRASI_KROOMIFY.md`.

## Model integrasi yang dipakai portal

Portal GMPS dan LapakQ terpisah dan tidak memakai kode referral.

- **Portal GMPS** mengurus keanggotaan: pendaftaran, persetujuan, kartu anggota, diskusi, artikel, dan data toko GMPS (termasuk lokasi di peta).
- **LapakQ** mengurus toko online. Toko anggota GMPS dibuat atau dimasukkan ke **komunitas GMPS** oleh **sub-admin GMPS**, yang juga mengelola produk dan publikasinya.
- **Penghubungnya** adalah tautan anggota ke toko. Admin portal memilih toko dari `GET /communities/gmps/stores`, lalu portal hanya membaca toko dan produk lewat API v1 memakai key partner GMPS.

```
Portal (browser) ──► Backend portal ──X-API-Key (partner GMPS, GET)──► LapakQ /api/v1
```

Portal tidak pernah menulis ke LapakQ. API key hanya disimpan di backend portal.

## 1. Penting

Nomor 1 dan 2 wajib ada sebelum integrasi bisa dipakai.

### 1.1 Backend API produksi mati

Semua `https://lapakq.com/api/*` membalas:

```json
{ "error": "backend_not_configured", "message": "This site has no backend linked for /api." }
```

`kroomify-api` di port `5055` juga tidak merespons. Hidupkan lagi backend API produksi dan tautkan ke situs di KolabPanel. Setelah itu `GET /api/v1/health` harus membalas `"status": "ok"`.

### 1.2 Toko masuk komunitas tanpa referral

Selama ini `stores.community_id` diisi lewat `redeemReferral` (`src/services/referralService.ts`). Kalau referral dihapus, perlu cara lain:

1. Sub-admin GMPS bisa **membuat toko untuk anggota** langsung di komunitas GMPS dari dashboard.
2. Sub-admin GMPS bisa **memasukkan toko yang sudah ada** ke komunitas GMPS, dan mengeluarkannya. `communityService.assignStoreToCommunity` sudah ada dan tinggal dibuka di UI sub-admin.
3. Terbitkan **key partner GMPS** di `partner_api_keys` dengan `community_id` = id komunitas GMPS (`comm_1793843915683`). Kirim key-nya ke tim portal lewat jalur privat.

### 1.3 Toko yang belum terbit ikut terbaca publik

`GET /stores/:id` dan `GET /stores/:id/products` mengembalikan toko dan produk yang `isPublished = false`, termasuk untuk akses tanpa API key. Endpoint daftar (`GET /stores`) sudah memfilter `isPublished`.

Usulan:

- Akses tanpa key: hanya toko `isPublished = true`.
- Key partner: boleh melihat toko komunitasnya yang belum terbit, supaya portal bisa menampilkan status "belum dipublikasikan" kepada anggota.

### 1.4 Produk per toko tidak dibatasi per komunitas

`GET /stores/:id` sudah membalas `404` bila toko di luar komunitas pemegang key. `GET /stores/:storeId/products` belum melakukan cek yang sama, sehingga key partner bisa membaca produk toko komunitas lain. Tambahkan cek komunitas yang sama.

### 1.5 Input mentah di filter Supabase

Fallback Supabase memasukkan parameter URL langsung ke filter PostgREST:

```ts
.or(`id.eq.${storeIdOrSlug},slug.eq.${storeIdOrSlug}`)
```

Nilai yang mengandung koma, titik, atau tanda kurung bisa mengubah isi filter. Validasi dulu dengan pola `^[A-Za-z0-9_-]{1,100}$` dan balas `400 VALIDATION_ERROR` bila tidak cocok, atau pecah menjadi dua query `.eq()`.

### 1.6 Kredensial Supabase sebagai nilai cadangan

`publicApiController.ts` menulis URL proyek dan kunci Supabase langsung di kode sebagai nilai cadangan bila env kosong. Ambil hanya dari env, dan hentikan server dengan pesan jelas bila env tidak ada.

## 2. Disarankan

### 2.1 Nomor anggota di toko

Saat ini admin portal mencocokkan anggota dengan toko secara manual. Satu-satunya data bantu adalah nomor WhatsApp toko, karena API sengaja tidak membuka email pemilik.

Usulan: tambahkan field "nomor anggota komunitas" pada toko. Field ini diisi sub-admin saat membuat atau memasukkan toko, lalu dibuka di API:

```json
{ "id": "STR001", "communityId": "comm_1793843915683", "communityMemberRef": "GMPS-2026-0001" }
```

Dengan field ini portal bisa menautkan anggota ke tokonya secara otomatis.

### 2.2 Pagination dan meta yang seragam

`GET /stores/:id/products` mengirim semua produk sekaligus dengan meta `count`, sementara endpoint daftar lain memakai `page`, `limit`, dan `pagination`. Samakan semua endpoint daftar:

```json
{ "success": true, "code": "...", "message": "...", "data": [], "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

### 2.3 `updatedAt` dan header cache

Toko dan produk belum punya `updatedAt`, dan respons belum mengirim `ETag` atau `Last-Modified`. Usulan:

- Tambahkan `updatedAt` di toko dan produk.
- Kirim `ETag`/`Last-Modified` dan dukung `If-None-Match` (balas `304`).
- Opsional: filter `?updatedSince=` di endpoint produk.

Dengan ini portal bisa menyimpan cache lebih lama tanpa mengambil ulang seluruh katalog.

### 2.4 Rate limit

Tanpa key pun seluruh data publik bisa dibaca, dan key partner justru mempersempit akses. Pasang rate limit per IP untuk akses anonim dan per key untuk partner, dengan kuota lebih besar untuk key partner. Balas `429` dengan `code: "RATE_LIMITED"` dan header `Retry-After`.

### 2.5 Kelengkapan dokumentasi dan format

| Temuan | Usulan |
|---|---|
| Bagian 4.5, 4.6, 4.8, 4.9, 4.11 tanpa contoh respons | Tambahkan contoh respons, terutama bentuk `data` (objek atau array) |
| `imageUrl` dan `images[]` dobel | Cukup `images[]`, foto utama = `images[0]` |
| `storeUrl` selalu `https://<slug>.lapakq.com` | Pastikan sama dengan domain yang benar-benar dipublikasikan |
| Referral masih disebut di dashboard dan layanan | Hapus atau tandai usang setelah referral dicabut |

## 3. Status usulan lama (`INTEGRASI_KROOMIFY.md`)

| Usulan lama | Status |
|---|---|
| 1.1 `POST /accounts` dengan `referralCode` | Tidak dipakai. API v1 hanya GET dan referral dihapus. Toko dibuat sub-admin GMPS |
| 1.2 Hak kelola untuk sub-admin GMPS | Sudah ada (komunitas + sub-admin) |
| 1.3 Key per partner, terbatas datanya sendiri | Sebagian: `partner_api_keys.community_id` sudah ada, `/stores/:id/products` belum dibatasi (lihat 1.4) |
| 2.1 Kode GMPS tanpa komisi | Tidak relevan lagi (referral dihapus) |
| 2.2 Field `code` pada error | Sudah ada |
| 2.3 `storeId` di daftar referral | Tidak relevan lagi; diganti `/communities/:slug/stores` |
| 2.4 Pagination daftar produk | Sebagian: sudah ada di `/products` dan `/communities/:slug/products`, belum di `/stores/:id/products` (lihat 2.2) |
| 3 Format respons, camelCase, kode status produk | Sudah ada (`data`, camelCase, `available`/`out_of_stock`) |
