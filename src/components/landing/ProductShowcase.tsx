import React, { useEffect, useRef, useState } from 'react';
import { Package, ArrowRight, Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Reveal } from './landingMotion';

interface ProductShowcaseProps {
  onNavigateRegister: () => void;
  onLaunchDemo: () => void;
}

const DEMO_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const DEMO_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&auto=format&fit=crop&q=80';

interface DemoProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  status: 'Tersedia' | 'Stok Menipis';
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  onNavigateRegister,
  onLaunchDemo,
}) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<DemoProduct[]>([
    {
      id: '1',
      name: 'Batik Parang Tulis Pekalongan',
      price: 350000,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80',
      status: 'Tersedia',
    },
    {
      id: '2',
      name: 'Kemeja Tenun Etnik Solo',
      price: 225000,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120&auto=format&fit=crop&q=80',
      status: 'Stok Menipis',
    },
    {
      id: '3',
      name: 'Mukena Rayon Premium Bordir',
      price: 160000,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=80',
      status: 'Tersedia',
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('10');
  const [justAddedAlert, setJustAddedAlert] = useState(false);
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  // URL objek foto simulasi; dilepas saat komponen dilepas agar tidak bocor memori.
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError(t('product_modal_photo_invalid', 'File harus berupa gambar (JPG, PNG, atau WEBP).'));
      return;
    }
    if (file.size > DEMO_PHOTO_MAX_BYTES) {
      setFormError(t('product_modal_photo_too_big', 'Ukuran foto maksimal 5 MB.'));
      return;
    }
    // Simulasi saja: foto hanya ditampilkan lokal di browser, tidak diunggah ke server.
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    setNewProductImage(url);
    setFormError('');
  };

  const resetForm = () => {
    setNewProductName('');
    setNewProductPrice('');
    setNewProductStock('10');
    setNewProductImage(null);
    setFormError('');
  };

  const closeModal = () => {
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProductName.trim();
    const price = parseInt(newProductPrice.replace(/\D/g, ''), 10);
    const stock = parseInt(newProductStock.replace(/\D/g, ''), 10);

    if (!name) {
      setFormError(t('product_modal_name_required', 'Nama produk wajib diisi.'));
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError(t('product_modal_price_required', 'Harga harus lebih dari 0.'));
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setFormError(t('product_modal_stock_invalid', 'Jumlah stok tidak valid.'));
      return;
    }

    const newProd: DemoProduct = {
      id: Date.now().toString(),
      name,
      price,
      stock,
      image: newProductImage || DEMO_PLACEHOLDER_IMAGE,
      status: stock <= 3 ? 'Stok Menipis' : 'Tersedia',
    };

    setProducts((prev) => [newProd, ...prev]);
    resetForm();
    setIsAddModalOpen(false);
    setJustAddedAlert(true);
    setTimeout(() => setJustAddedAlert(false), 3000);
  };

  return (
    <section 
      id="produk" 
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-6 sm:py-8 lg:py-4 xl:py-8 bg-[#FAF7F7] scroll-mt-16 sm:scroll-mt-20 border-b border-[#E8DDDE] font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left Column: Heading, Description & CTA */}
          <Reveal className="lg:col-span-5 space-y-3 sm:space-y-4 lg:space-y-5 text-center lg:text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium shadow-2xs">
              <Package className="w-3.5 h-3.5 text-[#66000E]" />
              <span>{t('product_section_badge', 'Manajemen Produk')}</span>
            </div>

            {/* Main Section Heading */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#241A1A] tracking-tight leading-snug">
              {t('product_section_title', 'Kelola Produk Tanpa Ribet')}
            </h2>

            {/* Concise UMKM description */}
            <p className="text-xs sm:text-sm text-[#5F5652] leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
              {t('product_section_desc', 'Upload foto produk, tentukan harga, dan atur stok barang langsung dari HP.')}
            </p>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
              <button
                onClick={onNavigateRegister}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>{t('product_cta_add', 'Mulai Tambah Produk')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4.5 h-11 rounded-xl bg-white hover:bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-[#66000E]" />
                <span>{t('product_cta_simulate', 'Simulasi Produk')}</span>
              </button>
            </div>

            {/* Success toast alert */}
            <AnimatePresence>
              {justAddedAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('product_modal_success', 'Produk baru berhasil ditambahkan ke etalase!')}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </Reveal>

          {/* Right Column: Interactive Product Catalog Card */}
          <Reveal className="lg:col-span-7" delay={0.15}>
            <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl bg-white border border-[#E8DDDE] shadow-lg text-[#241A1A] relative">
              
              {/* Card Header with Add Button */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3.5 mb-3 sm:mb-4 border-b border-[#E8DDDE]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                    K
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#241A1A]">{t('product_catalog_card_title', 'Katalog Produk Anda')}</h3>
                    <p className="text-[10px] sm:text-[11px] text-[#857C76]">{t('filter_all', 'Total')} {products.length} {t('product_catalog_card_active', 'produk aktif di etalase')}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#66000E] hover:bg-[#801010] text-white text-[11px] sm:text-xs font-semibold transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_product', 'Tambah Produk')}</span>
                </button>
              </div>

              {/* Product List Items */}
              <div className="space-y-2 sm:space-y-2.5">
                {/* initial={false}: hanya produk yang baru ditambahkan yang beranimasi masuk */}
                <AnimatePresence initial={false}>
                  {products.slice(0, 3).map((prod, idx) => (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`p-2.5 sm:p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] items-center justify-between gap-3 hover:border-[#66000E]/40 transition-colors ${
                        idx === 2 ? 'hidden sm:flex' : 'flex'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-[#E8DDDE] shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-[#241A1A] truncate">{prod.name}</p>
                          <p className="text-[#66000E] font-bold text-xs mt-0.5">
                            Rp {prod.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${
                            prod.status === 'Tersedia'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {t('stock', 'Stok')}: {prod.stock} pcs
                        </span>
                        <p className="text-[9px] sm:text-[10px] text-[#857C76] mt-0.5">
                          {prod.status === 'Tersedia' ? t('product_status_available', 'Tersedia') : t('product_status_low', 'Stok Menipis')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Bottom Card Summary */}
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#E8DDDE] flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-[#5F5652]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t('product_storefront_online', 'Etalase Toko Otomatis Online')}</span>
                </div>
                <span className="text-[#66000E] font-semibold">{t('product_synced_link', 'Tersinkronisasi ke Link Toko')}</span>
              </div>

            </div>
          </Reveal>

        </div>

      </div>

      {/* Interactive Modal: Tambah Produk */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241A1A]/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#E8DDDE] space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8DDDE] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#241A1A]">{t('product_modal_title', 'Simulasi Tambah Produk')}</h3>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5F5652] hover:bg-[#FAF7F7] hover:text-[#241A1A] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1">
                  {t('product_modal_photo', 'Foto Produk')}
                </label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickPhoto}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full p-3 border-2 border-dashed border-[#E8DDDE] hover:border-[#66000E]/50 rounded-xl bg-[#FAF7F7] text-center flex flex-col items-center justify-center gap-1 text-xs text-[#5F5652] transition cursor-pointer"
                >
                  {newProductImage ? (
                    <>
                      <img src={newProductImage} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#E8DDDE]" />
                      <span>{t('product_modal_photo_change', 'Ganti foto')}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-[#66000E]" />
                      <span>{t('product_modal_photo_hint', 'Pilih foto dari galeri/kamera')}</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1">
                  {t('product_modal_name', 'Nama Produk')} <span className="text-[#66000E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sambal Bawang Bu Rudy"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDDE] text-xs sm:text-sm text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-1 focus:ring-[#66000E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#241A1A] mb-1">
                    {t('product_modal_price', 'Harga (Rp)')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="120000"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDDE] text-xs sm:text-sm text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-1 focus:ring-[#66000E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#241A1A] mb-1">
                    {t('product_modal_stock', 'Jumlah Stok')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="10"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDDE] text-xs sm:text-sm text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-1 focus:ring-[#66000E]"
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-[#E8DDDE] text-xs font-semibold text-[#5F5652] hover:bg-[#FAF7F7]"
                >
                  {t('product_modal_cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('product_modal_save', 'Simpan Produk')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};



