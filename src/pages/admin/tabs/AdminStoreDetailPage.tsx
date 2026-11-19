import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, MapPin, Package, Phone, RefreshCw, Store as StoreIcon, User as UserIcon } from 'lucide-react';
import { Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  communityMembershipService,
  ManagedMember,
  ManagedStoreProduct,
} from '../../../services/communityMembershipService';
import { EntityAvatar } from '../components/EntityAvatar';

/**
 * Halaman detail toko binaan untuk Sub-Admin (rute /admin/toko/:storeId).
 * Khusus panel admin: menampilkan data toko & produk merchant, tanpa membuka storefront publik.
 * Produk diambil dari server (/api/community/manage/stores/:id/products) yang memeriksa keanggotaan komunitas.
 */
interface AdminStoreDetailPageProps {
  storeId: string;
  store: Store | null;
  storesLoaded: boolean;
  isSuspended: boolean;
  isEn: boolean;
  communityName?: string;
  /** Sub-Admin Utama: boleh melihat email pemilik. */
  canSeeOwnerEmail?: boolean;
  onBack: () => void;
  onNavigateOverview: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  Tersedia: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Hampir Habis': 'bg-amber-50 text-amber-700 border-amber-200',
  Habis: 'bg-gray-100 text-gray-600 border-gray-200',
  Nonaktif: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabel = (status: string, isEn: boolean) => {
  if (!isEn) return status;
  return ({ Tersedia: 'Available', 'Hampir Habis': 'Low stock', Habis: 'Out of stock', Nonaktif: 'Inactive' } as Record<string, string>)[status] || status;
};

export const AdminStoreDetailPage: React.FC<AdminStoreDetailPageProps> = ({
  storeId,
  store,
  storesLoaded,
  isSuspended,
  isEn,
  communityName,
  canSeeOwnerEmail = false,
  onBack,
  onNavigateOverview,
}) => {
  const [products, setProducts] = useState<ManagedStoreProduct[] | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [owner, setOwner] = useState<ManagedMember | null>(null);

  const load = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    const [prodRes, managedRes] = await Promise.allSettled([
      communityMembershipService.getStoreProducts(storeId),
      communityMembershipService.getManaged(),
    ]);
    if (prodRes.status === 'fulfilled') setProducts(prodRes.value);
    else {
      setProducts(null);
      setProductsError(prodRes.reason?.message || (isEn ? 'Failed to load products.' : 'Gagal memuat produk.'));
    }
    if (managedRes.status === 'fulfilled') setOwner(managedRes.value.members.find((m) => m.storeId === storeId) || null);
    setLoadingProducts(false);
  }, [storeId, isEn]);

  useEffect(() => {
    load();
  }, [load]);

  const storesLabel = isEn ? 'Member Stores' : 'Lapak Binaan';
  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
        { label: storesLabel, onClick: onBack },
        { label: store?.name || (isEn ? 'Store detail' : 'Detail toko'), isActive: true },
      ]}
    />
  );

  const backBtn = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66000E] hover:underline cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {isEn ? 'Back to member stores' : 'Kembali ke daftar lapak binaan'}
    </button>
  );

  if (!store) {
    return (
      <div className="space-y-4">
        {breadcrumb}
        {backBtn}
        <div className="bg-white border border-[#E5E0DD] rounded-xl py-14 flex flex-col items-center gap-2 text-[#A8A09D]">
          {!storesLoaded ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <StoreIcon className="w-7 h-7" />
              <p className="text-xs text-center px-4">
                {isEn
                  ? 'Store not found, or it is not a member of your community.'
                  : 'Toko tidak ditemukan atau bukan toko binaan komunitas Anda.'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const address = [store.address, store.district ? `Kec. ${store.district}` : null, store.city, store.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4">
      {breadcrumb}
      {backBtn}

      {/* Info toko */}
      <div className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#66000E] to-[#9B1C1C] text-white flex items-center gap-3">
          <div className="rounded-xl border-2 border-white/40 bg-white shrink-0">
            <EntityAvatar key={store.logoUrl || ''} sources={[store.logoUrl]} alt={store.name} size="lg" rounded="lg" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg tracking-tight truncate">{store.name}</h1>
            <p className="text-xs text-white/80 truncate">
              /{store.slug}
              {communityName ? ` · ${communityName}` : ''}
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F7] p-3.5 rounded-xl border border-[#E5E0DD] text-xs">
            <div>
              <span className="text-[11px] text-[#706866] block">{isEn ? 'WhatsApp Number' : 'Nomor WhatsApp'}</span>
              <div className="font-semibold text-[#1F1F1F] flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{store.phoneWhatsApp || '-'}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[#706866] block">{isEn ? 'Operational Status' : 'Status Operasional'}</span>
              <div className="mt-0.5 font-medium">
                {isSuspended ? (
                  <span className="text-red-600">{isEn ? 'Suspended' : 'Disuspend'}</span>
                ) : (
                  <span className="text-emerald-600">{isEn ? 'Active / Normal' : 'Aktif / Normal'}</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[#706866] block">{isEn ? 'Website Status' : 'Status Website'}</span>
              <div className="mt-0.5 font-medium text-[#1F1F1F]">
                {store.isPublished ? (isEn ? 'Published' : 'Terbit') : isEn ? 'Not published (draft)' : 'Belum terbit (draf)'}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-[#706866] block">{isEn ? 'Category' : 'Kategori'}</span>
              <div className="mt-0.5 font-medium text-[#1F1F1F] truncate">{store.category || (isEn ? 'MSME' : 'UMKM')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="border border-[#E5E0DD] rounded-xl p-3.5 flex items-center gap-3">
              <EntityAvatar
                key={owner?.ownerAvatarUrl || ''}
                sources={[owner?.ownerAvatarUrl]}
                alt={owner?.ownerName || store.name}
                kind="user"
              />
              <div className="min-w-0">
                <span className="text-[11px] text-[#706866] flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {isEn ? 'Merchant account' : 'Akun merchant'}
                </span>
                <p className="font-semibold text-[#1F1F1F] truncate">{owner?.ownerName || '-'}</p>
                {canSeeOwnerEmail && owner?.ownerEmail && <p className="text-[11px] text-[#706866] truncate">{owner.ownerEmail}</p>}
              </div>
            </div>
            <div className="border border-[#E5E0DD] rounded-xl p-3.5">
              <span className="text-[11px] text-[#706866] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {isEn ? 'Store address' : 'Alamat toko'}
              </span>
              <p className="text-[#1F1F1F] mt-0.5">{address || (isEn ? 'No store address saved yet' : 'Belum ada alamat toko tersimpan')}</p>
            </div>
          </div>

          {(store.tagline || store.description) && (
            <div className="border border-[#E5E0DD] rounded-xl p-3.5 text-xs space-y-1">
              {store.tagline && <p className="font-semibold text-[#1F1F1F] italic">"{store.tagline}"</p>}
              {store.description && <p className="text-[#4A4242]">{store.description}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Produk merchant */}
      <div className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F0ECEA] flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#1F1F1F] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#66000E]" />
            {isEn ? 'Merchant products' : 'Produk merchant'}
            {products && <span className="text-xs font-normal text-[#706866]">({products.length})</span>}
          </h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 text-xs text-[#706866] hover:text-[#1F1F1F] cursor-pointer"
            aria-label={isEn ? 'Refresh' : 'Muat ulang'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isEn ? 'Refresh' : 'Muat ulang'}</span>
          </button>
        </div>
        {loadingProducts && !products ? (
          <div className="py-12 flex justify-center text-[#A8A09D]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : productsError ? (
          <div className="py-10 px-4 text-center text-xs text-[#66000E]">{productsError}</div>
        ) : !products || products.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-[#A8A09D]">
            <Package className="w-7 h-7" />
            <p className="text-xs">{isEn ? 'This store has no products yet.' : 'Toko ini belum memiliki produk.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF7F7] text-[#706866] text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">{isEn ? 'Product' : 'Produk'}</th>
                  <th className="px-4 py-2.5 font-semibold">{isEn ? 'Category' : 'Kategori'}</th>
                  <th className="px-4 py-2.5 font-semibold text-right">{isEn ? 'Price' : 'Harga'}</th>
                  <th className="px-4 py-2.5 font-semibold text-right">{isEn ? 'Stock' : 'Stok'}</th>
                  <th className="px-4 py-2.5 font-semibold">{isEn ? 'Status' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECEA]">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <EntityAvatar key={p.imageUrl || ''} sources={[p.imageUrl]} alt={p.name} rounded="lg" />
                        <span className="font-medium text-[#1F1F1F]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#4A4242]">{p.category || '-'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#1F1F1F] whitespace-nowrap">{formatRupiah(p.price)}</td>
                    <td className="px-4 py-2.5 text-right text-[#4A4242]">{p.stock ?? '-'}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${
                          STATUS_STYLE[p.status] || STATUS_STYLE.Habis
                        }`}
                      >
                        {statusLabel(p.status, isEn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
