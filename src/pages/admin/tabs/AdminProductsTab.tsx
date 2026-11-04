import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit3,
  Trash2,
  Store as StoreIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Layers,
  ArrowUpDown,
  X,
  Upload,
} from 'lucide-react';
import { Product, ProductStatus, Store, User } from '../../../types';
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

  // Modal: Tambah Produk
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    storeId: '',
    name: '',
    category: 'Kuliner',
    price: 0,
    stock: 10,
    weightGrams: 250,
    description: '',
    imageUrl: '',
  });

  // Modal: Edit Produk
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    weightGrams: 250,
    status: 'Tersedia' as ProductStatus,
    description: '',
    imageUrl: '',
  });

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
      setProducts(fetchedProducts || []);
      setStores(fetchedStores || []);
      if (fetchedStores && fetchedStores.length > 0 && !addForm.storeId) {
        setAddForm((prev) => ({ ...prev, storeId: fetchedStores[0].id }));
      }
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

  // Handlers: Tambah Produk
  const handleOpenAddModal = () => {
    setAddForm({
      storeId: stores[0]?.id || '',
      name: '',
      category: 'Kuliner',
      price: 25000,
      stock: 10,
      weightGrams: 250,
      description: '',
      imageUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.storeId) {
      notify(isEn ? 'Please select a store' : 'Silakan pilih toko tujuan');
      return;
    }
    if (!addForm.name.trim()) {
      notify(isEn ? 'Product name is required' : 'Nama produk wajib diisi');
      return;
    }
    if (addForm.price < 0) {
      notify(isEn ? 'Price cannot be negative' : 'Harga tidak boleh kurang dari 0');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await productService.createProduct(addForm.storeId, {
        name: addForm.name.trim(),
        category: addForm.category.trim() || 'Umum',
        price: Number(addForm.price),
        stock: Number(addForm.stock),
        weightGrams: Number(addForm.weightGrams) || 250,
        description: addForm.description.trim(),
        imageUrl: addForm.imageUrl.trim() || '',
        images: addForm.imageUrl.trim() ? [addForm.imageUrl.trim()] : [],
      });

      notify(isEn ? `Product "${res.product.name}" added successfully` : `Produk "${res.product.name}" berhasil ditambahkan`);
      setIsAddModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      console.error('[AdminProductsTab] Create error:', err);
      notify(isEn ? `Failed: ${err.message}` : `Gagal: ${err.message}`);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handlers: Edit Produk
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category || 'Umum',
      price: product.price,
      stock: product.stock,
      weightGrams: product.weightGrams || 250,
      status: product.status || 'Tersedia',
      description: product.description || '',
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editForm.name.trim()) {
      notify(isEn ? 'Product name is required' : 'Nama produk wajib diisi');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await productService.updateProduct(editingProduct.id, {
        storeId: editingProduct.storeId,
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        weightGrams: Number(editForm.weightGrams),
        status: editForm.status,
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim(),
        images: editForm.imageUrl.trim() ? [editForm.imageUrl.trim()] : [],
      });

      notify(isEn ? `Product "${editForm.name}" updated` : `Produk "${editForm.name}" berhasil diperbarui`);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      await loadAllData();
    } catch (err: any) {
      console.error('[AdminProductsTab] Edit error:', err);
      notify(isEn ? `Update failed: ${err.message}` : `Gagal memperbarui: ${err.message}`);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handlers: Hapus Produk
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id, productToDelete.storeId);
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

  // Helper image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify(isEn ? 'Max image size is 2MB' : 'Ukuran gambar maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      if (mode === 'add') {
        setAddForm((prev) => ({ ...prev, imageUrl: res }));
      } else {
        setEditForm((prev) => ({ ...prev, imageUrl: res }));
      }
    };
    reader.readAsDataURL(file);
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
                {isEn ? 'Product Management' : 'Kelola Produk'}
              </h1>
              <p className="text-xs text-gray-500">
                {isSubAdmin
                  ? (isEn ? 'Manage product catalog across LapakQ stores (View, Add, Edit, Delete)' : 'Kelola katalog produk toko binaan LapakQ (Lihat, Tambah, Edit, Hapus)')
                  : (isEn ? 'Master catalog of all merchant products on LapakQ' : 'Katalog master seluruh produk toko UMKM di LapakQ')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isEn ? 'Add Product' : 'Tambah Produk'}</span>
        </button>
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
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-gray-500 hover:text-[#66000E] hover:bg-[#F5E8EA] rounded-md transition cursor-pointer"
                            title={isEn ? 'Edit Product' : 'Edit Produk'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL: TAMBAH PRODUK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#66000E]/10 rounded-lg text-[#66000E]">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {isEn ? 'Add New Product' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Target Store' : 'Toko Tujuan'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.storeId}
                  onChange={(e) => setAddForm({ ...addForm, storeId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] text-gray-800 font-medium"
                >
                  <option value="" disabled>-- {isEn ? 'Select Store' : 'Pilih Toko'} --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Product Name' : 'Nama Produk'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Contoh: Kopi Robusta Garut 250g"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Category' : 'Kategori'}
                  </label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    placeholder="Kuliner, Fashion, dll"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Price (Rp)' : 'Harga (Rp)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Stock' : 'Stok Awal'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Weight (grams)' : 'Berat (gram)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.weightGrams}
                    onChange={(e) => setAddForm({ ...addForm, weightGrams: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Product Photo' : 'Foto Produk (URL / Upload)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addForm.imageUrl}
                    onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
                    placeholder="https://... atau pilih file"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'add')}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Description' : 'Deskripsi Produk'}
                </label>
                <textarea
                  rows={3}
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Ceritakan keunggulan produk ini..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 bg-[#66000E] hover:bg-[#7D0012] text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isEn ? 'Save Product' : 'Simpan Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUK */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#66000E]/10 rounded-lg text-[#66000E]">
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {isEn ? 'Edit Product' : 'Edit Detail Produk'}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {editingProduct.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Product Name' : 'Nama Produk'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Category' : 'Kategori'}
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Price (Rp)' : 'Harga (Rp)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Stock' : 'Stok'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Weight (g)' : 'Berat (g)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.weightGrams}
                    onChange={(e) => setEditForm({ ...editForm, weightGrams: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {isEn ? 'Status' : 'Status'}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E] font-medium"
                  >
                    <option value="Tersedia">{isEn ? 'Available' : 'Tersedia / Aktif'}</option>
                    <option value="Hampir Habis">{isEn ? 'Low Stock' : 'Hampir Habis'}</option>
                    <option value="Habis">{isEn ? 'Out of Stock' : 'Habis'}</option>
                    <option value="Nonaktif">{isEn ? 'Inactive' : 'Nonaktif'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Photo (URL / Upload)' : 'Foto Produk (URL / Upload)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'edit')}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEn ? 'Description' : 'Deskripsi'}
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#66000E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-[#66000E] hover:bg-[#7D0012] text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isEn ? 'Update Product' : 'Perbarui Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
