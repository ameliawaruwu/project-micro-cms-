import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  Check,
  Package,
  HelpCircle,
} from 'lucide-react';
import { Product } from '../../types';

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
  const [name, setName] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState('');
  const [stockDisplay, setStockDisplay] = useState('10');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sku, setSku] = useState('');
  const [weightDisplay, setWeightDisplay] = useState('250');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper formatting numbers with Indonesian thousand separator
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
      setCategory(productToEdit.category || (categories[0] || 'Umum'));
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setSku(productToEdit.sku || '');
      setWeightDisplay(productToEdit.weightGrams ? String(productToEdit.weightGrams) : '250');
      setShowAdvanced(Boolean(productToEdit.sku || productToEdit.originalPrice));
    } else {
      setName('');
      setPriceDisplay('');
      setOriginalPriceDisplay('');
      setStockDisplay('10');
      setCategory(categories[0] || 'Umum');
      setDescription('');
      setImageUrl(presetPhotos[0]);
      setSku('');
      setWeightDisplay('250');
      setShowAdvanced(false);
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setPriceDisplay('');
      return;
    }
    setPriceDisplay(new Intl.NumberFormat('id-ID').format(Number(rawVal)));
  };

  const handleOriginalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setOriginalPriceDisplay('');
      return;
    }
    setOriginalPriceDisplay(new Intl.NumberFormat('id-ID').format(Number(rawVal)));
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
    setPriceDisplay(new Intl.NumberFormat('id-ID').format(nominal));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon masukkan nama produk.');
      return;
    }
    const finalPrice = parseNumber(priceDisplay);
    if (finalPrice <= 0) {
      alert('Mohon masukkan harga jual produk yang valid (contoh: 50.000).');
      return;
    }

    const finalCategory = category === 'new' ? customCategory || 'Lainnya' : category;

    onSave({
      name: name.trim(),
      price: finalPrice,
      originalPrice: originalPriceDisplay ? parseNumber(originalPriceDisplay) : undefined,
      stock: parseNumber(stockDisplay),
      category: finalCategory || 'Umum',
      description: description.trim() || 'Produk berkualitas dari toko kami.',
      imageUrl: imageUrl || presetPhotos[0],
      sku: sku.trim() || undefined,
      weightGrams: parseNumber(weightDisplay) || 250,
    });
  };

  return (
    <div
      id="modal-product-form"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-[#241A1A]/50 backdrop-blur-xs overflow-y-auto font-sans text-left"
    >
      <div className="bg-white rounded-[22px] max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-[#E5E0DD] my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0DD]">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-[#241A1A] tracking-tight">
              {productToEdit ? 'Ubah Rincian Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-xs text-[#706866] mt-0.5 font-normal">
              Isi data sederhana di bawah untuk mulai jualan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer border border-transparent hover:border-[#E5E0DD]"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Step 1: Product Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
              1. FOTO PRODUK <span className="text-[#66000E]">*</span>
            </label>
            <div className="flex items-center gap-3.5">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview Produk"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Camera className="w-7 h-7 text-[#706866]" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-[11px] text-[#706866] font-medium">Pilih foto siap pakai atau masukkan link gambar:</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {presetPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset)}
                      className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        imageUrl === preset
                          ? 'border-[#66000E] scale-105 shadow-2xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Atau tempel URL gambar (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] focus:bg-white text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
              2. NAMA PRODUK <span className="text-[#66000E]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kemeja Batik Parang Slimfit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E5E0DD] text-sm text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition"
            />
          </div>

          {/* Step 3 & 4: Price & Stock with Manual Input Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Price (Harga Jual) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A]">
                  3. HARGA JUAL <span className="text-[#66000E]">*</span>
                </label>
                {priceDisplay && (
                  <span className="text-[10px] text-[#66000E] font-bold">
                    Rp {priceDisplay}
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#706866]">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Contoh: 150.000"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E5E0DD] text-sm sm:text-base font-bold text-[#241A1A] placeholder:text-[#9A9290] placeholder:font-normal focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto">
                {[50000, 100000, 150000, 250000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickPrice(amt)}
                    className="px-2 py-0.5 rounded-md bg-[#FAF7F7] hover:bg-[#F5E8EA] border border-[#E5E0DD] hover:border-[#66000E] text-[10px] font-semibold text-[#706866] hover:text-[#66000E] transition cursor-pointer whitespace-nowrap"
                  >
                    {amt >= 1000 ? `${amt / 1000}rb` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock (Jumlah Stok) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
                4. JUMLAH STOK <span className="text-[#66000E]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="10"
                value={stockDisplay}
                onChange={handleStockChange}
                className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E5E0DD] text-sm sm:text-base font-bold text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10"
              />
              <p className="text-[10px] text-[#706866] mt-1 font-medium">
                Stok barang yang siap dibeli pelanggan
              </p>
            </div>

          </div>

          {/* Step 5: Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
              5. KATEGORI PRODUK
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="new">+ Tambah Kategori Baru...</option>
            </select>

            {category === 'new' && (
              <input
                type="text"
                placeholder="Tulis nama kategori baru..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1A] mb-1.5">
              DESKRIPSI SINGKAT
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan keunggulan bahan, ukuran, dan cara penggunaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 resize-none"
            />
          </div>

          {/* Advanced Settings */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA]/50 border border-[#E5E0DD] flex items-center justify-between text-xs font-bold text-[#241A1A] transition cursor-pointer"
            >
              <span>Pengaturan Lanjutan (SKU, Diskon, Berat Ongkir)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-[#706866]" /> : <ChevronDown className="w-4 h-4 text-[#706866]" />}
            </button>

            {showAdvanced && (
              <div className="p-3.5 mt-2 bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#706866] mb-1">
                      Harga Coret (Diskon)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706866]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Contoh: 200.000"
                        value={originalPriceDisplay}
                        onChange={handleOriginalPriceChange}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E0DD] bg-white text-[#241A1A] font-semibold focus:outline-none focus:border-[#66000E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#706866] mb-1">
                      Kode SKU Produk
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: BTK-001"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0DD] bg-white text-[#241A1A] font-medium focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#706866] mb-1">
                    Estimasi Berat (Gram) untuk Hitung Ongkir Kurir
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="250"
                    value={weightDisplay}
                    onChange={handleWeightChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0DD] bg-white text-[#241A1A] font-semibold focus:outline-none focus:border-[#66000E]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA Buttons */}
          <div className="pt-4 border-t border-[#E5E0DD] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl border border-[#E5E0DD] text-[#706866] hover:text-[#241A1A] font-bold text-xs hover:bg-[#FAF7F7] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs sm:text-sm shadow-xs transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
