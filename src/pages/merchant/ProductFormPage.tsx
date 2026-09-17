import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Camera,
  Save,
  Package,
  HelpCircle,
  Tag,
  UploadCloud,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Plus,
  X,
} from 'lucide-react';
import { Product } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';

export const DEFAULT_PRODUCT_CATEGORIES = [
  'Pakaian & Fashion',
  'Makanan & Minuman',
  'Kesehatan & Kecantikan',
  'Elektronik & Gadget',
  'Aksesoris & Perhiasan',
  'Rumah Tangga & Dapur',
  'Hobi, Mainan & Koleksi',
  'Buku & Alat Tulis',
  'Otomotif',
  'Umum',
];

interface ProductFormPageProps {
  productToEdit?: Product | null;
  categories: string[];
  onBack: () => void;
  onSave: (data: any) => Promise<void> | void;
}

export const ProductFormPage: React.FC<ProductFormPageProps> = ({
  productToEdit,
  categories,
  onBack,
  onSave,
}) => {
  const { t } = useLanguage();
  const isEditing = Boolean(productToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available categories: Combine passed categories with default popular options
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    (categories || []).forEach((c) => {
      if (c && c.trim() && c !== '__new__') set.add(c.trim());
    });
    DEFAULT_PRODUCT_CATEGORIES.forEach((c) => set.add(c));
    return Array.from(set);
  }, [categories]);

  // Form states
  const [name, setName] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [stockDisplay, setStockDisplay] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sku, setSku] = useState('');
  const [weightDisplay, setWeightDisplay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Number formatters
  const formatThousand = (val: number | string): string => {
    if (val === '' || val === undefined || val === null) return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('id-ID').format(Number(clean));
  };

  const parseNumber = (val: string): number => {
    const clean = String(val).replace(/\D/g, '');
    return clean ? Number(clean) : 0;
  };

  // Initialize form when editing or adding
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setPriceDisplay(formatThousand(productToEdit.price));
      setStockDisplay(productToEdit.stock !== undefined && productToEdit.stock !== null ? String(productToEdit.stock) : '');
      setDescription(productToEdit.description || '');

      // Load all images
      const initialImgs: string[] = [];
      if (productToEdit.imageUrl) initialImgs.push(productToEdit.imageUrl);
      if (productToEdit.images && Array.isArray(productToEdit.images)) {
        productToEdit.images.forEach((img) => {
          if (img && !initialImgs.includes(img)) initialImgs.push(img);
        });
      }
      setImages(initialImgs);
      setActiveImageIndex(0);

      setSku(productToEdit.sku || '');
      setWeightDisplay(productToEdit.weightGrams ? String(productToEdit.weightGrams) : '');

      if (productToEdit.category && availableCategories.includes(productToEdit.category)) {
        setCategory(productToEdit.category);
        setCustomCategory('');
      } else if (productToEdit.category) {
        setCategory('__new__');
        setCustomCategory(productToEdit.category);
      } else {
        setCategory(availableCategories[0] || 'Umum');
        setCustomCategory('');
      }
    } else {
      // Reset defaults for Add New
      setName('');
      setPriceDisplay('');
      setStockDisplay('');
      setCategory(availableCategories[0] || 'Umum');
      setCustomCategory('');
      setDescription('');
      setImages([]);
      setActiveImageIndex(0);
      setSku('');
      setWeightDisplay('');
      setErrorMsg('');
    }
  }, [productToEdit, availableCategories]);

  // Multiple files processing helper (device only)
  const processFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrorMsg('Harap pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    const oversized = validFiles.some((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setErrorMsg('Ukuran setiap file foto maksimal 5 MB.');
      return;
    }

    setErrorMsg('');
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setErrorMsg('Maksimal 5 foto untuk satu produk.');
      return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);

    Promise.all(
      filesToProcess.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((newBase64s) => {
      setImages((prev) => {
        const combined = [...prev, ...newBase64s];
        return combined.slice(0, 5);
      });
      // Point to newly uploaded photo if was empty
      if (images.length === 0) {
        setActiveImageIndex(0);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Remove specific image
  const handleRemoveSpecificImage = (idxToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== idxToRemove);
      return updated;
    });
    if (activeImageIndex >= idxToRemove && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  const currentPreviewImage = images[activeImageIndex] || images[0] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (images.length === 0) {
      setErrorMsg('Silakan pilih dan upload minimal 1 foto produk dari perangkat Anda.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama produk wajib diisi.');
      return;
    }

    const price = parseNumber(priceDisplay);
    if (!price || price <= 0) {
      setErrorMsg('Harga jual harus lebih dari Rp 0.');
      return;
    }

    const finalCategory = category === '__new__' ? customCategory.trim() : category;
    if (!finalCategory) {
      setErrorMsg('Kategori produk wajib dipilih atau diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        price,
        stock: stockDisplay ? parseNumber(stockDisplay) : 0,
        category: finalCategory,
        description: description.trim(),
        imageUrl: images[0],
        images: images,
        sku: sku.trim() || undefined,
        weightGrams: weightDisplay ? parseNumber(weightDisplay) : undefined,
        status: (stockDisplay === '' || parseNumber(stockDisplay) > 0) ? 'Aktif' : 'Habis',
      };

      await onSave(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan produk. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-28 lg:pb-12 text-left max-w-5xl mx-auto">
      {/* 1. Top Breadcrumb & Back Action */}
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: t('nav_products', 'Produk'), onClick: onBack },
            { label: isEditing ? `${t('edit_product_title', 'Edit Produk')}: ${name || 'Produk'}` : t('add_product_title', 'Tambah Produk Baru'), isActive: true },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-3 border-b border-[#E5E0DD]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-[#E5E0DD] bg-white text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer shrink-0 shadow-2xs"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] tracking-tight">
                {isEditing ? t('edit_product_title', 'Edit Produk') : t('add_product_title', 'Tambah Produk Baru')}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] text-xs font-semibold text-[#706866] hover:text-[#241A1A] transition cursor-pointer min-h-[38px]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#66000E] hover:bg-[#52000B] active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer min-h-[38px]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden File Input for Device Upload (Multiple) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFilesChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Media & Product Image (Device Only) (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E0DD] shadow-2xs h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
              <h3 className="text-sm font-bold text-[#241A1A] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#66000E]" />
                <span>Foto Produk</span>
              </h3>
            </div>

            {/* Photo Preview or Interactive Dropzone - Flexibly fills the height without empty gap */}
            <div className="flex-1 flex flex-col min-h-[260px]">
              {currentPreviewImage ? (
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden bg-[#FAF7F7] border-2 border-[#E5E0DD] group">
                    <img
                      src={currentPreviewImage}
                      alt="Preview Produk"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Active index badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide">
                      {activeImageIndex === 0 ? 'Foto Sampul (Utama)' : `Foto #${activeImageIndex + 1}`}
                    </div>
                  </div>

                  {/* Device Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] hover:bg-[#F5E8EA] hover:border-[#66000E] text-xs font-bold text-[#241A1A] hover:text-[#66000E] flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Foto Lain</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecificImage(activeImageIndex)}
                      className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[36px]"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 min-h-[250px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group ${
                    isDragging
                      ? 'border-[#66000E] bg-[#F9EDEF] scale-[0.99]'
                      : 'border-[#D1C9C5] hover:border-[#66000E] bg-[#FAF7F7] hover:bg-[#FDFBFB]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0DD] text-[#66000E] group-hover:bg-[#F5E8EA] flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#241A1A]">
                    Pilih Foto Produk
                  </h4>

                  <div className="mt-3.5 px-4 py-2 rounded-xl bg-[#66000E] text-white text-xs font-semibold shadow-2xs group-hover:bg-[#52000B] transition flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Jelajahi File</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Gallery Thumbnail Row (Replaces grey notice box) */}
            <div className="pt-3 border-t border-[#E5E0DD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#241A1A]">
                  Daftar Foto Produk ({images.length}/5)
                </span>
                <span className="text-[10px] text-[#706866]">Klik foto untuk pratinjau</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, idx) => (
                  <div
                    key={`thumbnail-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer group ${
                      activeImageIndex === idx
                        ? 'border-[#66000E] ring-2 ring-[#66000E]/20 scale-95 shadow-xs'
                        : 'border-[#E5E0DD] hover:border-[#706866]'
                    }`}
                  >
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#66000E] text-white text-[8px] font-bold text-center py-0.5 leading-none">
                        Utama
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSpecificImage(idx);
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs"
                      title="Hapus foto ini"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-[#D1C9C5] hover:border-[#66000E] bg-[#FAF7F7] hover:bg-[#F9EDEF] text-[#706866] hover:text-[#66000E] flex flex-col items-center justify-center gap-0.5 shrink-0 transition cursor-pointer"
                    title="Upload foto lainnya"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold">Tambah</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Product Info (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E0DD] shadow-2xs h-full flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-[#241A1A] pb-2 border-b border-[#E5E0DD] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#66000E]" />
              <span>Informasi Utama Produk</span>
            </h3>

            {/* Nama Produk */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#241A1A]">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kemeja Batik Tulis Sutra Parang"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition"
              />
            </div>

            {/* Kategori & Harga Produk (Sejajar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#241A1A] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#66000E]" />
                  <span>Kategori Produk <span className="text-rose-500">*</span></span>
                </label>
                <div className="space-y-2">
                  {category === '__new__' ? (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          autoFocus
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Tulis nama kategori baru (contoh: Boneka)..."
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#66000E] bg-white text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 transition"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#706866]">Kategori kustom baru</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(availableCategories[0] || 'Umum');
                            setCustomCategory('');
                          }}
                          className="text-[11px] font-semibold text-[#66000E] hover:underline cursor-pointer"
                        >
                          Batal (Pilih dari daftar)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setCategory('__new__');
                          setCustomCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition cursor-pointer"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new__">+ Tambah Kategori Baru...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#241A1A] flex items-center gap-1.5">
                  <span>Harga Produk (Rp) <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706866]">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={priceDisplay}
                    onChange={(e) => setPriceDisplay(formatThousand(e.target.value))}
                    placeholder="Contoh: 150.000"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition"
                  />
                </div>
              </div>
            </div>

            {/* Inventory & Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#241A1A]">Jumlah Stok</label>
                <input
                  type="number"
                  min="0"
                  value={stockDisplay}
                  onChange={(e) => setStockDisplay(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#241A1A]">Kode SKU (Opsional)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: SKU-001"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#241A1A]">Berat Barang (Gram)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={weightDisplay}
                    onChange={(e) => setWeightDisplay(e.target.value)}
                    placeholder="Contoh: 250"
                    className="w-full pl-3.5 pr-8 py-2.5 text-xs rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#706866] font-semibold">
                    g
                  </span>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#241A1A]">Deskripsi Lengkap Produk</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan keunggulan, bahan material, ukuran detail, dan instruksi perawatan produk..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E] transition resize-y"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Actions Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#E5E0DD] z-40 flex items-center justify-end gap-2 shadow-lg">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-bold text-[#706866] text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-[#66000E] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Produk</span>
          </button>
        </div>
      </form>
    </div>
  );
};
