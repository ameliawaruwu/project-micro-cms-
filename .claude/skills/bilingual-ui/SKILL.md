---
name: bilingual-ui
description: Aturan wajib UI dua bahasa (Indonesia/English) & ikon seragam LapakQ. Pakai setiap kali menambah atau mengubah teks yang terlihat pengguna (label, tombol, placeholder, toast, error, empty state, tanggal, notifikasi, email in-app), membuat halaman/komponen baru, atau memakai ikon tiket/notifikasi.
---

# UI Dua Bahasa & Ikon Seragam — LapakQ

Saat pengguna menekan tombol ganti bahasa (`LanguageSwitchButton`), **seluruh teks
yang terlihat di aplikasi wajib ikut berubah** antara Bahasa Indonesia (`id`,
default) dan English (`en`). Tidak boleh ada teks yang tertinggal dalam satu bahasa.

## 1. Sumber bahasa

`src/contexts/LanguageContext.tsx`:

```tsx
const { language, isEn, t, setLanguage, toggleLanguage } = useLanguage();
```

- `language`: `'id' | 'en'` (disimpan di localStorage `kroomify_language_preference`).
- `t(key, fallbackId)`: ambil dari kamus `translations` (`{ key: { id, en } }`).
- `isEn`: boolean untuk teks inline.

## 2. Cara menulis teks

Pilih salah satu (keduanya sah di codebase ini):

| Kasus | Pola |
|---|---|
| Teks yang dipakai ulang di banyak tempat (menu, tombol umum, status) | Tambah entri di `translations` lalu `t('nav.orders', 'Pesanan')` |
| Teks lokal satu komponen | `isEn ? 'Save changes' : 'Simpan perubahan'` |
| Kalimat dengan variabel | Template per bahasa: ``isEn ? `${n} products` : `${n} produk` `` (jangan menyambung potongan kata antarbahasa) |

Yang **wajib** dua bahasa (sering terlewat):

- Label, judul, sub-judul, tombol, tab, badge status.
- `placeholder`, `aria-label`, `title` (tooltip), `alt` gambar.
- Toast/alert/confirm, pesan validasi form, pesan error dari `catch`.
- Empty state, loading (`Memuat…`/`Loading…`), teks paginasi.
- Tanggal & angka: `toLocaleDateString(isEn ? 'en-US' : 'id-ID', …)`. Rupiah tetap `formatRupiah` (mata uang tidak diterjemahkan).
- Label opsi `<select>` dan peta status (`pending` → `Menunggu`/`Pending`).

Yang **tidak** diterjemahkan: data milik pengguna (nama toko, nama produk, deskripsi
yang ditulis merchant), nomor pesanan/tiket, domain, nama merek (LapakQ, Midtrans, QRIS).

## 3. Teks yang dibuat server/database

Jangan simpan kalimat jadi satu bahasa di database untuk ditampilkan apa adanya.
Simpan **tipe + parameter mentah**, lalu susun kalimatnya di frontend per bahasa.

Contoh acuan: notifikasi.
- DB (`supabase/migrations/20261116_notifications.sql`): kolom `type` + `data jsonb`
  (`jsonb_build_object('order_number', …, 'amount', NEW.total_amount)`; nominal
  sebagai angka, status sebagai kode mentah).
- Frontend: `src/utils/notificationText.ts` → `notificationText(n, isEn)`.
- `title`/`body` di DB hanya cadangan untuk tipe yang belum dikenal.

Saat menambah tipe notifikasi baru: tambah `case` di `notificationText.ts` **dan**
kunci `data` yang sama di trigger SQL.

Pesan error dari backend (`/api/...`): tampilkan teks dua bahasa dari frontend
berdasarkan kode/status, atau pastikan backend mengembalikan kode yang bisa dipetakan.

## 4. Ikon seragam

| Fitur | Ikon | Catatan |
|---|---|---|
| Tiket bantuan (menu, header panel, notifikasi tiket) | `SupportAgentIcon` dari `src/components/common/icons/SupportAgentIcon.tsx` (orang ber-headset) | Jangan pakai `Ticket`/`LifeBuoy`/`Headphones` lucide untuk fitur tiket |
| Notifikasi | `<NotificationBell onNavigate={…} />` dari `src/components/common/NotificationBell.tsx` | Satu gaya untuk semua peran (gaya header admin). Jangan buat lonceng sendiri atau menambah varian gaya |

`SupportAgentIcon` dibuat dengan `createLucideIcon`, jadi props-nya sama dengan ikon
lucide (`className`, `size`, `strokeWidth`) dan bisa dipakai di tempat bertipe `LucideIcon`.

## 5. Checklist sebelum commit

1. Tidak ada string literal berbahasa Indonesia/Inggris tunggal di JSX yang terlihat pengguna.
2. `placeholder`/`aria-label`/`title`/toast/error sudah dua bahasa.
3. Format tanggal mengikuti bahasa aktif.
4. Teks dari DB/server disusun di frontend dari tipe + parameter.
5. Ikon tiket = `SupportAgentIcon`; lonceng = `NotificationBell`.
6. Ganti bahasa di browser (`npm run dev`) dan periksa halaman yang diubah.
7. `npx tsc --noEmit` lolos.

## 6. Mencari teks yang belum diterjemahkan

```bash
# JSX text node berhuruf (kandidat teks tanpa t()/isEn) di file yang diubah
git diff --name-only | grep '\.tsx$' | xargs grep -nE '>[[:space:]]*[A-Za-z][^<>{}]{2,}<'

# Atribut teks literal
grep -rnE '(placeholder|aria-label|title|alt)="[A-Za-z]' src --include=*.tsx

# Toast/alert literal
grep -rnE "(toast\.(success|error|info)|alert|confirm)\(['\"\`]" src --include=*.tsx

# Komponen yang belum memakai useLanguage tapi punya teks
grep -rLE 'useLanguage' src/components src/pages --include=*.tsx
```

Hasil grep adalah kandidat; periksa manual (data pengguna & nama merek tidak perlu diterjemahkan).
