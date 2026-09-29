import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Camera,
  Check,
  Upload,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { compressProductImage } from '../../pages/merchant/ProductFormPage';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  categories: string[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  categories,
  isSaving = false,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [name, setName] = useState('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [sellingPriceDisplay, setSellingPriceDisplay] = useState('');
  const [stockDisplay, setStockDisplay] = useState('10');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [weightDisplay, setWeightDisplay] = useState('250');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Curated default categories for UMKM & retail stores, merged with existing categories
  const availableCategories = useMemo(() => {
    const defaults = isEn
      ? [
          'Clothing & Fashion',
          'Food & Beverages',
          'Health & Beauty',
          'Handicrafts & Accessories',
          'Electronics & Gadgets',
          'Home & Living',
          'Hobby & Sports',
        ]
      : [
          'Pakaian & Fashion',
          'Makanan & Minuman',
          'Kesehatan & Kecantikan',
          'Kerajinan & Aksesoris',
          'Elektronik & Gadget',
          'Rumah Tangga',
          'Hobi & Olahraga',
        ];

    const set = new Set<string>();
    defaults.forEach((c) => set.add(c));
    categories.forEach((c) => {
      if (c && c !== 'new' && c !== 'Lainnya' && c !== 'Other' && c !== 'Umum') {
        set.add(c);
      }
    });
    set.add(isEn ? 'Other' : 'Lainnya');
    return Array.from(set);
  }, [categories, isEn]);

  // Helper formatting numbers with thousand separator
  const formatThousand = (val: number | string): string => {
    if (val === '' || val === undefined || val === null) return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat(isEn ? 'en-US' : 'id-ID').format(Number(clean));
  };

  const parseNumber = (val: string): number => {
    const clean = String(val).replace(/\D/g, '');
    return clean ? Number(clean) : 0;
  };



  // File upload and compression handler (supports JPG/PNG max 10MB)
  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate format: JPG, JPEG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!validTypes.includes(file.type) && !hasValidExt) {
      setPhotoError(
        isEn
          ? 'Invalid file format. Please upload JPG, PNG, or WEBP image.'
          : 'Format file tidak didukung. Harap upload foto format JPG, PNG, atau WEBP.'
      );
      return;
    }

    // Validate size: Maximum 10 MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPhotoError(
        isEn
          ? `File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed is 10 MB.`
          : `Ukuran file ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maksimal ukuran foto adalah 10 MB.`
      );
      return;
    }

    setPhotoError('');
    setIsProcessingPhoto(true);
    try {
      const compressed = await compressProductImage(file, 1200, 0.85);
      if (compressed) {
        setImageUrl(compressed);
      } else {
        setPhotoError(
          isEn
            ? 'Failed to process image. Please try another photo.'
            : 'Gagal memproses foto. Silakan coba file gambar lain.'
        );
      }
    } catch {
      setPhotoError(
        isEn
          ? 'Error reading photo file.'
          : 'Terjadi kesalahan saat memproses file foto.'
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const prevIsOpenRef = useRef(false);
  const prevProductToEditIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only initialize/reset form when modal is first opened or target product changes
    const justOpened = isOpen && !prevIsOpenRef.current;
    const productChanged = (productToEdit?.id || '') !== (prevProductToEditIdRef.current || '');

    if (isOpen && (justOpened || productChanged)) {
      setPhotoError('');
      if (productToEdit) {
        setName(productToEdit.name || '');
        if (productToEdit.originalPrice && productToEdit.originalPrice > productToEdit.price) {
          setOriginalPriceDisplay(formatThousand(productToEdit.originalPrice));
          setSellingPriceDisplay(formatThousand(productToEdit.price));
          const pct = Math.round(
            ((productToEdit.originalPrice - productToEdit.price) / productToEdit.originalPrice) * 100
          );
          setDiscountPercent(String(pct));
        } else {
          setOriginalPriceDisplay(productToEdit.price ? formatThousand(productToEdit.price) : '');
          setSellingPriceDisplay(productToEdit.price ? formatThousand(productToEdit.price) : '');
          setDiscountPercent('');
        }
        setStockDisplay(productToEdit.stock !== undefined ? String(productToEdit.stock) : '10');

        const prodCat = productToEdit.category || '';
        if (availableCategories.includes(prodCat)) {
          setCategory(prodCat);
          setCustomCategory('');
        } else if (prodCat) {
          setCategory('new');
          setCustomCategory(prodCat);
        } else {
          setCategory(availableCategories[0] || (isEn ? 'Clothing & Fashion' : 'Pakaian & Fashion'));
          setCustomCategory('');
        }

        const cleanDesc = (productToEdit.description || '').replace(/\s*<!--orig_price:\d+(?:\.\d+)?-->/g, '').trim();
        setDescription(cleanDesc);
        setImageUrl(productToEdit.imageUrl || '');
        setWeightDisplay(productToEdit.weightGrams ? String(productToEdit.weightGrams) : '250');
      } else {
        setName('');
        setOriginalPriceDisplay('');
        setDiscountPercent('');
        setSellingPriceDisplay('');
        setStockDisplay('10');
        setCategory(availableCategories[0] || (isEn ? 'Clothing & Fashion' : 'Pakaian & Fashion'));
        setCustomCategory('');
        setDescription('');
        setImageUrl('');
        setWeightDisplay('250');
      }
    }

    prevIsOpenRef.current = isOpen;
    prevProductToEditIdRef.current = productToEdit?.id;
  }, [isOpen, productToEdit?.id, availableCategories, isEn]);

  if (!isOpen) return null;

  // When Regular/Normal Price is changed
  const handleOriginalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setOriginalPriceDisplay('');
      setSellingPriceDisplay('');
      return;
    }
    const normalPrice = Number(rawVal);
    setOriginalPriceDisplay(formatThousand(normalPrice));

    const pct = Number(discountPercent) || 0;
    if (pct > 0 && pct < 100) {
      const discounted = Math.round(normalPrice * (1 - pct / 100));
      setSellingPriceDisplay(formatThousand(discounted));
    } else {
      setSellingPriceDisplay(formatThousand(normalPrice));
    }
  };

  // Standard discount percentage options for dropdown
  const DISCOUNT_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75];

  // When Discount (%) dropdown is changed
  const handleDiscountDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val || val === '0') {
      setDiscountPercent('');
      if (originalPriceDisplay) {
        setSellingPriceDisplay(originalPriceDisplay);
      }
      return;
    }
    const pct = Number(val);
    setDiscountPercent(String(pct));

    const normalPrice = parseNumber(originalPriceDisplay) || parseNumber(sellingPriceDisplay);
    if (normalPrice > 0) {
      if (!originalPriceDisplay) {
        setOriginalPriceDisplay(formatThousand(normalPrice));
      }
      const discounted = Math.round(normalPrice * (1 - pct / 100));
      setSellingPriceDisplay(formatThousand(discounted));
    }
  };

  // Remove discount action
  const removeDiscount = () => {
    setDiscountPercent('');
    if (originalPriceDisplay) {
      setSellingPriceDisplay(originalPriceDisplay);
    }
  };

  // When Selling Price is directly edited by user
  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setSellingPriceDisplay('');
      return;
    }
    const sellPrice = Number(rawVal);
    setSellingPriceDisplay(formatThousand(sellPrice));

    const normalPrice = parseNumber(originalPriceDisplay);
    if (normalPrice > sellPrice) {
      const pct = Math.round(((normalPrice - sellPrice) / normalPrice) * 100);
      setDiscountPercent(String(pct));
    } else {
      setDiscountPercent('');
      setOriginalPriceDisplay(formatThousand(sellPrice));
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setStockDisplay(rawVal);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setWeightDisplay(rawVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(isEn ? 'Please enter a product name.' : 'Mohon masukkan nama produk.');
      return;
    }

    const finalSellingPrice = parseNumber(sellingPriceDisplay) || parseNumber(originalPriceDisplay);
    if (finalSellingPrice <= 0) {
      alert(isEn ? 'Please enter a valid product price (e.g. 50,000).' : 'Mohon masukkan harga produk yang valid (contoh: 50.000).');
      return;
    }

    if (!imageUrl) {
      setPhotoError(isEn ? 'Please upload a product photo.' : 'Mohon unggah foto produk.');
      alert(isEn ? 'Please upload a product photo.' : 'Mohon unggah foto produk terlebih dahulu.');
      return;
    }

    let finalCategory = category;
    if (category === 'new') {
      finalCategory = customCategory.trim() || (isEn ? 'Other' : 'Lainnya');
    }

    const normalPrice = parseNumber(originalPriceDisplay);
    let originalPriceVal: number | undefined = undefined;

    if (normalPrice > finalSellingPrice) {
      originalPriceVal = normalPrice;
    }

    onSave({
      name: name.trim(),
      price: finalSellingPrice,
      originalPrice: originalPriceVal,
      stock: parseNumber(stockDisplay),
      category: finalCategory || (isEn ? 'Other' : 'Lainnya'),
      description: description.trim() || (isEn ? 'Quality product from our store.' : 'Produk berkualitas dari toko kami.'),
      imageUrl: imageUrl,
      weightGrams: parseNumber(weightDisplay) || 250,
    });
  };

  return (
    <div
      id="modal-product-form"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#241A1A]/60 backdrop-blur-xs font-sans text-left"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl lg:max-w-3xl w-full shadow-2xl border border-[#E5E0DD] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0DD] shrink-0 bg-white">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#241A1A] tracking-tight">
              {productToEdit
                ? (isEn ? 'Edit Product Details' : 'Ubah Rincian Produk')
                : (isEn ? 'Add New Product' : 'Tambah Produk Baru')}
            </h3>
            <p className="text-xs text-[#706866] mt-0.5 font-normal">
              {isEn ? 'Fill in the basic product details to start selling' : 'Isi data sederhana di bawah untuk mulai jualan'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer border border-transparent hover:border-[#E5E0DD]"
            aria-label={isEn ? 'Close' : 'Tutup'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Left Column: Photo Upload (JPG/PNG max 10MB) & Weight */}
              <div className="md:col-span-5 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A]">
                      {isEn ? 'PRODUCT PHOTO' : 'FOTO PRODUK'} <span className="text-[#66000E]">*</span>
                    </label>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setPhotoError('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Remove' : 'Hapus'}</span>
                      </button>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Dropzone & Preview Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleFileDrop}
                    className={`w-full aspect-square max-w-[220px] md:max-w-none mx-auto rounded-2xl border-2 ${
                      isDragging
                        ? 'border-[#66000E] bg-[#66000E]/5 scale-[1.01]'
                        : imageUrl
                        ? 'border-[#E5E0DD] bg-[#FAF7F7]'
                        : 'border-dashed border-[#E5E0DD] bg-[#FAF7F7] hover:border-[#66000E]/50'
                    } overflow-hidden flex flex-col items-center justify-center relative shadow-2xs group transition cursor-pointer`}
                  >
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Preview Produk"
                          className="w-full h-full object-cover transition group-hover:scale-105 duration-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                          <Upload className="w-6 h-6" />
                          <span className="text-xs font-semibold">
                            {isEn ? 'Change Photo' : 'Ganti Foto'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#E5E0DD] flex items-center justify-center mx-auto mb-2 text-[#66000E] group-hover:scale-110 transition">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-[#241A1A] block">
                          {isEn ? 'Upload Photo' : 'Upload Foto Produk'}
                        </span>
                        <span className="text-[11px] text-[#706866] mt-0.5 block">
                          {isEn ? 'Click or drag photo here' : 'Klik atau seret foto ke sini'}
                        </span>
                      </div>
                    )}

                    {isProcessingPhoto && (
                      <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                        <div className="w-6 h-6 border-2 border-[#66000E] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-semibold text-[#66000E]">
                          {isEn ? 'Processing photo...' : 'Memproses foto...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Button & Specs */}
                  <div className="mt-2 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] text-xs font-semibold text-[#241A1A] flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs hover:border-[#66000E]/40"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>
                        {imageUrl
                          ? (isEn ? 'Change Photo from Device' : 'Ganti Foto dari Perangkat')
                          : (isEn ? 'Choose JPG / PNG from Device' : 'Pilih Foto dari Perangkat')}
                      </span>
                    </button>

                    <p className="text-[10px] text-[#706866] text-center font-medium">
                      JPG, PNG, atau WEBP • Maksimal <strong>10 MB</strong>
                    </p>

                    {photoError && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium text-center animate-in fade-in">
                        {photoError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Name, Price, Stock, Category, Description */}
              <div className="md:col-span-7 space-y-3.5">
                
                {/* Nama Produk */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
                    {isEn ? 'PRODUCT NAME' : 'NAMA PRODUK'} <span className="text-[#66000E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? 'e.g. Silk Batik Long Sleeve Shirt' : 'Contoh: Kemeja Batik Parang Slimfit'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs sm:text-sm text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10 transition"
                  />
                </div>

                {/* Harga Normal, Diskon Dropdown, & Harga Jual Akhir */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Normal / Base Price */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                        {isEn ? 'REGULAR PRICE' : 'HARGA NORMAL'} <span className="text-[#66000E]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706866]">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder={isEn ? '125,000' : 'Contoh: 125.000'}
                          value={originalPriceDisplay}
                          onChange={handleOriginalPriceChange}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E0DD] text-xs sm:text-sm font-semibold text-[#241A1A] placeholder:text-[#9A9290] placeholder:font-normal focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                        />
                      </div>
                    </div>

                    {/* Discount Dropdown */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A]">
                          {isEn ? 'DISCOUNT' : 'DISKON'}
                        </label>
                        {discountPercent && Number(discountPercent) > 0 && (
                          <button
                            type="button"
                            onClick={removeDiscount}
                            className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            {isEn ? 'Remove' : 'Hapus diskon'}
                          </button>
                        )}
                      </div>
                      <select
                        value={discountPercent || '0'}
                        onChange={handleDiscountDropdownChange}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs sm:text-sm font-semibold text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10 cursor-pointer"
                      >
                        <option value="0">{isEn ? 'No Discount (0%)' : 'Tanpa Diskon (0%)'}</option>
                        {discountPercent &&
                          Number(discountPercent) > 0 &&
                          !DISCOUNT_OPTIONS.includes(Number(discountPercent)) && (
                            <option value={discountPercent}>{discountPercent}%</option>
                          )}
                        {DISCOUNT_OPTIONS.map((pct) => (
                          <option key={pct} value={String(pct)}>
                            {pct}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selling Price (Input that automatically updates!) */}
                  <div className="p-3 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#241A1A]">
                        {isEn ? 'FINAL SELLING PRICE (BUYER PAYS)' : 'HARGA JUAL AKHIR (YANG DIBAYAR PEMBELI)'} <span className="text-[#66000E]">*</span>
                      </label>
                      {discountPercent && Number(discountPercent) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Hemat {discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#66000E]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder={isEn ? '112,500' : '112.500'}
                        value={sellingPriceDisplay}
                        onChange={handleSellingPriceChange}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs sm:text-sm font-bold text-[#66000E] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Kategori Produk */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                    {isEn ? 'PRODUCT CATEGORY' : 'KATEGORI PRODUK'}
                  </label>

                  {category === 'new' ? (
                    <div className="relative animate-in fade-in duration-150">
                      <input
                        type="text"
                        autoFocus
                        placeholder={isEn ? 'Type new category name...' : 'Ketik nama kategori baru...'}
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#66000E] bg-white text-xs font-semibold text-[#241A1A] placeholder:text-[#9A9290] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#66000E]/15"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(availableCategories[0] || (isEn ? 'Other' : 'Lainnya'));
                          setCustomCategory('');
                        }}
                        title={isEn ? 'Cancel' : 'Batal'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#706866] hover:text-[#66000E] rounded-md hover:bg-[#FAF7F7] transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategory(val);
                        if (val === 'new') {
                          setCustomCategory('');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10 cursor-pointer"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="new">{isEn ? '+ Add New Category...' : '+ Tambah Kategori Baru...'}</option>
                    </select>
                  )}
                </div>

                {/* Stock & Weight (Sebelah Kanan Jumlah Stok) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                      {isEn ? 'STOCK QUANTITY' : 'JUMLAH STOK'} <span className="text-[#66000E]">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="10"
                      value={stockDisplay}
                      onChange={handleStockChange}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs sm:text-sm font-bold text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                      {isEn ? 'ESTIMATED WEIGHT (GRAMS)' : 'ESTIMASI BERAT (GRAM)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="250"
                        value={weightDisplay}
                        onChange={handleWeightChange}
                        className="w-full pl-3 pr-12 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs sm:text-sm font-bold text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#706866]">
                        gram
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Singkat */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                    {isEn ? 'SHORT DESCRIPTION' : 'DESKRIPSI SINGKAT'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEn ? 'Describe materials, size, and product highlights...' : 'Ceritakan keunggulan bahan, ukuran, dan cara penggunaan...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10 resize-none transition"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Fixed Footer Buttons (Always visible at bottom) */}
          <div className="px-5 py-3.5 border-t border-[#E5E0DD] bg-[#FAF7F7] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 min-h-[38px] rounded-xl border border-[#E5E0DD] text-[#706866] hover:text-[#241A1A] font-bold text-xs hover:bg-white transition cursor-pointer disabled:opacity-50"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 min-h-[38px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs sm:text-sm shadow-xs transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{productToEdit ? (isEn ? 'Save Changes' : 'Simpan Perubahan') : (isEn ? 'Save Product' : 'Simpan Produk')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
