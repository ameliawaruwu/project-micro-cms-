# 📋 DAFTAR PENGUJIAN FITUR & TEST CASES (MICRO CMS KROOMIFY)

> **Dokumen Panduan Quality Assurance (QA) & Checklist Uji Fungsional**  
> Digunakan untuk memvalidasi seluruh alur kerja sistem Micro CMS Kroomify: Mulai dari onboarding merchant, visual theme editor, auto-deployment engine (Nginx & Cloudflare Tunnel), checkout storefront, gateway pembayaran Midtrans, ongkir Biteship, hingga Super Admin Panel.

---

## 📌 Ringkasan Parameter Pengujian

| Komponen | Target Uji | URL / Port / Path |
|---|---|---|
| **CMS Merchant & Admin** | Dashboard Web Application | `https://kroomify.kroombox.com` atau `http://localhost:3000` |
| **Storefront Toko Merchant** | Toko Publik Independen | `https://<slug>.kroombox.com` atau Custom Domain |
| **Backend API Daemon** | Express PM2 Process | Port `5055` (`kroomify-api`) & Nginx Gateway Port `8080` |
| **Database & Auth** | Supabase PostgreSQL + Auth | Supabase Cloud Instance (RLS Multi-tenant) |
| **Host Server** | Synology NAS DS923+ | `s_1789953949220_1ee44e` |

---

## 📊 Matriks Status Pengujian

- `[ ]` Belum Diuji (Untested)
- `[x]` Berhasil Lolos (Passed)
- `[!]` Ditemukan Bug / Perlu Perbaikan (Failed/Blocker)
- `[-]` Opsional / Dilewati (Skipped)

---

## Modul 1: Autentikasi, Akun & Multi-Tenant Onboarding

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-AUTH-01** | Registrasi Merchant Baru | 1. Buka halaman Register.<br>2. Masukkan email & password valid.<br>3. Submit form. | Akun terdaftar di Supabase Auth, merchant diarahkan ke wizard pembuatan toko. | `[ ]` |
| **TC-AUTH-02** | Validasi Password Lemah & Email Duplikat | 1. Masukkan password < 6 karakter atau email yang sudah terdaftar. | Tampil pesan error validasi yang jelas tanpa crash. | `[ ]` |
| **TC-AUTH-03** | Login Merchant & Admin | 1. Input email & password yang sudah terverifikasi.<br>2. Klik Login. | Sesi JWT tersimpan, merchant diarahkan ke `/dashboard`, super admin ke `/admin`. | `[ ]` |
| **TC-AUTH-04** | Proteksi Route / Guard Halaman | 1. Coba akses URL `/dashboard` tanpa login.<br>2. Coba akses `/admin` dengan akun merchant biasa. | Non-login diarahkan ke `/login`. Akun non-admin dilarang mengakses `/admin` (403/Redirect). | `[ ]` |
| **TC-AUTH-05** | Isolasi Data Tenant (RLS PostgreSQL) | 1. Login sebagai Merchant A.<br>2. Periksa apakah produk/pesanan Merchant B bisa diakses via API/Query. | Data hanya terisolasi pada `store_id` milik akun yang sedang login. RLS memblokir data tenant lain. | `[ ]` |
| **TC-AUTH-06** | Logout Pengguna | 1. Klik tombol Logout di sidebar/profil. | Sesi dibersihkan dari local storage/cookie, redirect ke halaman login atau landing page. | `[ ]` |

---

## Modul 2: Manajemen Profil Toko & Pengaturan

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-SET-01** | Inisialisasi Toko Pertama | 1. Isi nama toko, kategori, dan tentukan `slug` toko (contoh: `tokoku`). | Slug divalidasi keunikan karakternya (hanya huruf kecil, angka, dan strip). Record toko berhasil dibuat. | `[ ]` |
| **TC-SET-02** | Edit Informasi & Kontak Toko | 1. Ubah nomor WhatsApp, deskripsi, alamat fisik, dan logo toko.<br>2. Klik Simpan. | Data di Supabase `stores` terupdate dan langsung terefleksi di form. | `[ ]` |
| **TC-SET-03** | Upload Logo & Favicon Toko | 1. Unggah file gambar format PNG/WebP (< 2MB). | Gambar terunggah ke Supabase Storage bucket, URL tersimpan di profil toko. | `[ ]` |
| **TC-SET-04** | Pengaturan Mata Uang & Format | 1. Ubah format mata uang atau teks deskripsi singkat toko. | Format harga pada dashboard & storefront tampil konsisten (contoh: `Rp 50.000`). | `[ ]` |

