import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Camera,
  Check,
} from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const [priceDisplay, setPriceDisplay] = useState('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState('');
  const [stockDisplay, setStockDisplay] = useState('10');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [weightDisplay, setWeightDisplay] = useState('250');

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

  // Curated presets for fast demo selection
  const presetPhotos = [
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setPriceDisplay(productToEdit.price ? formatThousand(productToEdit.price) : '');
      setOriginalPriceDisplay(productToEdit.originalPrice ? formatThousand(productToEdit.originalPrice) : '');
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

      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setWeightDisplay(productToEdit.weightGrams ? String(productToEdit.weightGrams) : '250');
    } else {
      setName('');
      setPriceDisplay('');
      setOriginalPriceDisplay('');
      setStockDisplay('10');
      setCategory(availableCategories[0] || (isEn ? 'Clothing & Fashion' : 'Pakaian & Fashion'));
      setCustomCategory('');
      setDescription('');
      setImageUrl(presetPhotos[0]);
      setWeightDisplay('250');
    }
  }, [productToEdit, availableCategories, isOpen, isEn]);

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setPriceDisplay('');
      return;
    }
    setPriceDisplay(new Intl.NumberFormat(isEn ? 'en-US' : 'id-ID').format(Number(rawVal)));
  };

  const handleOriginalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setOriginalPriceDisplay('');
      return;
    }
    setOriginalPriceDisplay(new Intl.NumberFormat(isEn ? 'en-US' : 'id-ID').format(Number(rawVal)));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setStockDisplay(rawVal);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setWeightDisplay(rawVal);
  };

  const setQuickPrice = (nominal: number) => {
    setPriceDisplay(new Intl.NumberFormat(isEn ? 'en-US' : 'id-ID').format(nominal));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(isEn ? 'Please enter a product name.' : 'Mohon masukkan nama produk.');
      return;
    }
    const finalPrice = parseNumber(priceDisplay);
    if (finalPrice <= 0) {
      alert(isEn ? 'Please enter a valid selling price (e.g. 50,000).' : 'Mohon masukkan harga jual produk yang valid (contoh: 50.000).');
      return;
    }

    let finalCategory = category;
    if (category === 'new') {
      finalCategory = customCategory.trim() || (isEn ? 'Other' : 'Lainnya');
    } else if (category === 'Lainnya' || category === 'Other') {
      finalCategory = customCategory.trim() || (isEn ? 'Other' : 'Lainnya');
    }

    onSave({
      name: name.trim(),
      price: finalPrice,
      originalPrice: originalPriceDisplay ? parseNumber(originalPriceDisplay) : undefined,
      stock: parseNumber(stockDisplay),
      category: finalCategory || (isEn ? 'Other' : 'Lainnya'),
      description: description.trim() || (isEn ? 'Quality product from our store.' : 'Produk berkualitas dari toko kami.'),
      imageUrl: imageUrl || presetPhotos[0],
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
              
              {/* Left Column: Photo & Presets & Weight */}
              <div className="md:col-span-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
                    {isEn ? '1. PRODUCT PHOTO' : '1. FOTO PRODUK'} <span className="text-[#66000E]">*</span>
                  </label>
                  <div className="w-full aspect-square max-w-[200px] md:max-w-none mx-auto rounded-2xl bg-[#FAF7F7] border-2 border-dashed border-[#E5E0DD] hover:border-[#66000E]/40 overflow-hidden flex items-center justify-center relative shadow-2xs group transition">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview Produk"
                        className="w-full h-full object-cover transition group-hover:scale-105 duration-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <Camera className="w-8 h-8 text-[#706866] mx-auto mb-1 opacity-60" />
                        <span className="text-[11px] text-[#706866] font-medium block">
                          {isEn ? 'No photo selected' : 'Belum ada foto'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preset Thumbnails */}
                <div>
                  <p className="text-[11px] text-[#706866] font-medium mb-1.5">
                    {isEn ? 'Pick a photo preset or paste image link:' : 'Pilih foto siap pakai atau masukkan link gambar:'}
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {presetPhotos.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset)}
                        className={`w-9 h-9 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                          imageUrl === preset
                            ? 'border-[#66000E] scale-105 shadow-2xs ring-2 ring-[#66000E]/20'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={isEn ? 'Or paste image URL (https://...)' : 'Atau tempel URL gambar (https://...)'}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] focus:bg-white text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10 transition"
                  />
                </div>

                {/* Weight Input (Compact on Left) */}
                <div className="pt-2 border-t border-[#E5E0DD]/60">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[#706866]">
                      {isEn ? 'Estimated Weight (Grams)' : 'Estimasi Berat (Gram)'}
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="250"
                      value={weightDisplay}
                      onChange={handleWeightChange}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0DD] bg-white text-[#241A1A] font-semibold focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#706866]">
                      gram
                    </span>
                  </div>
                  <p className="text-[10px] text-[#706866] mt-0.5 font-medium">
                    {isEn ? 'Used for automated courier rate calculation' : 'Untuk hitung tarif ongkir kurir otomatis'}
                  </p>
                </div>
              </div>

              {/* Right Column: Name, Price, Stock, Category, Description */}
              <div className="md:col-span-7 space-y-3.5">
                
                {/* 2. Nama Produk */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
                    {isEn ? '2. PRODUCT NAME' : '2. NAMA PRODUK'} <span className="text-[#66000E]">*</span>
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

                {/* 3 & Price Coret */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A]">
                        {isEn ? '3. SELLING PRICE' : '3. HARGA JUAL'} <span className="text-[#66000E]">*</span>
                      </label>
                      {priceDisplay && (
                        <span className="text-[10px] text-[#66000E] font-bold">
                          Rp {priceDisplay}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706866]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder={isEn ? '150,000' : 'Contoh: 150.000'}
                        value={priceDisplay}
                        onChange={handlePriceChange}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E0DD] text-xs sm:text-sm font-bold text-[#241A1A] placeholder:text-[#9A9290] placeholder:font-normal focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                      />
                    </div>
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1 mt-1.5 overflow-x-auto">
                      {[50000, 100000, 150000, 250000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setQuickPrice(amt)}
                          className="px-2 py-0.5 rounded-md bg-[#FAF7F7] hover:bg-[#F5E8EA] border border-[#E5E0DD] hover:border-[#66000E] text-[10px] font-semibold text-[#706866] hover:text-[#66000E] transition cursor-pointer whitespace-nowrap"
                        >
                          {amt >= 1000 ? `${amt / 1000}${isEn ? 'k' : 'rb'}` : amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                      {isEn ? 'STRIKE PRICE (OPTIONAL)' : 'HARGA CORET (OPSIONAL)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706866]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={isEn ? '200,000' : 'Contoh: 200.000'}
                        value={originalPriceDisplay}
                        onChange={handleOriginalPriceChange}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E0DD] text-xs sm:text-sm font-semibold text-[#241A1A] placeholder:text-[#9A9290] placeholder:font-normal focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                      />
                    </div>
                    <span className="text-[10px] text-[#706866] mt-1 block">
                      {isEn ? 'Shows discount badge in store' : 'Menampilkan badge diskon di toko'}
                    </span>
                  </div>
                </div>

                {/* 4 & 5: Stock & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                      {isEn ? '4. STOCK QUANTITY' : '4. JUMLAH STOK'} <span className="text-[#66000E]">*</span>
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
                    <p className="text-[10px] text-[#706866] mt-0.5 font-medium">
                      {isEn ? 'Units available for purchase' : 'Stok barang yang siap dibeli'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1">
                      {isEn ? '5. PRODUCT CATEGORY' : '5. KATEGORI PRODUK'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategory(val);
                        if (val !== 'new' && val !== 'Lainnya' && val !== 'Other') {
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

                    {(category === 'new' || category === 'Lainnya' || category === 'Other') && (
                      <div className="mt-2 space-y-1 animate-in fade-in duration-150">
                        <input
                          type="text"
                          placeholder={
                            category === 'new'
                              ? (isEn ? 'Enter custom category name (e.g. Doll, Coffee)...' : 'Tulis nama kategori baru (contoh: Boneka, Kopi, Sepatu)...')
                              : (isEn ? 'Specify other category (optional, or keep as Other)...' : 'Tulis nama kategori spesifik (opsional, atau biarkan Lainnya)...')
                          }
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                          autoFocus={category === 'new'}
                        />
                      </div>
                    )}
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
