# LapakQ Public API v1 — Dokumentasi Integrasi Data Komunitas, Toko & Produk (Read-Only)

Dokumentasi resmi integrasi antarmuka pemrograman aplikasi (**RESTful API**) LapakQ untuk pengembang, mitra, aplikasi pihak ketiga (mobile/web), dan komunitas binaan.

---

## 1. Ringkasan & Aturan Keamanan Mutlak (Strict Read-Only)

1. **Strictly Read-Only (Hanya Metode GET):**
   - Seluruh endpoint API **HANYA** mendukung metode **`GET`**.
   - Setiap upaya request menggunakan metode **`POST`**, **`PUT`**, **`PATCH`**, atau **`DELETE`** akan **langsung ditolak** oleh middleware server dengan HTTP status **`405 Method Not Allowed`**.
   - API ini ditujukan murni untuk konsumsi data katalog (komunitas, profil toko, dan data produk) tanpa hak akses menulis data.
2. **Autentikasi Fleksibel (API Key & Public Access):**
   - Mendukung autentikasi via **Header HTTP**: `X-API-Key: <YOUR_API_KEY>`
   - Mendukung autentikasi via **Query Parameter**: `?apiKey=<YOUR_API_KEY>` atau `?api_key=<YOUR_API_KEY>`
   - Mendukung **Akses Publik Bebas**: Tanpa menyertakan API Key, endpoint tetap dapat diakses secara publik untuk membaca katalog toko dan produk yang aktif/terpublikasi.
3. **Perlindungan Privasi & Data Sensitif (Zero Sensitive Exposure):**
   - Kata sandi / hash password, email login admin/koordinator, nomor rekening bank, dan saldo dompet internal **sama sekali tidak diekspos** di dalam response JSON publik.

---

## 2. Lingkungan & Base URL

| Lingkungan | Base URL | Keterangan |
|---|---|---|
| **Production (Live Server)** | `https://lapakq.com` atau `https://kroomify.kroombox.com` | Base URL resmi server produksi |
| **Development (Lokal)** | `http://localhost:5055` | Base URL server Express lokal |

Semua endpoint API v1 berada di bawah prefix: **`/api/v1`**.

---

## 3. Autentikasi & Format Request

### A. Menggunakan Header HTTP (Rekomendasi):
```http
GET /api/v1/communities HTTP/1.1
Host: lapakq.com
X-API-Key: YOUR_API_KEY_HERE
Accept: application/json
```

### B. Menggunakan URL Query Parameter (Mudah untuk Uji Coba Browser):
```
https://lapakq.com/api/v1/communities?apiKey=YOUR_API_KEY_HERE
```

### Panduan Kunci API:
* **API Key Resmi:** Diberikan oleh Administrator platform atau didapatkan saat mendaftarkan organisasi/komunitas binaan.
* Simpan API Key Anda di file environment server (`.env`) dan jangan mempublikasikannya secara terbuka di repositori publik.

### Respon Penolakan Metode Non-GET (HTTP 405 Method Not Allowed):
```json
{
  "success": false,
  "code": "METHOD_NOT_ALLOWED",
  "message": "Metode POST tidak diizinkan. Seluruh endpoint API Key publik hanya mendukung metode GET (Read Only). Penambahan (POST), pengubahan (PUT/PATCH), maupun penghapusan (DELETE) data tidak diperbolehkan."
}
```

---

## 4. Daftar Lengkap Endpoint API (GET Only)

### 4.1. Direktori & Dokumentasi API
Mendapatkan panduan interaktif dan daftar seluruh endpoint langsung dalam format JSON.
* **Method:** `GET`
* **Path:** `/api/v1` atau `/api/v1/docs`

---

### 4.2. Health Check
* **Method:** `GET`
* **Path:** `/api/v1/health`
* **Response Contoh (HTTP 200):**
```json
{
  "status": "ok",
  "service": "lapakq-read-only-api",
  "version": "1.0.0",
  "mode": "read_only_strictly_enforced",
  "timestamp": "2026-11-05T04:00:00.000Z"
}
```

---

### 4.3. KOMUNITAS: Mengambil Seluruh Komunitas
Mengambil daftar komunitas aktif yang terdaftar di platform beserta statistik total toko dan produk binaannya.

* **Method:** `GET`
* **Path:** `/api/v1/communities`
* **Query Parameters:**
  | Parameter | Tipe | Default | Keterangan |
  |---|---|---|---|
  | `search` | string | `""` | Cari nama komunitas, slug, atau deskripsi |
  | `status` | string | `"active"` | Filter status komunitas (`active`, `pending`, atau `all`) |
  | `page` | number | `1` | Nomor halaman (mulai 1) |
  | `limit` | number | `20` | Jumlah baris per halaman (maks 100) |

* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/communities?status=active" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