---

## Modul 3: Manajemen Produk & Katalog

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-PROD-01** | Tambah Produk Baru | 1. Buka menu Produk > Tambah Produk.<br>2. Isi nama, harga, stok, berat produk (gram), deskripsi, dan upload 1-3 gambar.<br>3. Klik Simpan. | Produk baru tersimpan di database dan muncul di daftar produk merchant. | `[ ]` |
| **TC-PROD-02** | Validasi Input Wajib Produk | 1. Kosongkan harga atau nama produk lalu klik Simpan. | Form memunculkan peringatan field wajib dan mencegah submit data invalid. | `[ ]` |
| **TC-PROD-03** | Edit & Perbarui Data Produk | 1. Pilih salah satu produk, ubah harga dan stok.<br>2. Simpan perubahan. | Data produk terupdate secara real-time di tabel daftar produk. | `[ ]` |
| **TC-PROD-04** | Hapus Produk | 1. Klik ikon hapus produk dan konfirmasi pada dialog modal. | Produk terhapus dari daftar dan tidak lagi muncul di etalase toko. | `[ ]` |
| **TC-PROD-05** | Pencarian & Filter Produk | 1. Cari produk berdasarkan kata kunci.<br>2. Filter berdasarkan status (Aktif / Nonaktif) atau stok habis. | Daftar produk terfilter secara akurat sesuai kata kunci. | `[ ]` |
| **TC-PROD-06** | Pengaturan Berat Produk untuk Ongkir | 1. Atur berat produk (misal: 500 gr). | Berat produk tersimpan dan akan digunakan saat kalkulasi tarif Biteship. | `[ ]` |

---

## Modul 4: Visual Theme & Layout Editor (CMS Studio)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-THM-01** | Pemilihan Tema (10 Tema Aktif) | 1. Buka Layout Editor.<br>2. Uji ganti tema: Minimalist, Bold, Creative, Cute, Editorial, Elegant, Fashion, Futuristic, Luxury, Nature, Professional. | Pratinjau kanvas langsung merender komponen tema yang dipilih secara dinamis. | `[ ]` |
| **TC-THM-02** | Kustomisasi Palet Warna & Font | 1. Ubah Primary Color, Secondary Color, Accent Color, dan pilihan Font Google. | Preview kanvas langsung merefleksikan perubahan warna dan tipografi secara instan. | `[ ]` |
| **TC-THM-03** | Edit Banner & Headline Hero | 1. Ubah teks Headline, Sub-headline, dan ganti gambar Hero Banner. | Gambar dan teks hero section terupdate di preview kanvas. | `[ ]` |
| **TC-THM-04** | Pengaturan Seksi & Story Blocks | 1. Aktifkan/Nonaktifkan seksi Story Block, Testimonial, atau Featured Products.<br>2. Ubah urutan tata letak seksi. | Struktur tata letak halaman storefront berubah sesuai susunan yang ditentukan. | `[ ]` |
| **TC-THM-05** | Responsive Preview Mode | 1. Klik tombol toggle preview: Desktop, Tablet, dan Mobile. | Kanvas preview menyesuaikan lebar viewport (responsive container) dengan mulus. | `[ ]` |
| **TC-THM-06** | Simpan Desain & Layout | 1. Klik tombol "Simpan Desain". | Konfigurasi JSON tema tersimpan di kolom `theme_settings` pada tabel `stores`. | `[ ]` |

---

## Modul 5: Auto-Deployer Engine & Publikasi Toko (Physical Infrastructure)

