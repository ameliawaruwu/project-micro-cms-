import React, { useState, useEffect, useMemo } from 'react';
import { storeInCommunity } from '../../../utils/communityMembership';
import { Package, Search, Trash2, Store as StoreIcon, Loader2 } from 'lucide-react';
import { Product, Store, User } from '../../../types';
import { productService } from '../../../services/productService';
import { storeService } from '../../../services/storeService';
import { formatRupiah } from '../../../utils/formatters';

interface AdminProductsTabProps {
  currentUser?: User | null;
  onShowToast?: (msg: string) => void;
  language?: string;
  isSubAdmin?: boolean;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  currentUser,
  onShowToast,
  language = 'id',
  isSubAdmin = false,
}) => {
  const isEn = language === 'en';

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal: Konfirmasi Hapus Produk
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedStores] = await Promise.all([
        productService.getAllProducts(),
        storeService.getStores(),
      ]);

      let scopedStores = fetchedStores || [];
      let scopedProducts = fetchedProducts || [];

      // OPSI A: Jika Sub Admin Umum terikat pada komunitas tertentu, persempit akses hanya untuk toko binaan komunitasnya
      if (isSubAdmin && currentUser?.communityId) {
        const cId = currentUser.communityId;
        const cName = (currentUser.communityName || '').trim().toLowerCase();
        scopedStores = scopedStores.filter((s) => storeInCommunity(s, cId, cName));
        const scopedStoreIds = new Set(scopedStores.map((s) => s.id));
        scopedProducts = scopedProducts.filter((p) => scopedStoreIds.has(p.storeId));
      }

      setStores(scopedStores);
      setProducts(scopedProducts);
    } catch (err: any) {
      console.error('[AdminProductsTab] Error loading data:', err);
      notify(isEn ? 'Failed to load products' : 'Gagal memuat katalog produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Map stores by id for fast lookup
  const storesById = useMemo(() => {
    const map = new Map<string, Store>();
    stores.forEach((s) => map.set(s.id, s));
    return map;
  }, [stores]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (storesById.get(p.storeId)?.name.toLowerCase().includes(q) ?? false);

      const matchesStore = selectedStoreFilter === 'all' || p.storeId === selectedStoreFilter;
      const matchesStatus =
        selectedStatusFilter === 'all' ||
        ((selectedStatusFilter === 'active' && (p.status === 'Tersedia' || p.stock > 0))) ||
        ((selectedStatusFilter === 'out_of_stock' && (p.status === 'Habis' || p.stock <= 0))) ||
        ((selectedStatusFilter === 'inactive' && p.status === 'Nonaktif'));

      const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesStore && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, selectedStoreFilter, selectedStatusFilter, selectedCategoryFilter, storesById]);

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status !== 'Nonaktif' && p.stock > 0).length;
    const lowStock = products.filter((p) => p.stock <= 5).length;
    const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    return { total, active, lowStock, totalValue };
  }, [products]);

  // Handlers: Hapus Produk
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id, productToDelete.storeId, { requireDatabase: true });
      notify(isEn ? `Product "${productToDelete.name}" deleted` : `Produk "${productToDelete.name}" berhasil dihapus`);
      setProductToDelete(null);
      await loadAllData();
    } catch (err: any) {
      console.error('[AdminProductsTab] Delete error:', err);
      notify(isEn ? `Delete failed: ${err.message}` : `Gagal menghapus: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#66000E]/10 rounded-lg text-[#66000E]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {isSubAdmin && currentUser?.communityName
                  ? `Kelola Produk — Komunitas ${currentUser.communityName}`
                  : (isEn ? 'Product Management' : 'Kelola Produk')}
              </h1>
              <p className="text-xs text-gray-500">
                {isSubAdmin && currentUser?.communityName
                  ? `Katalog produk khusus toko binaan naungan ${currentUser.communityName}`
                  : (isEn ? 'Master catalog of all merchant products on LapakQ' : 'Katalog master seluruh produk toko UMKM di LapakQ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Total Products' : 'Total Produk'}</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{metrics.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Active In Stock' : 'Produk Siap Jual'}</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{metrics.active.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Low / Out of Stock' : 'Stok Menipis (≤5)'}</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{metrics.lowStock.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Total Catalog Value' : 'Nilai Inventori'}</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatRupiah(metrics.totalValue)}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search products by name, SKU, category, or store...' : 'Cari nama produk, SKU, kategori, atau nama toko...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Toko */}
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] text-gray-700 font-medium"
          >
            <option value="all">{isEn ? 'All Stores' : 'Semua Toko'}</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.slug})
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] text-gray-700 font-medium"
          >
            <option value="all">{isEn ? 'All Status' : 'Semua Status'}</option>
            <option value="active">{isEn ? 'Active' : 'Aktif'}</option>
            <option value="out_of_stock">{isEn ? 'Out of Stock' : 'Habis / Stok Kosong'}</option>
            <option value="inactive">{isEn ? 'Inactive' : 'Nonaktif'}</option>
          </select>

          {/* Filter Kategori */}
          {categories.length > 0 && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] text-gray-700 font-medium"
            >
              <option value="all">{isEn ? 'All Categories' : 'Semua Kategori'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#66000E]" />
            <span className="text-xs">{isEn ? 'Loading products...' : 'Memuat data produk...'}</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-60" />
            <p className="text-sm font-medium text-gray-600">
              {isEn ? 'No products found' : 'Tidak ada produk yang sesuai kriteria'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? 'Try adjusting your search or filters.' : 'Coba ubah kata kunci pencarian atau filter status.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{isEn ? 'Product' : 'Produk'}</th>
                  <th className="px-4 py-3">{isEn ? 'Store' : 'Toko'}</th>
                  <th className="px-4 py-3">{isEn ? 'Category' : 'Kategori'}</th>
                  <th className="px-4 py-3">{isEn ? 'Price' : 'Harga'}</th>
                  <th className="px-4 py-3">{isEn ? 'Stock' : 'Stok'}</th>
                  <th className="px-4 py-3">{isEn ? 'Status' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isEn ? 'Actions' : 'Aksi'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => {
                  const store = storesById.get(p.storeId);
                  const isOutOfStock = p.stock <= 0 || p.status === 'Habis';
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl || (p.images && p.images[0]) ? (
                              <img
                                src={p.imageUrl || p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[280px]">
                              {p.name}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {p.id} {p.sku ? `• SKU: ${p.sku}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <StoreIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px] font-medium">
                            {store?.name || p.storeId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                          {p.category || 'Umum'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-800'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            {isEn ? 'Out of Stock' : 'Habis'}
                          </span>
                        ) : p.status === 'Nonaktif' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            {isEn ? 'Inactive' : 'Nonaktif'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {isEn ? 'Active' : 'Aktif'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                            title={isEn ? 'Delete Product' : 'Hapus Produk'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: KONFIRMASI HAPUS */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">
              {isEn ? 'Delete Product?' : 'Hapus Produk Ini?'}
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {isEn
                ? `Are you sure you want to permanently delete "${productToDelete.name}"? This action cannot be undone.`
                : `Apakah Anda yakin ingin menghapus permanen produk "${productToDelete.name}"? Tindakan ini tidak dapat dibatalkan.`}
            </p>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isEn ? 'Yes, Delete' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
