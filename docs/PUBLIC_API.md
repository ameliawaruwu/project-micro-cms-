# LapakQ Public API v1 — Dokumentasi Integrasi Data Toko & Produk (Read-Only)

Dokumentasi resmi integrasi antarmuka pemrograman aplikasi (**RESTful API**) LapakQ untuk mitra, aplikasi eksternal, dan integrasi pihak ketiga.

---

## 1. Ringkasan & Aturan Keamanan Mutlak (Strict Read-Only)

1. **Autentikasi API Key:** Setiap permintaan wajib menyertakan header `X-API-Key`.
2. **Strictly Read-Only (Hanya Metode GET):**
   - Seluruh endpoint API **HANYA** mendukung metode **`GET`**.
   - Setiap upaya request menggunakan metode **`POST`**, **`PUT`**, **`PATCH`**, atau **`DELETE`** akan **langsung ditolak** oleh server dengan status **`405 Method Not Allowed`**.
   - API ini ditujukan murni untuk konsumsi data katalog (daftar toko dan produk), tanpa kemampuan menambah, memodifikasi, atau menghapus data.
3. **Privasi & Keamanan Data (Zero Sensitive Exposure):**
   - Data sensitif seperti kredensial login, kata sandi / password hash, saldo dompet internal, dan nomor rekening perbankan **tidak pernah diekspos** di dalam payload response.

---

## 2. Lingkungan & Base URL

| Lingkungan | Base URL | Keterangan |
|---|---|---|
| **Production (Live Server)** | `https://lapakq.com` | Base URL resmi LapakQ (HTTPS) |
| **Development (Lokal)** | `http://localhost:5055` | Base URL server Express lokal |

Semua endpoint API v1 berada di bawah prefix path: **`/api/v1`**.

---

## 3. Autentikasi Header

Kirimkan API Key resmi pada header HTTP di setiap request:

```http
GET /api/v1/stores HTTP/1.1
Host: lapakq.com
X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01
Accept: application/json
```

### Format Error Jika API Key Tidak Disertakan / Salah (HTTP 401):
```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Header X-API-Key tidak disertakan. Sertakan API Key valid pada header request: X-API-Key: <YOUR_API_KEY>"
}
```

### Format Error Jika Memanggil Metode Selain GET (HTTP 405):
```json
{
  "success": false,
  "code": "METHOD_NOT_ALLOWED",
  "message": "Metode POST tidak diizinkan. Seluruh endpoint API Key publik hanya mendukung metode GET (Read Only). Penambahan (POST), pengubahan (PUT/PATCH), maupun penghapusan (DELETE) data tidak diperbolehkan."
}
```

---

## 4. Katalog Endpoint Tersedia

### 4.1. Health Check API
Memeriksa kesiapan dan status online server API LapakQ.

* **Method:** `GET`
* **Path:** `/api/v1/health`
* **Auth:** Tidak memerlukan API Key (Publik)

#### Response Berhasil (HTTP 200):
```json
{
  "status": "ok",
  "service": "lapakq-read-only-api",
  "version": "1.0.0",
  "mode": "read_only_strictly_enforced",
  "timestamp": "2026-11-05T06:30:00.000Z"
}
```

---

### 4.2. Mengambil Daftar Toko (Store Directory)
Mengambil seluruh toko yang terdaftar dan aktif di LapakQ dengan dukungan paginasi, pencarian, dan filter kategori.

* **Method:** `GET`
* **Path:** `/api/v1/stores`
* **Headers:** `X-API-Key: <API_KEY>`

#### Query Parameters:
| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `search` | string | `""` | Cari nama toko atau slug (case-insensitive) |
| `category` | string | `""` | Filter kategori toko (contoh: `Kuliner`, `Fashion`, `Kerajinan`) |
| `communityId` | string | `""` | Filter toko binaan komunitas tertentu |
| `page` | number | `1` | Nomor halaman (mulai dari 1) |
| `limit` | number | `20` | Jumlah data per halaman (maksimal 100) |

#### Contoh Request:
```bash
curl -X GET "https://lapakq.com/api/v1/stores?page=1&limit=10&category=Kuliner" \
  -H "X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"
```

#### Response Berhasil (HTTP 200):
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
      "communityId": "comm_1793784182015",
      "communityName": "GMPS",
      "isPublished": true,
      "customDomain": null,
      "storeUrl": "https://kopi-robusta-garut.kroombox.com",
      "createdAt": "2026-10-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.3. Mengambil Detail Satu Toko
Mengambil informasi lengkap satu toko berdasarkan **ID Toko** (`STRxxx`) atau **Slug Toko**.

* **Method:** `GET`
* **Path:** `/api/v1/stores/:id` (atau `/api/v1/stores/:slug`)
* **Headers:** `X-API-Key: <API_KEY>`