> [!IMPORTANT]
> **Kritikal:** Fitur ini mengeksekusi pembuatan file fisik di NAS, konfigurasi Nginx vhost, dan Cloudflare Tunnel ingress via backend daemon `:5055`.

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-DEP-01** | Modal Publikasi Toko | 1. Di Layout Editor atau Dashboard, klik tombol "Publish Toko". | Modal PublishStoreModal terbuka, menampilkan info subdomain `https://<slug>.kroombox.com`. | `[ ]` |
| **TC-DEP-02** | Eksekusi Publish (`POST /api/deploy/publish`) | 1. Klik tombol konfirmasi "Publish Sekarang".<br>2. Amati progress bar tahapan publikasi. | Frontend mengirim request ke backend `:5055`. Seluruh tahapan checklist sukses tanpa error: Stage 1 (Katalog), Stage 2 (VHost Nginx), Stage 3 (Cloudflare Edge). | `[ ]` |
| **TC-DEP-03** | Verifikasi File Fisik & Symlink di NAS | 1. Cek folder NAS: `/volume1/web/www/KroomBox/kroomify/sites/<slug>/`. | Terbentuk file `store.json`, `products.json`, `index.html` (terinjeksi OpenGraph metadata), dan symlink `assets -> ../../engine/dist/assets`. | `[ ]` |
| **TC-DEP-04** | Verifikasi Nginx VHost & Reload | 1. Cek konfigurasi Nginx di NAS: `/etc/nginx/sites-available/kroomify-<slug>.conf`.<br>2. Pastikan symlink aktif di `sites-enabled/`. | Konfigurasi Nginx valid (`nginx -t` lulus), reload Nginx sukses. | `[ ]` |
| **TC-DEP-05** | Verifikasi Akses Publik Storefront | 1. Buka browser dan akses `https://<slug>.kroombox.com`. | Halaman etalase toko terbuka dengan HTTP 200 OK (BUKAN halaman default *Kroombox - Success*). | `[ ]` |
| **TC-DEP-06** | Tombol "Kunjungi Toko" di Modal | 1. Setelah publish sukses, klik tombol "Kunjungi Toko" di modal. | Membuka tab baru (`target="_blank"`) mengarah langsung ke domain toko tanpa error. | `[ ]` |
| **TC-DEP-07** | Unpublish Toko (`POST /api/deploy/unpublish`) | 1. Klik "Unpublish Toko" di Settings / Modal.<br>2. Konfirmasi tindakan. | Endpoint `/api/deploy/unpublish` dipanggil, symlink vhost Nginx dilepas, reload Nginx, toko offline. | `[ ]` |

---

## Modul 6: Storefront Publik & Pengalaman Pembeli (Buyer Experience)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-STR-01** | Rendering Katalog Publik | 1. Akses `https://<slug>.kroombox.com` sebagai pembeli umum (tanpa login). | Storefront menampilkan katalog produk, harga, banner, dan identitas toko sesuai tema yang dipilih. | `[ ]` |
| **TC-STR-02** | Detail Produk & Pratinjau Gambar | 1. Klik salah satu kartu produk. | Tampil modal/halaman detail produk: deskripsi lengkap, harga, pilihan kuantitas, dan galeri foto. | `[ ]` |
| **TC-STR-03** | Keranjang Belanja (Cart Management) | 1. Klik "Tambah ke Keranjang".<br>2. Buka drawer/halaman keranjang.<br>3. Tambah/kurang kuantitas item atau hapus item. | Subtotal dan jumlah total item diperbarui secara akurat di keranjang belanja. | `[ ]` |
| **TC-STR-04** | Direct Order via WhatsApp | 1. Klik tombol "Beli via WhatsApp". | Browser membuka tautan WhatsApp dengan pesan otomatis terformat rapi berisi rincian item & alamat. | `[ ]` |
| **TC-STR-05** | Form Checkout & Data Penerima | 1. Lanjut ke proses Checkout.<br>2. Isi nama penerima, no. telepon, alamat lengkap, dan pilih kota/kecamatan pengiriman. | Form tervalidasi dan siap untuk kalkulasi ongkos kirim. | `[ ]` |

