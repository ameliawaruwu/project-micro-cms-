export interface WilayahItem {
  id: string;
  name: string;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  addressDetail?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  displayName?: string;
}

export interface PlaceSearchResult {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
}

export interface PostalCodeResult {
  code: string;
  village: string;
  district: string;
  regency: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

export interface PostalCodeItem {
  code: string;
  village: string;
  district?: string;
  isExact?: boolean;
  latitude?: number;
  longitude?: number;
}

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

// In-memory cache to prevent repeated network requests
const cache = {
  provinces: null as WilayahItem[] | null,
  regencies: new Map<string, WilayahItem[]>(),
  districts: new Map<string, WilayahItem[]>(),
  villages: new Map<string, WilayahItem[]>(),
  postalCodes: new Map<string, PostalCodeResult | null>(),
  postalCodeLists: new Map<string, PostalCodeItem[]>(),
};

// Fallback provinces in case network is offline
const FALLBACK_PROVINCES: WilayahItem[] = [
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '94', name: 'PAPUA' },
];

export const wilayahService = {
  async getProvinces(): Promise<WilayahItem[]> {
    if (cache.provinces && cache.provinces.length > 0) {
      return cache.provinces;
    }
    try {
      const res = await fetch(`${API_BASE}/provinces.json`);
      if (res.ok) {
        const data = await res.json();
        cache.provinces = data;
        return data;
      }
    } catch (err) {
      console.warn('[wilayahService] Fetch provinces fallback:', err);
    }
    return FALLBACK_PROVINCES;
  },

  async getRegencies(provinceId: string): Promise<WilayahItem[]> {
    if (!provinceId) return [];
    if (cache.regencies.has(provinceId)) {
      return cache.regencies.get(provinceId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/regencies/${provinceId}.json`);
      if (res.ok) {
        const data = await res.json();
        cache.regencies.set(provinceId, data);
        return data;
      }
    } catch (err) {
      console.warn('[wilayahService] Fetch regencies error:', err);
    }
    return [];
  },

  async getDistricts(regencyId: string): Promise<WilayahItem[]> {
    if (!regencyId) return [];
    if (cache.districts.has(regencyId)) {
      return cache.districts.get(regencyId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/districts/${regencyId}.json`);
      if (res.ok) {
        const data = await res.json();
        cache.districts.set(regencyId, data);
        return data;
      }
    } catch (err) {
      console.warn('[wilayahService] Fetch districts error:', err);
    }
    return [];
  },

  async getVillages(districtId: string): Promise<WilayahItem[]> {
    if (!districtId) return [];
    if (cache.villages.has(districtId)) {
      return cache.villages.get(districtId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/villages/${districtId}.json`);
      if (res.ok) {
        const data = await res.json();
        cache.villages.set(districtId, data);
        return data;
      }
    } catch (err) {
      console.warn('[wilayahService] Fetch villages error:', err);
    }
    return [];
  },

  /**
   * Cari kode pos dan koordinat otomatis berdasarkan Desa/Kelurahan, Kecamatan, dan Kabupaten
   */
  async findPostalCode(
    village: string,
    district?: string,
    regency?: string
  ): Promise<PostalCodeResult | null> {
    if (!village || !village.trim()) return null;

    const clean = (s: string) =>
      (s || '')
        .toLowerCase()
        .replace(/^(kabupaten|kota|kecamatan|desa|kelurahan)\s+/i, '')
        .trim();

    const vClean = clean(village);
    const dClean = clean(district || '');
    const rClean = clean(regency || '');

    const cacheKey = `${vClean}|${dClean}|${rClean}`;
    if (cache.postalCodes.has(cacheKey)) {
      return cache.postalCodes.get(cacheKey)!;
    }

    const queries = [
      dClean ? `${vClean} ${dClean}` : '',
      rClean ? `${vClean} ${rClean}` : '',
      vClean,
    ].filter(Boolean);

    for (const q of queries) {
      try {
        const res = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(q)}`);
        if (!res.ok) continue;
        const json = await res.json();
        if (!json.data || !Array.isArray(json.data) || json.data.length === 0) continue;

        // 1. Prioritas 1: Cocok Nama Desa DAN Nama Kecamatan
        let match = dClean
          ? json.data.find(
              (it: any) => clean(it.village) === vClean && clean(it.district) === dClean
            )
          : null;

        // 2. Prioritas 2: Cocok Nama Desa DAN Nama Kabupaten/Kota
        if (!match && rClean) {
          match = json.data.find(
            (it: any) => clean(it.village) === vClean && clean(it.regency).includes(rClean)
          );
        }

        // 3. Prioritas 3: Cocok Nama Desa saja
        if (!match) {
          match = json.data.find((it: any) => clean(it.village) === vClean);
        }

        if (match && match.code) {
          const result: PostalCodeResult = {
            code: String(match.code),
            village: match.village,
            district: match.district,
            regency: match.regency,
            province: match.province,
            latitude: typeof match.latitude === 'number' ? match.latitude : parseFloat(match.latitude) || undefined,
            longitude: typeof match.longitude === 'number' ? match.longitude : parseFloat(match.longitude) || undefined,
          };
          cache.postalCodes.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        console.warn('[wilayahService] findPostalCode query error:', q, err);
      }
    }

    cache.postalCodes.set(cacheKey, null);
    return null;
  },

  /**
   * Mengambil daftar pilihan kode pos untuk dropdown berdasarkan Desa/Kelurahan, Kecamatan, dan Kabupaten
   */
  async getPostalCodes(
    village: string,
    district?: string,
    regency?: string
  ): Promise<PostalCodeItem[]> {
    if (!village && !district) return [];

    const clean = (s: string) =>
      (s || '')
        .toLowerCase()
        .replace(/^(kabupaten|kota|kecamatan|desa|kelurahan|administrasi)\s+/i, '')
        .trim();

    const vClean = clean(village);
    const dClean = clean(district || '');
    const rClean = clean(regency || '');

    const cacheKey = `${vClean}|${dClean}|${rClean}`;
    if (cache.postalCodeLists.has(cacheKey)) {
      return cache.postalCodeLists.get(cacheKey)!;
    }

    const queries = [
      dClean && rClean ? `${dClean} ${rClean}` : '',
      vClean && dClean ? `${vClean} ${dClean}` : '',
      vClean && rClean ? `${vClean} ${rClean}` : '',
      dClean,
      vClean,
    ].filter(Boolean);

    const map = new Map<string, PostalCodeItem>();

    for (const q of queries) {
      try {
        const res = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(q)}`);
        if (!res.ok) continue;
        const json = await res.json();
        if (!json.data || !Array.isArray(json.data) || json.data.length === 0) continue;

        for (const item of json.data) {
          const itemV = clean(item.village);
          const itemD = clean(item.district);

          const isVillageMatch = vClean ? itemV === vClean || itemV.includes(vClean) : true;
          const isDistrictMatch = dClean ? itemD === dClean || itemD.includes(dClean) : true;

          if (item.code && (isVillageMatch || isDistrictMatch)) {
            const codeStr = String(item.code);
            if (!map.has(codeStr)) {
              map.set(codeStr, {
                code: codeStr,
                village: item.village,
                district: item.district,
                isExact: vClean ? itemV === vClean : false,
                latitude: typeof item.latitude === 'number' ? item.latitude : parseFloat(item.latitude) || undefined,
                longitude: typeof item.longitude === 'number' ? item.longitude : parseFloat(item.longitude) || undefined,
              });
            }
          }
        }

        if (map.size > 0) break;
      } catch (err) {
        console.warn('[wilayahService] getPostalCodes query error:', q, err);
      }
    }

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      return a.code.localeCompare(b.code);
    });

    cache.postalCodeLists.set(cacheKey, list);
    return list;
  },

  /**
   * Reverse Geocode koordinat (latitude, longitude) ke alamat lengkap Indonesia
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return null;
    }

    // 1. Coba OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KroomifyApp/1.0 (contact@kroombox.com)',
            'Accept-Language': 'id',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;

          // Alamat Jalan & Nomor Bangunan
          const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';
          const houseNumber = addr.house_number ? `No. ${addr.house_number}` : '';
          const streetAddress = [road, houseNumber].filter(Boolean).join(' ').trim();

          // Detail Alamat / Patokan / Bangunan
          const landmark = addr.amenity || addr.shop || addr.tourism || addr.office || addr.building || addr.leisure || '';

          // Desa / Kelurahan
          const village = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || '';

          // Kecamatan
          const district = addr.town || addr.municipality || addr.city_district || addr.subdistrict || (village !== addr.suburb ? addr.suburb : '') || '';

          // Kota / Kabupaten
          let city = addr.county || addr.city || addr.town || '';
          if (city.toLowerCase().startsWith('daerah khusus') || city.toLowerCase().includes('jakarta')) {
            city = addr.city_district || 'Jakarta Pusat';
          }

          // Provinsi
          let province = addr.state || '';
          if (!province && (data.display_name?.includes('Jakarta') || city?.includes('Jakarta'))) {
            province = 'DKI JAKARTA';
          }

          // Kode Pos
          const postalCode = addr.postcode ? String(addr.postcode).trim() : '';

          return {
            latitude: lat,
            longitude: lng,
            address: streetAddress || road || (landmark ? `Area ${landmark}` : '') || data.display_name?.split(',')[0] || '',
            addressDetail: landmark || (road && addr.neighbourhood ? `Area ${addr.neighbourhood}` : ''),
            village: village,
            district: district,
            city: city,
            province: province,
            postalCode: postalCode,
            displayName: data.display_name || '',
          };
        }
      }
    } catch (err) {
      console.warn('[wilayahService] Nominatim reverse geocode error:', err);
    }

    // 2. Fallback ke BigDataCloud Reverse Geocode
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
      );
      if (res.ok) {
        const data = await res.json();
        const admins = data.localityInfo?.administrative || [];

        const provAdmin = admins.find((a: any) => a.adminLevel === 4) || admins.find((a: any) => a.order === 7);
        const cityAdmin = admins.find((a: any) => a.adminLevel === 5) || admins.find((a: any) => a.order === 8);
        const distAdmin = admins.find((a: any) => a.adminLevel === 6) || admins.find((a: any) => a.order === 9 || a.order === 10);

        return {
          latitude: lat,
          longitude: lng,
          address: data.locality || data.city || '',
          addressDetail: '',
          village: '',
          district: distAdmin ? distAdmin.name : data.locality || '',
          city: cityAdmin ? cityAdmin.name : data.city || '',
          province: provAdmin ? provAdmin.name : data.principalSubdivision || '',
          postalCode: data.postcode || '',
          displayName: [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', '),
        };
      }
    } catch (err) {
      console.warn('[wilayahService] BigDataCloud fallback error:', err);
    }

    return null;
  },

  /**
   * Cari lokasi berdasarkan query teks (Search Places)
   */
  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=id&limit=5`,
        {
          headers: {
            'User-Agent': 'KroomifyApp/1.0 (contact@kroombox.com)',
            'Accept-Language': 'id',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((it: any) => ({
            latitude: parseFloat(it.lat),
            longitude: parseFloat(it.lon),
            displayName: it.display_name || it.name,
            name: it.name || it.display_name?.split(',')[0] || '',
          }));
        }
      }
    } catch (err) {
      console.warn('[wilayahService] searchPlaces error:', err);
    }
    return [];
  },
};
