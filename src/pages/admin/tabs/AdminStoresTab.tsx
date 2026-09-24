import React, { useState } from 'react';
import {
  Search,
  Ban,
  ExternalLink,
  Eye,
  X,
  MapPin,
  Copy,
  Check,
  Phone,
  Store as StoreIcon,
  Tag,
  CreditCard,
} from 'lucide-react';
import { Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminStoresTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPlan: string;
  setFilterPlan: (plan: string) => void;
  filteredStores: Store[];
  suspendedIds: string[];
  handleChangePlan: (storeId: string, plan: 'free' | 'starter' | 'premium') => void;
  handleToggleSuspend: (storeId: string, storeName: string) => void;
  onOpenStorefront?: (slug: string) => void;
  language: string;
  isEn: boolean;
  onNavigateOverview?: () => void;
}

export const AdminStoresTab: React.FC<AdminStoresTabProps> = ({
  searchQuery,
  setSearchQuery,
  filterPlan,
  setFilterPlan,
  filteredStores,
  suspendedIds,
  handleChangePlan,
  handleToggleSuspend,
  onOpenStorefront,
  language,
  isEn,
  onNavigateOverview,
}) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [copied, setCopied] = useState(false);

  const getFullFormattedAddress = (s: Store) => {
    const parts = [
      s.address,
      s.addressDetail,
      s.village ? `Desa ${s.village}` : null,
      s.subdistrict ? `Kel. ${s.subdistrict}` : null,
      s.district ? `Kec. ${s.district}` : null,
      s.city,
      s.province,
      s.postalCode ? `Kode Pos ${s.postalCode}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Belum ada alamat toko tersimpan';
  };

  const handleCopyAddress = (s: Store) => {
    const full = getFullFormattedAddress(s);
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'Manage Stores' : 'Kelola Toko', isActive: true },
        ]}
      />

      {/* Page Header */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <StoreIcon className="w-5 h-5 text-[#66000E]" />
            <span>{isEn ? 'Manage Stores' : 'Kelola Toko'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Monitor, verify, manage subscription plans, and inspect active merchant storefronts.'
              : 'Pantau, verifikasi, kelola paket langganan, dan tinjau etalase toko merchant.'}
          </p>
        </div>
        <span className="text-xs font-medium text-gray-600 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 self-start sm:self-auto">
          {filteredStores.length} {isEn ? 'Stores' : 'Toko Terdaftar'}
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search store by name, domain, or owner...' : 'Cari toko berdasarkan nama, domain, atau pemilik...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'free', 'premium'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlan(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition cursor-pointer ${
                filterPlan === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'all'
                ? (language === 'en' ? 'All' : 'Semua')
                : p === 'premium'
                ? 'Pro'
                : (language === 'en' ? 'Free' : 'Gratis')}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Store' : 'Toko'}</th>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Plan' : 'Paket'}</th>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Wallet Balance' : 'Saldo Dompet'}</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">{language === 'en' ? 'Action' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <StoreIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-700">{isEn ? 'No stores found' : 'Belum ada data toko'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isEn ? 'Stores registered in database will be displayed here.' : 'Toko yang terdaftar di database akan ditampilkan di sini.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                const isSuspended = suspendedIds.includes(store.id);
                return (
                  <tr key={store.id} className="hover:bg-gray-50/60 transition">
                    {/* Store details */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={store.logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                          alt={store.name}
                          className="w-7 h-7 rounded object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{store.name}</p>
                          <span className="text-[11px] text-gray-400">/{store.slug} • {store.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Plan Selector */}
                    <td className="py-2.5 px-3.5">
                      <select
                        value={store.plan || 'free'}
                        onChange={(e) => handleChangePlan(store.id, e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-[11px] font-medium text-gray-800 focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        <option value="free">FREE</option>
                        <option value="starter">STARTER</option>
                        <option value="premium">PRO</option>
                      </select>
                    </td>

                    {/* Balance */}
                    <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                      {formatRupiah(store.balance || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                          <Ban className="w-3 h-3" /> {isEn ? 'Suspended' : 'Disuspend'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isEn ? 'Active' : 'Aktif'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="px-2 py-1 rounded bg-[#F5E8EA] hover:bg-[#E8DDDE] text-[#66000E] border border-[#E8DDDE] text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title={isEn ? 'View Store & Address Details' : 'Lihat Detail Toko & Alamat'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Detail' : 'Detail'}</span>
                        </button>

                        {onOpenStorefront && (
                          <button
                            onClick={() => onOpenStorefront(store.slug)}
                            className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                            title={isEn ? 'View Storefront' : 'Lihat Storefront'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleSuspend(store.id, store.name)}
                          className={`px-2 py-1 rounded font-medium text-[11px] transition cursor-pointer ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-white hover:bg-red-50 border border-red-200 text-red-600'
                          }`}
                        >
                          {isSuspended ? (isEn ? 'Activate' : 'Aktifkan') : (isEn ? 'Suspend' : 'Suspend')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL TOKO & ALAMAT LENGKAP */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#66000E] to-[#9B1C1C] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStore.logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                  alt={selectedStore.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-white/40 bg-white"
                />
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                    <span>{selectedStore.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                      {selectedStore.plan || 'FREE'}
                    </span>
                  </h3>
                  <p className="text-xs text-white/80">
                    /{selectedStore.slug} • Merchant ID: {selectedStore.merchantId || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Ringkasan Profil & Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-[11px] text-gray-500 block">Nomor WhatsApp</span>
                  <div className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedStore.phoneWhatsApp || '-'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Saldo Aktif</span>
                  <div className="font-bold text-[#66000E] mt-0.5">
                    {formatRupiah(selectedStore.balance || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Status Operasional</span>
                  <div className="font-semibold mt-0.5">
                    {suspendedIds.includes(selectedStore.id) ? (
                      <span className="text-red-600 font-medium">Disuspend</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Aktif / Normal</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Kategori</span>
                  <div className="font-medium text-gray-800 mt-0.5 truncate">
                    {selectedStore.category || 'UMKM'}
                  </div>
                </div>
              </div>

              {/* Tagline & Deskripsi */}
              {(selectedStore.tagline || selectedStore.description) && (
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
                  {selectedStore.tagline && (
                    <p className="font-semibold text-gray-900 italic">"{selectedStore.tagline}"</p>
                  )}
                  {selectedStore.description && (
                    <p className="text-gray-600">{selectedStore.description}</p>
                  )}
                </div>
              )}

              {/* HIERARKI ALAMAT STANDAR TOKO */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#66000E]" />
                    <span>Hierarki Alamat Lengkap Toko</span>
                  </h4>
                  <button
                    onClick={() => handleCopyAddress(selectedStore)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#66000E] hover:underline cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Alamat</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 col-span-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Alamat Jalan / No. Bangunan / RT-RW
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.address || <span className="text-gray-400 italic">Belum diisi</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 col-span-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Detail Alamat (Patokan / Blok / Unit)
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.addressDetail || <span className="text-gray-400 italic">Belum diisi</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Desa
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.village || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Kelurahan
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.subdistrict || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Kecamatan
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.district || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Kabupaten / Kota
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.city || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Provinsi
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.province || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Kode Pos
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedStore.postalCode || <span className="text-gray-400 italic">-</span>}
                    </p>
                  </div>
                </div>

                {/* Format Alamat Gabungan Pengiriman */}
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs">
                  <span className="text-[10px] font-bold text-[#66000E] uppercase tracking-wider block">
                    Alamat Lengkap Terformat (Standar Ekspedisi & Kurir)
                  </span>
                  <p className="text-gray-800 mt-1 font-medium leading-relaxed">
                    {getFullFormattedAddress(selectedStore)}
                  </p>
                </div>

                {/* Titik Keakuratan Lokasi (GPS Koordinat & Peta) */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5 uppercase text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>Titik Lokasi Toko (Maps & Koordinat)</span>
                    </span>
                    <a
                      href={
                        selectedStore.latitude && selectedStore.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${selectedStore.latitude},${selectedStore.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullFormattedAddress(selectedStore))}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#66000E] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Google Maps</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                      Lat: {selectedStore.latitude ?? '-'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                      Lng: {selectedStore.longitude ?? '-'}
                    </span>
                  </div>

                  <div className="h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <iframe
                      title="Lokasi Toko"
                      src={`https://maps.google.com/maps?q=${
                        selectedStore.latitude && selectedStore.longitude
                          ? `${selectedStore.latitude},${selectedStore.longitude}`
                          : encodeURIComponent(getFullFormattedAddress(selectedStore))
                      }&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              {onOpenStorefront ? (
                <button
                  onClick={() => {
                    onOpenStorefront(selectedStore.slug);
                    setSelectedStore(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Halaman Toko</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedStore(null)}
                className="px-5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