---

## Modul 7: Integrasi Ongkos Kirim (Biteship API)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-SHP-01** | Kalkulasi Ongkir (`POST /api/shipping/rates`) | 1. Masukkan alamat pengiriman pembeli.<br>2. Request estimasi tarif ongkir. | Backend Express mem-proxy request ke Biteship API tanpa mengekspos API Key ke browser. | `[ ]` |
| **TC-SHP-02** | Pilihan Opsi Kurir | 1. Periksa daftar opsi ekspedisi yang muncul (JNE, SiCepat, J&T, dll.). | Muncul pilihan kurir lengkap dengan nama layanan, estimasi hari pengiriman, dan biaya ongkir. | `[ ]` |
| **TC-SHP-03** | Pemilihan Opsi Ongkir & Update Total | 1. Pilih salah satu layanan kurir. | Biaya ongkir ditambahkan ke Grand Total pesanan secara otomatis dan akurat. | `[ ]` |
| **TC-SHP-04** | Fallback Ketika API Ongkir Terkendala | 1. Simulasikan alamat di luar jangkauan atau API Biteship timeout. | Tampil pesan fallback yang ramah (misal: "Hubungi Penjual untuk cek ongkir manual"). | `[ ]` |

---

## Modul 8: Transaksi & Payment Gateway (Midtrans Snap & Manual)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-PAY-01** | Generate Snap Token (`POST /api/midtrans/snap-token`) | 1. Klik tombol "Bayar Sekarang" di halaman checkout. | Backend memvalidasi `grossAmount > 0`, mengirim kredensial aman ke Midtrans, dan mengembalikan Snap Token. | `[ ]` |
| **TC-PAY-02** | Tampilan Midtrans Snap Popup | 1. Terima token dan picu `window.snap.pay()`. | Modal antarmuka Midtrans terbuka menampilkan kanal pembayaran (QRIS, BCA VA, Mandiri, GoPay). | `[ ]` |
| **TC-PAY-03** | Uji Pembayaran Sukses (Sandbox Simulator) | 1. Selesaikan pembayaran menggunakan simulator QRIS / VA Sandbox. | Status pembayaran di UI terupdate menjadi "Pembayaran Berhasil", halaman terima kasih ditampilkan. | `[ ]` |
| **TC-PAY-04** | Webhook Notifikasi Midtrans (`POST /api/midtrans/notification`) | 1. Midtrans mengirim callback notification ke backend server. | Backend memvalidasi SHA-512 signature hash, status order di database terupdate menjadi `paid` / `settlement`. | `[ ]` |
| **TC-PAY-05** | Skenario Pembayaran Kedaluwarsa / Batal | 1. Batalkan transaksi pada popup atau biarkan waktu pembayaran habis. | Status order diperbarui menjadi `cancelled` atau `expired`, stok produk dikembalikan jika ada reservasi. | `[ ]` |
| **TC-PAY-06** | Metode Transfer Manual / Bank Mandiri Toko | 1. Pilih opsi pembayaran "Transfer Bank Manual". | Tampil nomor rekening merchant & instruksi transfer serta tombol konfirmasi kirim bukti bayar. | `[ ]` |

---

## Modul 9: Manajemen Pesanan & Logistik (Merchant View)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-ORD-01** | Daftar Pesanan Masuk (Order List) | 1. Buka menu Pesanan di panel merchant. | Pesanan baru yang dibayar pembeli muncul di baris teratas dengan status "Perlu Diproses". | `[ ]` |
| **TC-ORD-02** | Rincian Pesanan (Order Details) | 1. Klik salah satu pesanan untuk melihat detail. | Menampilkan informasi lengkap pembeli, daftar item yang dibeli, pilihan kurir, dan bukti/status bayar. | `[ ]` |
| **TC-ORD-03** | Update Status Pesanan & Input Resi | 1. Ubah status pesanan menjadi "Dikirim".<br>2. Masukkan nomor resi ekspedisi.<br>3. Simpan. | Nomor resi tersimpan, status berubah menjadi "Dikirim". | `[ ]` |
| **TC-ORD-04** | Notifikasi Email Transaksi (`POST /api/send-email`) | 1. Lakukan perubahan status atau order selesai. | Endpoint email terpanggil, mengirim email invoice/resi kepada pembeli secara asynchronous. | `[ ]` |
| **TC-ORD-05** | Filter & Ekspor Pesanan | 1. Filter pesanan berdasarkan rentang tanggal atau status.<br>2. Klik tombol Export CSV/Excel (jika tersedia). | Data pesanan terfilter dengan benar dan dapat diunduh tanpa kerusakan karakter. | `[ ]` |