#### Contoh Request:
```bash
curl -X GET "https://lapakq.com/api/v1/stores/kopi-robusta-garut" \
  -H "X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"
```

#### Response Berhasil (HTTP 200):
```json
{
  "success": true,
  "code": "STORE_FETCHED",
  "message": "Detail toko berhasil diambil.",
  "data": {
    "id": "STR001",
    "name": "Kopi Robusta Garut",
    "slug": "kopi-robusta-garut",
    "description": "Produsen kopi robusta lereng Gunung Papandayan Garut berkualitas tinggi.",
    "category": "Kuliner",
    "tagline": "Aroma Asli Nusantara",
    "logoUrl": "https://.../logo.png",
    "bannerUrl": "https://.../banner.png",
    "phoneWhatsApp": "081234567890",
    "communityId": "comm_1793784182015",
    "communityName": "GMPS",
    "isPublished": true,
    "customDomain": null,
    "storeUrl": "https://kopi-robusta-garut.kroombox.com",
    "createdAt": "2026-10-01T08:00:00.000Z"
  }
}
```

---

### 4.4. Mengambil Seluruh Produk (Product Catalog)
Mengambil katalog produk dari seluruh toko atau difilter berdasarkan toko, kategori, ketersediaan stok, dan pencarian kata kunci.

* **Method:** `GET`
* **Path:** `/api/v1/products`
* **Headers:** `X-API-Key: <API_KEY>`

#### Query Parameters:
| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `storeId` | string | `""` | Filter produk milik toko tertentu (contoh: `STR001`) |
| `search` | string | `""` | Cari nama produk atau SKU |
| `category` | string | `""` | Filter kategori produk (contoh: `Minuman`, `Makanan`) |
| `status` | string | `""` | Filter status: `available` (stok > 0) atau `out_of_stock` (stok habis) |
| `page` | number | `1` | Nomor halaman (mulai dari 1) |
| `limit` | number | `20` | Jumlah data per halaman (maksimal 100) |

#### Contoh Request:
```bash
curl -X GET "https://lapakq.com/api/v1/products?search=kopi&status=available" \
  -H "X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"
```

#### Response Berhasil (HTTP 200):
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
        "https://.../kopi.jpg"
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

### 4.5. Mengambil Produk Berdasarkan Toko
Mengambil seluruh katalog produk milik toko tertentu secara langsung.

* **Method:** `GET`
* **Path:** `/api/v1/stores/:storeId/products`
* **Headers:** `X-API-Key: <API_KEY>`

#### Contoh Request:
```bash
curl -X GET "https://lapakq.com/api/v1/stores/STR001/products" \
  -H "X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"
```

---

### 4.6. Mengambil Detail Satu Produk
Mengambil detail satu produk spesifik menggunakan ID Produk (`PRDxxx`).

* **Method:** `GET`
* **Path:** `/api/v1/products/:id`
* **Headers:** `X-API-Key: <API_KEY>`

#### Contoh Request:
```bash
curl -X GET "https://lapakq.com/api/v1/products/PRD001" \
  -H "X-API-Key: lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"
```

#### Response Berhasil (HTTP 200):
```json
{
  "success": true,
  "code": "PRODUCT_FETCHED",
  "message": "Detail produk berhasil diambil.",
  "data": {
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
      "https://.../kopi.jpg"
    ],
    "status": "available",
    "description": "Biji kopi petik merah diproses secara natural roast medium.",
    "createdAt": "2026-10-02T09:30:00.000Z"
  }
}
```

---

## 5. Contoh Implementasi Kode (Client Integration)

### 5.1. Contoh JavaScript / Node.js (Fetch API)
```javascript
const API_URL = 'https://lapakq.com/api/v1';
const API_KEY = 'lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01';

async function fetchProducts(searchQuery = '') {
  const url = new URL(`${API_URL}/products`);
  if (searchQuery) url.searchParams.set('search', searchQuery);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`[${errorData.code}] ${errorData.message}`);
  }

  const result = await res.json();
  console.log(`Ditemukan ${result.pagination.total} produk:`, result.data);
  return result.data;
}
```

### 5.2. Contoh Python (Requests)
```python
import requests

API_URL = "https://lapakq.com/api/v1"
API_KEY = "lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01"

headers = {
    "X-API-Key": API_KEY,
    "Accept": "application/json"
}

# Ambil daftar toko
response = requests.get(f"{API_URL}/stores", headers=headers)
if response.status_code == 200:
    stores = response.json()["data"]
    for s in stores:
        print(f"Toko: {s['name']} ({s['storeUrl']})")
else:
    print("Error:", response.json())
```
