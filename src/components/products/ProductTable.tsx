import React from 'react';
import { Edit2, Trash2, Plus, Search, Eye, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ProductTableProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  selectedStatus?: string;
  searchQuery: string;
  sortBy?: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onSortChange?: (sort: string) => void;
  onAddProduct: () => void;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDuplicateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onQuickStockChange?: (id: string, delta: number) => void;
  onSyncProducts?: () => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onAddProduct,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}) => {

  return (
    <div className="space-y-4 font-sans">
      {/* Header filter controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E0DD] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#706866] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama produk, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-xs sm:text-sm text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] focus:bg-white transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter kategori"
            className="py-2.5 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs sm:text-sm shadow-2xs transition transform active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F9EDEF] border border-[#F0D5D8] text-[#66000E] mx-auto flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#241A1A]">Belum ada produk</h3>
            <p className="text-xs text-[#706866] mt-1 max-w-sm mx-auto font-normal">
              Tambahkan produk dagangan Anda agar etalase toko online dapat langsung dikunjungi pelanggan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F7] border-b border-[#E5E0DD] text-[11px] font-semibold uppercase tracking-wider text-[#706866]">
                  <th className="py-3.5 px-4 pl-6 font-semibold">Produk</th>
                  <th className="py-3.5 px-4 font-semibold">Kategori</th>
                  <th className="py-3.5 px-4 font-semibold">Harga</th>
                  <th className="py-3.5 px-4 font-semibold">Stok</th>
                  <th className="py-3.5 px-4 pr-6 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0DD] font-normal text-[#241A1A]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF7F7] transition group">
                    {/* Product image & name */}
                    <td className="py-3.5 px-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 transition-all ${
                          prod.stock <= 5 
                            ? 'border-2 border-red-500 ring-2 ring-red-100' 
                            : 'border border-[#E5E0DD]'
                        }`}>
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=200'}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-[#241A1A] leading-snug hover:text-[#66000E] cursor-pointer"
                            onClick={() => onViewProduct(prod)}
                          >
                            {prod.name}
                          </p>
                          {prod.sku && (
                            <span className="text-[10px] text-[#706866] font-mono">SKU: {prod.sku}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category - Plain text */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[#706866] font-medium">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#241A1A] text-xs sm:text-sm">
                          {formatRupiah(prod.price)}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-[#706866] line-through">
                            {formatRupiah(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock - Plain count display */}
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-mono ${
                        prod.stock <= 5
                          ? 'font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block'
                          : 'font-semibold text-[#241A1A]'
                      }`}>
                        {prod.stock}
                      </span>
                    </td>

                    {/* Actions: Lihat, Edit, Hapus */}
                    <td className="py-3.5 px-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewProduct(prod)}
                          className="p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer"
                          title="Lihat Detail Produk"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProduct(prod)}
                          className="p-1.5 rounded-lg text-[#706866] hover:text-[#66000E] hover:bg-[#F9EDEF] transition cursor-pointer"
                          title="Ubah Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-[#706866] hover:text-[#66000E] hover:bg-[#F9EDEF] transition cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