* **Response Contoh (HTTP 200):**
```json
{
  "success": true,
  "code": "COMMUNITIES_FETCHED",
  "message": "Daftar komunitas berhasil diambil.",
  "data": [
    {
      "id": "comm_1793843915683",
      "name": "GMPS",
      "slug": "gmps",
      "description": "GMPS adalah perkumpulan Organisasi Kepemudaan (OKP)...",
      "logoUrl": null,
      "baseDomain": "gmpsbandung.org",
      "status": "active",
      "turnoverFeePercent": 2.5,
      "coordinator": {
        "name": "Admin 2",
        "phoneWhatsApp": "0881022084792"
      },
      "subAdmin": {
        "name": "Admin 1",
        "phoneWhatsApp": "0881022084791"
      },
      "totalStores": 12,
      "totalProducts": 48,
      "createdAt": "2026-11-05T01:58:35.688Z",
      "updatedAt": "2026-11-05T02:56:31.490Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.4. KOMUNITAS: Mengambil Detail Satu Komunitas
Mengambil informasi lengkap satu komunitas berdasarkan **ID Komunitas** atau **Slug**.

* **Method:** `GET`
* **Path:** `/api/v1/communities/:idOrSlug`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/communities/gmps"
```
* **Response Contoh (HTTP 200):**
```json
{
  "success": true,
  "code": "COMMUNITY_FETCHED",
  "message": "Detail komunitas berhasil diambil.",
  "data": {
    "id": "comm_1793843915683",
    "name": "GMPS",
    "slug": "gmps",
    "description": "GMPS adalah perkumpulan Organisasi Kepemudaan (OKP)...",
    "logoUrl": null,
    "baseDomain": "gmpsbandung.org",
    "status": "active",
    "turnoverFeePercent": 2.5,
    "coordinator": {
      "name": "Admin 2",
      "phoneWhatsApp": "0881022084792"
    },
    "subAdmin": {
      "name": "Admin 1",
      "phoneWhatsApp": "0881022084791"
    },
    "totalStores": 12,
    "totalProducts": 48,
    "createdAt": "2026-11-05T01:58:35.688Z",
    "updatedAt": "2026-11-05T02:56:31.490Z"
  }
}
```

---

### 4.5. KOMUNITAS: Mengambil Seluruh Toko di Bawah Komunitas
Mengambil seluruh toko binaan yang berada di naungan komunitas tertentu.

* **Method:** `GET`
* **Path:** `/api/v1/communities/:idOrSlug/stores`
* **Query Parameters:** `search`, `category`, `page`, `limit`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/communities/gmps/stores?page=1&limit=10"
```

---

### 4.6. KOMUNITAS: Mengambil Seluruh Produk di Bawah Komunitas
Mengambil seluruh katalog produk dari gabungan toko-toko binaan komunitas ini.

* **Method:** `GET`
* **Path:** `/api/v1/communities/:idOrSlug/products`
* **Query Parameters:** `search`, `category`, `status` (`available`/`out_of_stock`), `storeId`, `page`, `limit`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/communities/gmps/products?status=available"
```

---

### 4.7. TOKO: Mengambil Seluruh Toko (Store Directory)
Mengambil daftar toko di platform dengan opsi filter komunitas, kategori, pencarian nama, dan status publikasi.

* **Method:** `GET`
* **Path:** `/api/v1/stores`
* **Query Parameters:**
  | Parameter | Tipe | Default | Keterangan |
  |---|---|---|---|
  | `communitySlug` | string | `""` | Filter berdasarkan slug komunitas (contoh: `gmps`) |
  | `communityId` | string | `""` | Filter berdasarkan ID komunitas (contoh: `comm_1793843915683`) |
  | `category` | string | `""` | Filter kategori toko (contoh: `Kuliner`, `Fashion`, `Kerajinan`) |
  | `search` | string | `""` | Cari nama toko atau slug |
  | `isPublished` | boolean | `true` | Filter status toko yang telah dipublish |
  | `page` | number | `1` | Nomor halaman (mulai 1) |
  | `limit` | number | `20` | Jumlah per halaman (maks 100) |

* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/stores?communitySlug=gmps&isPublished=true"
```

* **Response Contoh (HTTP 200):**
```json
{
  "success": true,
  "code": "STORES_FETCHED",
  "message": "Daftar toko berhasil diambil.",
  "data": [
    {
      "id": "STR001",
      "name": "Kopi Robusta Garut",
      "slug": "kopi-robusta-garut",
      "description": "Produsen kopi robusta lereng Gunung Papandayan Garut berkualitas tinggi.",
      "category": "Kuliner",
      "tagline": "Aroma Asli Nusantara",
      "logoUrl": "https://.../logo.png",
      "bannerUrl": "https://.../banner.png",
      "phoneWhatsApp": "081234567890",
      "city": "Garut",
      "province": "Jawa Barat",
      "communityId": "comm_1793843915683",
      "communityName": "GMPS",
      "isPublished": true,
      "customDomain": null,
      "storeUrl": "https://kopi-robusta-garut.kroombox.com",
      "createdAt": "2026-10-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.8. TOKO: Mengambil Detail Satu Toko
* **Method:** `GET`
* **Path:** `/api/v1/stores/:idOrSlug`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/stores/kopi-robusta-garut"
```

---

### 4.9. TOKO: Mengambil Katalog Produk Milik Satu Toko
* **Method:** `GET`
* **Path:** `/api/v1/stores/:storeIdOrSlug/products`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/stores/kopi-robusta-garut/products"
```

---

### 4.10. PRODUK: Mengambil Seluruh Data Produk
Mengambil katalog data produk secara komprehensif dengan dukungan filter toko, komunitas, kategori, pencarian teks, rentang harga, dan status ketersediaan.

* **Method:** `GET`
* **Path:** `/api/v1/products`
* **Query Parameters:**
  | Parameter | Tipe | Default | Keterangan |
  |---|---|---|---|
  | `communitySlug` | string | `""` | Filter produk milik komunitas tertentu (contoh: `gmps`) |
  | `communityId` | string | `""` | Filter produk milik ID komunitas tertentu |
  | `storeSlug` | string | `""` | Filter produk milik slug toko tertentu (contoh: `kopi-robusta-garut`) |
  | `storeId` | string | `""` | Filter produk milik ID toko tertentu |
  | `category` | string | `""` | Filter kategori produk (contoh: `Minuman`, `Makanan`) |
  | `search` | string | `""` | Cari nama produk atau SKU |
  | `status` | string | `""` | Filter status: `available` (stok > 0) atau `out_of_stock` |
  | `minPrice` | number | `null` | Batas harga terendah |
  | `maxPrice` | number | `null` | Batas harga tertinggi |
  | `page` | number | `1` | Nomor halaman |
  | `limit` | number | `20` | Jumlah per halaman (maks 100) |

* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/products?communitySlug=gmps&status=available&minPrice=20000&maxPrice=100000"
```

* **Response Contoh (HTTP 200):**
```json
{
  "success": true,
  "code": "PRODUCTS_FETCHED",
  "message": "Daftar produk berhasil diambil.",
  "data": [
    {
      "id": "PRD001",
      "storeId": "STR001",
      "name": "Kopi Robusta Garut Medium Roast 250g",
      "slug": "kopi-robusta-garut-medium-roast-250g-prd001",
      "category": "Kuliner",
      "price": 45000,
      "originalPrice": 55000,
      "stock": 35,
      "sku": "KPG-250",
      "weightGrams": 250,
      "imageUrl": "https://.../kopi.jpg",
      "images": [
        "https://.../kopi.jpg",
        "https://.../kopi-kemasan.jpg"
      ],
      "status": "available",
      "description": "Biji kopi petik merah diproses secara natural roast medium.",
      "createdAt": "2026-10-02T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.11. PRODUK: Mengambil Detail Satu Produk
* **Method:** `GET`
* **Path:** `/api/v1/products/:id`
* **Contoh Request:**
```bash
curl -X GET "https://lapakq.com/api/v1/products/PRD001"
```

---

## 5. Contoh Integrasi Kode Aplikasi

### 5.1. Contoh JavaScript / TypeScript (Node.js & Browser Fetch)
```typescript
const BASE_URL = 'https://lapakq.com/api/v1';
const API_KEY = process.env.LAPAKQ_API_KEY || 'YOUR_API_KEY_HERE';

// Ambil seluruh produk komunitas GMPS
async function getCommunityProducts(communitySlug = 'gmps') {
  const url = `${BASE_URL}/communities/${communitySlug}/products?status=available`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error [${errorData.code}]: ${errorData.message}`);
  }

  const result = await response.json();
  console.log(`Ditemukan ${result.data.length} produk di komunitas ${communitySlug}:`, result.data);
  return result.data;
}

getCommunityProducts();
```

### 5.2. Contoh Python (Requests)
```python
import os
import requests

BASE_URL = "https://lapakq.com/api/v1"
API_KEY = os.getenv("LAPAKQ_API_KEY", "YOUR_API_KEY_HERE")

headers = {
    "X-API-Key": API_KEY,
    "Accept": "application/json"
}

# 1. Ambil detail komunitas GMPS
res_comm = requests.get(f"{BASE_URL}/communities/gmps", headers=headers)
if res_comm.status_code == 200:
    comm = res_comm.json()["data"]
    print(f"Komunitas: {comm['name']}, Total Toko: {comm['totalStores']}, Total Produk: {comm['totalProducts']}")

# 2. Ambil produk yang tersedia
res_prod = requests.get(f"{BASE_URL}/products?communitySlug=gmps&status=available", headers=headers)
if res_prod.status_code == 200:
    products = res_prod.json()["data"]
    for p in products:
        print(f"- {p['name']} (Rp {p['price']:,}) | Stok: {p['stock']}")
```
