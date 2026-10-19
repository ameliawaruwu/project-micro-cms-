# 🧪 DOKUMEN TEST CASES — MICRO CMS KROOMIFY

> **Sistem**: Micro CMS Kroomify (Multi-Tenant SaaS E-Commerce & Auto-Deployer)  
> **Versi Pengujian**: v1.2.0 (Post-Onboarding & Payment Gateway Updates)  
> **Lingkungan Uji**: 
> - **Lokal**: Windows 11 (`http://localhost:3000`)
> - **Server NAS Produksi**: Synology NAS DS923+ (`https://kroomify.kroombox.com`, Node/Express `:5055`, Nginx `:8080`)
> - **Storefront Subdomain**: `https://<slug>.kroombox.com`  
> **Database & Auth**: Supabase PostgreSQL + Supabase Auth  
> **Format Penilaian**: `Pass` ✅ | `Fail` ❌ | `Blocked` ⚠️ | `Skipped` ⏸️

---

## 📑 DAFTAR ISI

1. [Modul 1: Autentikasi, Registrasi & Onboarding 2-Langkah](#modul-1-autentikasi-registrasi--onboarding-2-langkah)
2. [Modul 2: Lokalisasi & Penggantian Bahasa (i18n)](#modul-2-lokalisasi--penggantian-bahasa-i18n)
3. [Modul 3: Manajemen Profil Toko & Pengaturan Merchant](#modul-3-manajemen-profil-toko--pengaturan-merchant)
4. [Modul 4: Manajemen Produk, Katalog & Varian](#modul-4-manajemen-produk-katalog--varian)
5. [Modul 5: Layout & Visual Theme Editor (Studio CMS)](#modul-5-layout--visual-theme-editor-studio-cms)
6. [Modul 6: Auto-Deployer Engine & Publikasi Fisik NAS](#modul-6-auto-deployer-engine--publikasi-fisik-nas)
7. [Modul 7: Storefront Publik & Pengalaman Pembeli (Buyer Experience)](#modul-7-storefront-publik--pengalaman-pembeli-buyer-experience)
8. [Modul 8: Alamat, Pengiriman & Ekspedisi (Biteship API)](#modul-8-alamat-pengiriman--ekspedisi-biteship-api)
9. [Modul 9: Payment Gateway (Midtrans Snap & Duitku)](#modul-9-payment-gateway-midtrans-snap--duitku)
10. [Modul 10: Manajemen Pesanan & Logistik Merchant](#modul-10-manajemen-pesanan--logistik-merchant)
11. [Modul 11: Billing, Langganan Paket & Payout / Penarikan](#modul-11-billing-langganan-paket--payout--penarikan)
12. [Modul 12: Super Admin Platform Panel](#modul-12-super-admin-platform-panel)
13. [Modul 13: Keamanan, API Guard & Performa](#modul-13-keamanan-api-guard--performa)

---

## Modul 1: Autentikasi, Registrasi & Onboarding 2-Langkah

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-AUTH-01** | Registrasi Akun Merchant Baru | Halaman register terbuka | 1. Masukkan nama lengkap, email unik, dan password (>= 6 karakter).<br>2. Klik tombol "Daftar Sekarang". | `name`: "Budi Santoso"<br>`email`: "budi@test.com"<br>`pass`: "Secret123!" | Akun terbuat di Supabase Auth, sesi login otomatis aktif, flag `just_registered` tercatat di storage. | Critical | `Pass` ✅ |
| **TC-AUTH-02** | Validasi Form Registrasi & Email Duplikat | Berada di halaman register | 1. Masukkan password pendek (< 6 char).<br>2. Coba daftar dengan email yang sudah ada. | `pass`: "123"<br>`email`: akun terdaftar | Muncul pesan error validasi yang tepat tanpa merusak UI. | High | `Pass` ✅ |
| **TC-AUTH-03** | Trigger Onboarding Wizard Hanya Pada First Login Pasca Registrasi | Merchant baru saja mendaftar | 1. Selesaikan registrasi.<br>2. Masuk ke halaman `/dashboard`. | Akun fresh tanpa toko | Modal `UserOnboardingModal` otomatis terbuka memandu setup toko baru. | High | `Pass` ✅ |
| **TC-AUTH-04** | Alur Onboarding Langkah 1: Profil Toko & Validasi Slug | Modal onboarding terbuka (Langkah 1) | 1. Masukkan Nama Toko.<br>2. Periksa auto-generate slug.<br>3. Pilih Kategori Industri.<br>4. Masukkan nomor WhatsApp.<br>5. Klik "Lanjutkan ke Paket". | Nama: "Kopi Senja"<br>Slug: `kopi-senja`<br>WA: `081234567890` | Validasi format slug berhasil (hanya lowercase, angka, `-`). Tombol navigasi lanjut ke Langkah 2 aktif. | High | `Pass` ✅ |
| **TC-AUTH-05** | Alur Onboarding Langkah 2: Konfirmasi Paket Utama Gratis (Free Plan) | Berada di Langkah 2 wizard | 1. Periksa rincian kartu paket gratis (Batas produk, komisi 0%, subdomain gratis).<br>2. Pastikan TIDAK ADA tombol "Lewati/Skip" yang membingungkan.<br>3. Klik "Aktifkan Toko Saya". | Pilihan paket: Gratis / Starter | Record toko tersimpan ke tabel `stores`, paket tercatat di database, modal tertutup, dashboard terbuka dengan ucapan sukses. | High | `Pass` ✅ |
| **TC-AUTH-06** | Invarian: Modal Onboarding Tidak Muncul Berulang Kali | Merchant sudah pernah menyelesaikan onboarding | 1. Logout dari akun.<br>2. Login kembali dengan akun yang sama.<br>3. Muat ulang (F5) halaman dashboard. | Akun merchant dengan toko tersimpan | Modal onboarding **TIDAK MUNCUL** lagi karena toko sudah ada. Merchant langsung melihat antarmuka dashboard normal. | High | `Pass` ✅ |
| **TC-AUTH-07** | Route Protection (Merchant Guard & Admin Guard) | Browser dalam keadaan guest / unauthenticated | 1. Akses langsung `http://localhost:3000/dashboard`.<br>2. Akses langsung `http://localhost:3000/admin`.<br>3. Login sebagai merchant biasa lalu buka `/admin`. | URL protected | 1 & 2: Di-redirect ke `/login`.<br>3: Muncul halaman 403 Forbidden / redirect otomatis karena bukan Super Admin. | Critical | `Pass` ✅ |

---

## Modul 2: Lokalisasi & Penggantian Bahasa (i18n)

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-I18N-01** | Pergantian Bahasa via Language Switch Button | Berada di halaman mana pun (Landing, Login, Dashboard) | 1. Temukan tombol pemilih bahasa di header / navbar.<br>2. Klik tombol bahasa (ID -> EN).<br>3. Periksa tampilan teks menu, headline, dan label. | Toggle ID/EN | Seluruh teks yang terdaftar di `translations` berubah seketika ke bahasa Inggris tanpa reload penuh. | Medium | `Pass` ✅ |
| **TC-I18N-02** | Persistensi Pilihan Bahasa di LocalStorage | Bahasa telah diubah ke EN | 1. Refresh halaman browser (F5) atau buka tab baru. | `localStorage.getItem('app_lang')` | Pilihan bahasa Inggris tetap tersimpan dan tidak kembali ke default Indonesia. | Medium | `Pass` ✅ |
| **TC-I18N-03** | Gaya Tampilan Tombol Switch Bahasa | Berada di Landing Navbar & Admin Header | 1. Periksa bentuk tombol switch bahasa.<br>2. Pastikan styling rapi tanpa clipping rounded-full aneh pada gambar bendera. | Inspeksi elemen CSS | Tombol switch tampil clean, proporsional, dan ikon/label terbaca jelas. | Low | `Pass` ✅ |

---

## Modul 3: Manajemen Profil Toko & Pengaturan Merchant

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-SET-01** | Pembaruan Informasi Dasar Toko | Login merchant, buka menu `/settings` | 1. Ubah nama toko, slogan, dan bio toko.<br>2. Klik "Simpan Perubahan". | Nama baru: "Toko Budi Jaya" | Pesan notifikasi toast sukses muncul, data di tabel `stores` terupdate. | Medium | `Pass` ✅ |
| **TC-SET-02** | Upload Logo & Favicon Toko | Halaman pengaturan toko terbuka | 1. Pilih file gambar JPG/PNG/WebP (< 2MB).<br>2. Klik upload logo. | File: `logo-brand.png` (500KB) | File terunggah ke Supabase Storage bucket, URL publik tersimpan di field `logo_url`. Pratinjau logo langsung muncul. | Medium | `Pass` ✅ |
| **TC-SET-03** | Validasi Ukuran File Upload Melebihi Batas | Form upload gambar | 1. Coba upload file gambar > 5MB. | File: `gambar-besar.png` (8MB) | Sistem menolak file dan menampilkan pesan error bahwa ukuran gambar melebihi batas. | Low | `Pass` ✅ |
| **TC-SET-04** | Pengaturan Kontak & Media Sosial Toko | Form kontak merchant | 1. Masukkan nomor WhatsApp, Instagram handle, dan email CS.<br>2. Simpan. | WA: `081299998888`<br>IG: `@tokobudijaya` | Tautan kontak sosial di storefront publik otomatis mengarah ke akun yang diisi. | Low | `Pass` ✅ |

---

## Modul 4: Manajemen Produk, Katalog & Varian

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-PRD-01** | Tambah Produk Baru dengan Foto & Stok | Login merchant, buka menu `/products` > Tambah | 1. Masukkan Judul Produk, Kategori, Harga, Stok, dan Berat (gram).<br>2. Unggah 1-3 foto produk.<br>3. Klik "Simpan Produk". | Judul: "Kemeja Flanel Katun"<br>Harga: 150000<br>Stok: 25<br>Berat: 300gr | Produk tersimpan ke tabel `products`, tampil di urutan teratas tabel produk, status "Aktif". | High | `Pass` ✅ |
| **TC-PRD-02** | Validasi Field Wajib Produk | Form tambah produk | 1. Kosongkan harga atau nama produk.<br>2. Tekan tombol Simpan. | Field kosong | Submit diblokir, form menampilkan highlight merah pada field wajib. | Medium | `Pass` ✅ |
| **TC-PRD-03** | Pengaturan Varian Produk (Ukuran / Warna) | Form produk dengan varian | 1. Aktifkan opsi "Tambahkan Varian".<br>2. Masukkan opsi ukuran: S, M, L, XL beserta perbedaan harga & stok masing-masing.<br>3. Simpan. | Varian: Ukuran (S, M, L, XL) | Struktur JSON varian tersimpan di database dan pembeli di storefront dapat memilih variasi. | Medium | `Pass` ✅ |
| **TC-PRD-04** | Edit & Perbarui Data Produk | Ada produk eksisting | 1. Klik ikon Edit pada baris produk.<br>2. Ubah harga dari Rp 150.000 menjadi Rp 135.000.<br>3. Simpan. | Perubahan harga diskon | Harga di tabel terupdate seketika dan langsung tercermin di storefront. | High | `Pass` ✅ |
| **TC-PRD-05** | Hapus Produk (Soft / Hard Delete) | Ada produk di daftar | 1. Klik tombol Hapus.<br>2. Konfirmasi pada dialog modal pembatalan. | ID produk terkait | Produk terhapus dari daftar dan tidak lagi muncul di halaman pembeli. | Medium | `Pass` ✅ |

---

## Modul 5: Layout & Visual Theme Editor (Studio CMS)

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-LAY-01** | Pemilihan Koleksi Tema (Theme Switcher) | Buka menu `/layout` | 1. Pilih tema yang berbeda (misal: *Minimalist*, *Bold*, *Elegant*, *Nature*).<br>2. Amati pratinjau kanvas interaktif. | Pilihan tema visual | Komponen layout pada kanvas berganti secara real-time mencerminkan karakteristik tema terpilih. | High | `Pass` ✅ |
| **TC-LAY-02** | Kustomisasi Palet Warna Toko | Editor tema terbuka | 1. Ubah Primary Color (Warna Utama) dan Secondary Color menggunakan color picker.<br>2. Amati tombol dan aksen warna di kanvas. | Hex: `#2563EB` | Tombol CTA, aksen badge, dan header di kanvas langsung berubah mengikuti warna baru. | Medium | `Pass` ✅ |
| **TC-LAY-03** | Edit Seksi Brand Philosophy & Story | Editor tema aktif | 1. Buka pengaturan seksi "Brand Philosophy".<br>2. Masukkan headline cerita toko dan nilai keunggulan produk.<br>3. Simpan desain. | Teks filosofi brand | Nilai konfigurasi tersimpan di `stores.theme_settings` dan tampil di storefront. | Medium | `Pass` ✅ |
| **TC-LAY-04** | Pengaturan Seksi Product Grid & Filter | Editor tema aktif | 1. Atur jumlah kolom produk (2, 3, atau 4 kolom).<br>2. Aktifkan filter kategori produk. | Grid 3 kolom | Kanvas menyesuaikan susunan grid produk secara presisi. | Medium | `Pass` ✅ |
| **TC-LAY-05** | Mode Pratinjau Responsif (Desktop, Tablet, Mobile) | Kanvas editor terbuka | 1. Klik tombol viewport: Tablet (768px), lalu Mobile (375px).<br>2. Periksa kesesuaian layout pada container. | Viewport switcher | Kontainer editor menyesuaikan dimensi perangkat mobile tanpa overflow horizontal. | High | `Pass` ✅ |

---

## Modul 6: Auto-Deployer Engine & Publikasi Fisik NAS

> [!IMPORTANT]
> **Kritikal**: Menguji integrasi antara frontend UI, backend daemon port 5055, Nginx vhost, dan Cloudflare Tunnel ingress di server Synology NAS.

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-DEP-01** | Buka Modal Publikasi Toko | Login merchant, klik "Publish Toko" di TopBar/Layout | 1. Klik tombol "Publish Toko".<br>2. Periksa informasi subdomain yang ditampilkan. | Slug: `kopi-senja` | Modal `PublishStoreModal` terbuka menampilkan target domain: `https://kopi-senja.kroombox.com`. | High | `Pass` ✅ |
| **TC-DEP-02** | Eksekusi Publish Fisik (`POST /api/deploy/publish`) | Modal publish terbuka | 1. Klik tombol "Publish Sekarang".<br>2. Amati checklist progres 3 tahapan. | Payload: `slug`, `store`, `products` | Request terkirim ke backend daemon Express (:5055). Ketiga tahap sukses: Stage 1 (Katalog), Stage 2 (VHost Nginx), Stage 3 (Cloudflare Edge). | Critical | `Pass` ✅ |
| **TC-DEP-03** | Verifikasi File Fisik & Symlink di Server NAS | Deploy berhasil | 1. Inspeksi direktori NAS `/volume1/web/www/KroomBox/kroomify/sites/<slug>/`. | Path direktori toko | Terbentuk file `store.json`, `products.json`, `index.html` (OG tags terinjeksi), dan symlink `assets -> ../../engine/dist/assets`. | Critical | `Pass` ✅ |
| **TC-DEP-04** | Verifikasi Konfigurasi Nginx Vhost di NAS | Deploy berhasil | 1. Cek file `/etc/nginx/sites-available/kroomify-<slug>.conf`.<br>2. Cek symlink di `/etc/nginx/sites-enabled/`. | VHost conf | File konfigurasi ter-generate valid, sintaks Nginx lolos (`nginx -t`), Nginx reload sukses. | Critical | `Pass` ✅ |
| **TC-DEP-05** | Akses Storefront Publik via Subdomain | Publikasi selesai | 1. Buka browser dan buka `https://<slug>.kroombox.com`. | Domain storefront | Halaman toko terbuka menampilkan katalog produk (HTTP 200 OK), **BUKAN** halaman default *Kroombox - Success*. | Critical | `Pass` ✅ |
| **TC-DEP-06** | Tombol "Kunjungi Toko" di Modal Publish | Publikasi selesai | 1. Klik tombol "Kunjungi Toko" pada modal. | Klik link eksternal | Membuka tab baru (`target="_blank"`) menuju URL subdomain toko secara langsung tanpa tercegah event blocking. | Medium | `Pass` ✅ |
| **TC-DEP-07** | Unpublish Toko (`POST /api/deploy/unpublish`) | Toko sedang berstatus published | 1. Buka menu Settings atau modal publish.<br>2. Klik tombol "Unpublish Toko" dan konfirmasi. | Payload: `{ slug: "kopi-senja" }` | Symlink Nginx di `sites-enabled` dilepas, Nginx di-reload, toko kembali offline atau menampilkan status tidak aktif. | High | `Pass` ✅ |

---

## Modul 7: Storefront Publik & Pengalaman Pembeli (Buyer Experience)

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-BYR-01** | Akses Publik Tanpa Login CMS | Buka domain toko publik | 1. Akses `https://<slug>.kroombox.com` di jendela browser Incognito. | Mode guest | Storefront terbuka sempurna dengan tema yang dipilih merchant tanpa meminta login admin CMS. | Critical | `Pass` ✅ |
| **TC-BYR-02** | Drawer / Keranjang Belanja (Cart Management) | Berada di halaman toko | 1. Pilih produk, tentukan kuantitas.<br>2. Klik "Tambah ke Keranjang".<br>3. Ubah kuantitas di keranjang (+ / -) atau hapus item. | Item: 2 pcs | Badge jumlah keranjang bertambah, subtotal terhitung akurat sesuai jumlah dan harga produk. | High | `Pass` ✅ |
| **TC-BYR-03** | Order Cepat via WhatsApp | Berada di halaman produk / checkout | 1. Klik tombol "Pesan via WhatsApp". | Nomor WA merchant terisi | Tautan WhatsApp (`https://wa.me/...`) terbuka berisi draft pesan terformat rapi berisi daftar item, harga, dan instruksi pesanan. | Medium | `Pass` ✅ |
| **TC-BYR-04** | Navigasi Menuju Halaman Checkout / Pengiriman | Ada item di keranjang | 1. Klik tombol "Lanjut ke Pembayaran / Checkout". | Keranjang aktif | Pengguna diarahkan ke halaman pengisian data penerima dan alamat pengiriman (`/checkout` atau `/address`). | High | `Pass` ✅ |

---

## Modul 8: Alamat, Pengiriman & Ekspedisi (Biteship API)

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-SHP-01** | Pengisian Form Data Penerima & Alamat | Berada di halaman Address / Checkout | 1. Isi nama penerima, no. telepon valid, alamat jalan lengkap.<br>2. Pilih Provinsi, Kota/Kabupaten, dan Kecamatan dari dropdown. | Nama: "Ani"<br>Telp: "081311112222"<br>Kota: "Jakarta Selatan" | Data tersimpan di state checkout dan form tervalidasi lengkap. | High | `Pass` ✅ |
| **TC-SHP-02** | Kalkulasi Tarif Ongkir via Backend Proxy (`POST /api/shipping/rates`) | Alamat asal (toko) & tujuan terisi | 1. Sistem mengirim request kalkulasi tarif ekspedisi.<br>2. Amati daftar opsi pengiriman yang muncul. | Berat total: 600gr | Backend memanggil Biteship API secara aman tanpa membocorkan API key. Daftar kurir (JNE, SiCepat, J&T) muncul dengan estimasi tarif dan hari. | High | `Pass` ✅ |
| **TC-SHP-03** | Pemilihan Layanan Kurir & Penambahan ke Total Pembayaran | Daftar ongkir tampil | 1. Pilih salah satu layanan kurir (contoh: JNE Reguler Rp 18.000). | Opsi kurir terpilih | Nilai ongkir otomatis ditambahkan ke Grand Total: `Total Akhir = Subtotal Produk + Ongkir`. | High | `Pass` ✅ |
| **TC-SHP-04** | Fallback Ketika API Ekspedisi Mengalami Kendala | Alamat terpencil / API timeout | 1. Simulasikan kegagalan koneksi atau kode pos tidak terjangkau. | Alamat tidak valid | Sistem menampilkan opsi fallback yang ramah (misal: "Tarif Standar / Hubungi Penjual") tanpa memblokir pembeli. | Medium | `Pass` ✅ |

---

## Modul 9: Payment Gateway (Midtrans Snap & Duitku)

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-PAY-01** | Generate Midtrans Snap Token (`POST /api/midtrans/snap-token`) | Checkout siap bayar dengan metode Midtrans | 1. Klik "Bayar Sekarang".<br>2. Backend memvalidasi `grossAmount > 0` dan sanitasi data penerima. | Nominal: Rp 168.000 | Backend Express / dev middleware menghasilkan Snap Token dan me-return ke antarmuka pembeli. | Critical | `Pass` ✅ |
| **TC-PAY-02** | Tampilan Modal Snap & Simulasi Pembayaran Sukses (Sandbox) | Snap token diterima | 1. Modal Snap popup terbuka.<br>2. Pilih QRIS / Virtual Account.<br>3. Selesaikan simulasi bayar di simulator Midtrans. | Midtrans Sandbox Simulator | Transaksi status berubah menjadi `settlement`, modal popup menutup, pembeli diarahkan ke halaman invoice sukses. | Critical | `Pass` ✅ |
| **TC-PAY-03** | Verifikasi Webhook Notifikasi Midtrans (`POST /api/midtrans/notification`) | Transaksi selesai di Midtrans | 1. Midtrans mengirim callback POST berisi `signature_key` (SHA-512).<br>2. Backend memverifikasi keaslian signature. | Hash signature valid | Status order di Supabase diperbarui menjadi `paid`. Jika hash tidak cocok, request dibalas HTTP 403 Forbidden. | Critical | `Pass` ✅ |
| **TC-PAY-04** | Pembuatan Invoice Duitku (`POST /api/duitku/create-invoice`) | Checkout siap bayar dengan metode Duitku | 1. Pilih opsi pembayaran Duitku (QRIS/VA).<br>2. Submit pesanan. | Kode metode: `SP` (QRIS) / `BC` (BCA VA) | Endpoint menghasilkan payment URL atau nomor VA resmi dari Duitku API. | High | `Pass` ✅ |
| **TC-PAY-05** | Pengecekan Status Transaksi Duitku (`POST /api/duitku/check-status`) | Invoice Duitku aktif | 1. Sistem memeriksa status transaksi berkala via `orderId`. | `merchantOrderId` | Status pembayaran terupdate saat pembeli menyelesaikan pembayaran di kanal Duitku. | High | `Pass` ✅ |
| **TC-PAY-06** | Penanganan Transaksi Batal / Expired | Modal bayar terbuka | 1. Pembeli menutup popup pembayaran atau melewati batas waktu (15 menit). | Pembatalan transaksi | Status pesanan menjadi `cancelled` atau `expired`, tidak ada saldo atau order yang tertahan tanpa kejelasan. | Medium | `Pass` ✅ |

---

## Modul 10: Manajemen Pesanan & Logistik Merchant

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-ORD-01** | Notifikasi Pesanan Baru Masuk | Pembeli berhasil membayar | 1. Login ke panel merchant > menu `/orders`. | Order status `paid` | Pesanan baru tampil di daftar teratas dengan badge "Perlu Diproses". | High | `Pass` ✅ |
| **TC-ORD-02** | Rincian Lengkap Pesanan (Detail Modal) | Ada pesanan masuk | 1. Klik salah satu pesanan.<br>2. Periksa detail: item produk, varian, alamat tujuan, pilihan kurir, dan no kontak. | Modal detail order | Semua informasi pesanan tampil rapi dan akurat sesuai data yang diinput pembeli. | Medium | `Pass` ✅ |
| **TC-ORD-03** | Update Status & Input Nomor Resi Pengiriman | Pesanan siap dikirim | 1. Ubah status pesanan menjadi "Dikirim".<br>2. Input nomor resi kurir (misal: `JNE1234567890`).<br>3. Klik Simpan. | No Resi: `JNE1234567890` | Nomor resi tersimpan di database, status pesanan terupdate, email notifikasi resi terkirim ke pembeli jika SMTP aktif. | High | `Pass` ✅ |
| **TC-ORD-04** | Filter & Pencarian Pesanan | Banyak data pesanan | 1. Cari pesanan berdasarkan nama pembeli atau ID pesanan.<br>2. Filter berdasarkan status: Menunggu Pembayaran, Perlu Diproses, Dikirim, Selesai. | Filter: "Perlu Diproses" | Tabel hanya menampilkan pesanan yang sesuai kriteria filter. | Low | `Pass` ✅ |

---

## Modul 11: Billing, Langganan Paket & Payout / Penarikan

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-BIL-01** | Informasi Kuota Paket Aktif | Login merchant, buka menu `/billing` | 1. Periksa kartu paket aktif saat ini (Free/Pro/Enterprise).<br>2. Periksa sisa kuota produk yang digunakan. | Paket aktif | Informasi paket, batas kuota, dan fitur yang aktif ditampilkan secara transparan. | Medium | `Pass` ✅ |
| **TC-BIL-02** | Pengajuan Penarikan Saldo (Withdrawal) | Saldo penjualan mencukupi batas minimal | 1. Klik tombol "Tarik Saldo".<br>2. Masukkan nama bank, nomor rekening, nama pemilik, dan nominal penarikan.<br>3. Submit permohonan. | Nominal: Rp 500.000<br>Bank: BCA | Permohonan penarikan tercatat dengan status "Pending" dan masuk ke antrean Super Admin. Saldo aktif disesuaikan. | High | `Pass` ✅ |
| **TC-BIL-03** | Riwayat Transaksi Billing & Invoice | Halaman billing | 1. Buka tab Riwayat Tagihan. | Log transaksi | Semua transaksi upgrade atau pembayaran biaya langganan tercatat dalam tabel invoice. | Low | `Pass` ✅ |

---

## Modul 12: Super Admin Platform Panel

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-ADM-01** | Akses Panel & Ringkasan Metrik Platform | Login dengan akun role `super_admin`, buka `/admin` | 1. Buka dashboard overview admin.<br>2. Periksa kartu KPI: Total Merchant, Total Toko, Total Transaksi, Pendapatan Platform. | Akun Admin | Dashboard merender angka analitik agregat dari seluruh tenant secara akurat. | High | `Pass` ✅ |
| **TC-ADM-02** | Manajemen & Moderasi Toko Merchant | Berada di Tab Toko (`AdminStoresTab`) | 1. Cari toko berdasarkan nama/slug.<br>2. Lakukan uji suspend/nonaktifkan toko yang melanggar aturan. | Slug toko target | Status toko diubah menjadi non-aktif / suspended; akses publik storefront dinonaktifkan. | High | `Pass` ✅ |
| **TC-ADM-03** | Persetujuan Penarikan Dana (`AdminWithdrawalsTab`) | Ada permintaan penarikan dari merchant | 1. Buka tab Penarikan Dana.<br>2. Tinjau permohonan merchant, klik tombol "Selesaikan / Approve". | ID Penarikan | Status penarikan berubah menjadi "Selesai", riwayat transaksi terupdate. | High | `Pass` ✅ |
| **TC-ADM-04** | Pengaturan Platform & Kunci Gateway | Tab Pengaturan Admin (`AdminSettingsTab`) | 1. Periksa konfigurasi kunci API Midtrans, Duitku, dan Biteship.<br>2. Simpan perubahan. | Kunci konfigurasi | Pengaturan global platform tersimpan aman di tabel `platform_settings`. | Critical | `Pass` ✅ |

---

## Modul 13: Keamanan, API Guard & Performa

| ID Kasus | Deskripsi Skenario | Prasyarat | Langkah-Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Severity | Status |
|---|---|---|---|---|---|:---:|:---:|
| **TC-SEC-01** | Perlindungan Kunci Rahasia Server (No Leakage) | Aplikasi berjalan | 1. Buka Chrome DevTools > Network tab & Application storage.<br>2. Cari string rahasia: `MIDTRANS_SERVER_KEY`, `BITESHIP_API_KEY`, DB password. | Kredensial rahasia | Seluruh kunci rahasia server **TIDAK PERNAH** terkirim atau terlihat di browser klien. | Critical | `Pass` ✅ |
| **TC-SEC-02** | Validasi Sisi Server untuk Nilai Transaksi | Request snap token pembayaran | 1. Coba manipulasi nilai `grossAmount` menjadi minus, 0, atau teks non-angka via HTTP client. | `grossAmount`: -50000 | Backend memvalidasi dan mengembalikan status HTTP 400 Bad Request. | Critical | `Pass` ✅ |
| **TC-SEC-03** | Rate Limiting Endpoint Notifikasi Email | Backend berjalan | 1. Kirim request berulang ke `/api/send-email` (> 10 request dalam 1 menit). | IP pengirim | Request ke-11 dibatasi dengan respon HTTP 429 Too Many Requests. | High | `Pass` ✅ |
| **TC-SEC-04** | Sanitasi Masukan Teks & Proteksi XSS | Form input toko & produk | 1. Masukkan payload skrip: `<script>alert('xss')</script>` pada nama produk atau deskripsi. | Script injection | Teks ditampilkan sebagai string biasa (escaped) tanpa memicu eksekusi JavaScript berbahaya. | High | `Pass` ✅ |

---

## 🚀 PANDUAN PENGUJIAN CEPAT (SMOKE TEST 7 LANGKAH)

Jalankan 7 langkah berurutan ini untuk memvalidasi kesehatan inti aplikasi dalam waktu kurang dari 10 menit:

```
[1] Login / Registrasi  ──>  [2] Buat/Pilih Toko  ──>  [3] Kustomisasi Tema di Layout Editor
                                                                  │
                                                                  ▼
[6] Cek Pesanan Masuk <── [5] Checkout & Simulasi Bayar <── [4] Publish Toko (POST /api/deploy/publish)
        │
        ▼
[7] Verifikasi Panel Admin
```

1. **Autentikasi**: Buka `http://localhost:3000` (atau `https://kroomify.kroombox.com`), pastikan alur login/onboarding berjalan mulus.
2. **Katalog**: Masuk ke menu Produk, tambahkan 1 produk contoh dengan foto, harga, dan berat gram.
3. **Desain**: Buka menu Layout Editor, pilih tema (misal: *Minimalist*), ganti warna aksen, klik **Simpan Desain**.
4. **Publish**: Klik tombol **"Publish Toko"**, pastikan 3 checklist tahap deploy berhasil (Katalog, VHost, Cloudflare).
5. **Storefront**: Buka URL subdomain `https://<slug>.kroombox.com`, pastikan halaman toko dan katalog produk terbuka dengan status HTTP 200 OK.
6. **Checkout & Pembayaran**: Lakukan checkout produk, masukkan alamat pengiriman, pilih kurir Biteship, selesaikan simulasi pembayaran Midtrans/Duitku Sandbox.
7. **Pesanan & Admin**: Buka menu Pesanan merchant untuk memeriksa pesanan baru berstatus "Perlu Diproses", lalu buka panel `/admin` untuk memastikan metrik transaksi tercatat.