---

## Modul 10: Pengaturan Custom Domain

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-DOM-01** | Pengajuan Custom Domain oleh Merchant | 1. Buka menu Domain di panel merchant.<br>2. Masukkan nama domain (contoh: `tokosaya.com`).<br>3. Submit permohonan. | Sistem menampilkan petunjuk DNS CNAME pointing ke `kroombox.com`. Status menjadi "Pending Verification". | `[ ]` |
| **TC-DOM-02** | Validasi Format Domain | 1. Masukkan format domain tidak valid (misal mengandung spasi atau karakter ilegal). | Sistem menampilkan validasi error regex domain. | `[ ]` |
| **TC-DOM-03** | Persetujuan Domain oleh Super Admin | 1. Login ke panel Admin > Tab Permohonan Domain.<br>2. Setujui permintaan domain merchant. | Status domain berubah menjadi "Approved/Active", Cloudflare deployer mendaftarkan hostname kustom. | `[ ]` |
| **TC-DOM-04** | Uji Akses via Custom Domain | 1. Arahkan DNS dan akses `https://tokosaya.com`. | Domain kustom menyajikan storefront merchant yang bersangkutan secara aman (HTTPS / SSL valid). | `[ ]` |

---

## Modul 11: Billing, Langganan Paket & Dompet Merchant

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-BIL-01** | Tampilan Paket Langganan | 1. Buka menu Billing & Langganan. | Menampilkan paket aktif saat ini (Free/Pro/Enterprise) beserta kuota dan masa aktif langganan. | `[ ]` |
| **TC-BIL-02** | Upgrade Paket Langganan | 1. Pilih paket Pro/Enterprise dan klik Upgrade.<br>2. Lakukan proses pembayaran. | Setelah sukses, paket toko ter-upgrade dan fitur eksklusif (misal: custom domain, unlimited produk) terbuka. | `[ ]` |
| **TC-BIL-03** | Riwayat Tagihan / Invoice | 1. Buka tab Riwayat Transaksi Billing. | Invoice pembayaran paket tercatat lengkap dengan nominal, tanggal, dan status "Paid". | `[ ]` |
| **TC-BIL-04** | Permintaan Penarikan Saldo (Withdrawal) | 1. Merchant mengajukan penarikan saldo pendapatan toko.<br>2. Masukkan nomor rekening tujuan dan nominal. | Saldo berkurang, record permohonan penarikan berstatus "Pending" masuk ke antrean Super Admin. | `[ ]` |

---

## Modul 12: Super Admin Panel Dashboard

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-ADM-01** | Overview Metrik & Statistik Platform | 1. Akses menu Admin Overview. | Tampil ringkasan KPI: Total Merchant, Total Toko Aktif, Volume Transaksi (GMV), dan Permohonan Pending. | `[ ]` |
| **TC-ADM-02** | Manajemen Toko (Admin Stores Tab) | 1. Buka tab Toko.<br>2. Cari nama toko atau filter toko aktif/nonaktif.<br>3. Uji aksi suspend/nonaktifkan toko nakal. | Toko berhasil disuspend, akses storefront toko dinonaktifkan secara otomatis. | `[ ]` |
| **TC-ADM-03** | Moderasi Permohonan Custom Domain | 1. Buka tab Permohonan Domain.<br>2. Tinjau domain yang diajukan, klik Approve atau Reject. | Status terupdate di sisi merchant dan routing edge Cloudflare terkonfigurasi. | `[ ]` |
| **TC-ADM-04** | Manajemen Paket & Harga (Admin Plans Tab) | 1. Buka tab Paket Langganan.<br>2. Edit batas produk, harga bulanan, atau fitur paket. | Paket terupdate dan berlaku bagi merchant yang akan berlangganan. | `[ ]` |
| **TC-ADM-05** | Persetujuan Penarikan Dana (Withdrawals Tab) | 1. Buka tab Penarikan Dana.<br>2. Verifikasi bukti transfer ke rekening merchant, klik "Selesaikan/Approve". | Status penarikan berubah menjadi "Selesai", notifikasi terkirim ke merchant. | `[ ]` |
| **TC-ADM-06** | Pengaturan Global Platform (Settings Tab) | 1. Ubah konfigurasi kontak admin, email gateway, atau parameter platform fee. | Pengaturan global tersimpan aman di database. | `[ ]` |

