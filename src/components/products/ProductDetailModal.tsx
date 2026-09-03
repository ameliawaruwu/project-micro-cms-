import React from 'react';
import {
  X,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { StockBadge } from './StockBadge';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  storeSlug?: string;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: ProductStatus) => void;
  onToggleStatus?: (id: string, newStatus: ProductStatus) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  storeSlug = 'toko',
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onToggleStatus,
}) => {
  if (!isOpen || !product) return null;

  const handleStatusChangeInternal = (id: string, status: ProductStatus) => {
    if (onToggleStatus) onToggleStatus(id, status);
    if (onStatusChange) onStatusChange(id, status);
  };

  const publicUrl = `https://kroombox.id/${storeSlug}/product/${product.slug || product.id}`;

  const copyProductLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    alert('Tautan produk berhasil disalin!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-[#241A1A]/50 backdrop-blur-xs overflow-y-auto font-sans text-left">
      <div className="bg-white rounded-[22px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#E5E0DD] my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0DD]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#706866]">Rincian Produk</span>
            <StockBadge status={product.status} stock={product.stock} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer border border-transparent hover:border-[#E5E0DD]"
            aria-label="Tutup rincian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product info layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 my-5">
          {/* Gallery / Image */}
          <div className="sm:col-span-5 space-y-3">
            <div className="w-full aspect-square rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] overflow-hidden shadow-2xs">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={copyProductLink}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA] border border-[#E5E0DD] hover:border-[#66000E] text-xs font-bold text-[#241A1A] hover:text-[#66000E] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Salin Link Produk</span>
            </button>
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-3.5">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF7F7] border border-[#E5E0DD] text-[#66000E] text-[11px] font-bold mb-1.5">
                {product.category}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#241A1A] leading-snug">
                {product.name}
              </h2>
              {product.sku && (
                <p className="text-xs text-[#706866] font-mono mt-0.5">Kode SKU: {product.sku}</p>
              )}
            </div>

            {/* Price & Stock info box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD]">
              <div>
                <span className="text-[10px] font-bold text-[#706866] uppercase tracking-wider block mb-0.5">
                  Harga Jual
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#66000E]">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[11px] text-[#706866] line-through block">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#706866] uppercase tracking-wider block mb-0.5">
                  Sisa Stok
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#241A1A]">
                  {product.stock} <span className="text-xs font-normal text-[#706866]">Unit</span>
                </span>
                <span className="text-[11px] text-[#706866] block mt-0.5 font-medium">
                  Berat: {product.weightGrams || 250}g
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                Deskripsi Produk
              </h4>
              <p className="text-xs text-[#706866] leading-relaxed max-h-24 overflow-y-auto pr-1">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </div>

            {/* Sales Stats preview */}
            <div className="p-3 rounded-xl bg-[#F5E8EA] border border-[#E8DDDE] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#66000E]" />
                <span className="font-bold text-[#66000E]">Total Terjual</span>
              </div>
              <span className="font-bold text-[#66000E]">
                {product.salesCount || 14} Transaksi
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions: Status selector, Edit, Duplicate, Delete */}
        <div className="pt-4 border-t border-[#E5E0DD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#706866]">Status:</span>
            <select
              value={product.status}
              onChange={(e) => onStatusChange(product.id, e.target.value as ProductStatus)}
              aria-label="Status ketersediaan"
              className="py-1.5 px-3 rounded-xl border border-[#E5E0DD] text-xs font-bold text-[#241A1A] bg-white focus:outline-none focus:border-[#66000E]"
            >
              <option value="Tersedia">Tersedia</option>
              <option value="Hampir Habis">Hampir Habis</option>
              <option value="Habis">Habis</option>
              <option value="Nonaktif">Nonaktifkan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(product)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA] text-[#241A1A] hover:text-[#66000E] border border-[#E5E0DD] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplikat</span>
            </button>

            <button
              onClick={() => onDelete(product.id)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>

            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 min-h-[38px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Produk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