---

## Modul 13: Keamanan, Performa & Penanganan Error (Resilience)

| ID Kasus | Fitur / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **TC-SEC-01** | Proteksi Kredensial Backend (Server-side Secrets) | 1. Inspeksi source code frontend di tab Network & Elements browser. | Kunci rahasia sensitif (`MIDTRANS_SERVER_KEY`, `BITESHIP_API_KEY`, DB password) tidak bocor ke client. | `[ ]` |
| **TC-SEC-02** | Rate Limiting Endpoint Email & Notifikasi | 1. Kirim lebih dari 10 request ke `/api/send-email` dalam tempo 1 menit dari 1 IP. | Request ke-11 diblokir dengan respon `HTTP 429 Too Many Requests`. | `[ ]` |
| **TC-SEC-03** | Sanitasi Input & XSS Protection | 1. Masukkan skrip HTML/JS pada nama produk (contoh: `<script>alert(1)</script>`). | Teks tersanitasi aman dan dirender sebagai plain text tanpa mengeksekusi script. | `[ ]` |
| **TC-SEC-04** | Uji Coba Offline / Network Disconnect | 1. Matikan koneksi internet saat mengedit form layout atau produk. | Aplikasi menampilkan notifikasi toast error jaringan yang informatif tanpa crash layar putih. | `[ ]` |
| **TC-SEC-05** | Performa Pemuatan Aset Storefront | 1. Buka storefront toko di Chrome DevTools > Network tab (kondisi Fast 3G). | Ukuran bundel CSS/JS terkompresi (gzip/brotli), gambar responsif dimuat optimal, waktu interaktif cepat. | `[ ]` |

---

## 🛠️ Lembar Rekomendasi Alur Verifikasi Cepat (Smoke Test 10 Menit)

Jika Anda ingin melakukan verifikasi kesehatan utama secara cepat, jalankan 7 langkah berurutan ini:

```
[1] Login Merchant  ──>  [2] Buat/Edit Produk  ──>  [3] Kustomisasi Tema di Layout Editor
                                                                  │
                                                                  ▼
[6] Cek Pesanan Masuk <── [5] Checkout & Simulasi Bayar <── [4] Publish Toko (POST /api/deploy/publish)
        │
        ▼
[7] Cek Panel Super Admin
```

1. **Login & Autentikasi**: Pastikan bisa login ke `http://localhost:3000` atau domain CMS.
2. **Katalog**: Tambah 1 produk tes dengan foto dan harga.
3. **Editor Desain**: Pilih tema (misal: *Minimalist*), ganti warna utama, klik Simpan Desain.
4. **Auto-Deployer**: Klik tombol **"Publish Toko"**, pastikan 3 stage publikasi sukses centang hijau.
5. **Akses Storefront**: Buka URL toko `https://<slug>.kroombox.com`, pastikan katalog tampil utuh.
6. **Checkout & Pembayaran**: Tambahkan produk ke keranjang, isi data, pilih kurir Biteship, bayar via Midtrans Sandbox.
7. **Verifikasi Pesanan**: Pastikan pesanan masuk di menu Pesanan merchant dengan status "Lunas / Perlu Diproses".
