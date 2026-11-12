import React, { useEffect, useRef, useState } from 'react';
import { Package, ArrowRight, Plus, X, Image as ImageIcon, Check, Camera, Tag, Link2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, Reveal } from './landingMotion';

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

  // Modal simulasi bisa ditutup dengan tombol Esc.
  useEffect(() => {
    if (!isAddModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // closeModal hanya memakai setter state yang stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalOpen]);

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

  const points = [
    { icon: Camera, text: t('product_point_photo', 'Foto produk langsung dari kamera HP') },
    { icon: Tag, text: t('product_point_price', 'Atur harga, varian, dan stok sekali klik') },
    { icon: Link2, text: t('product_point_sync', 'Otomatis tampil di link toko Anda') },
  ];

  return (
    <section
      id="produk"
      className="relative bg-[#FAF7F7] py-16 sm:py-20 lg:py-24 scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800C19]">
            {t('product_section_badge', 'Manajemen Produk')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-[#1A1414]">
            {t('product_section_title', 'Kelola Produk Tanpa Ribet')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5F5652]">
            {t('product_section_desc', 'Upload foto produk, tentukan harga, dan atur stok barang langsung dari HP.')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Kartu kuning: poin utama & tombol aksi */}
          <Reveal className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-[28px] bg-[#F7C948] p-6 sm:p-8 text-[#1A1414] flex flex-col">
              <motion.img
                src="/assets/3d/clean/kraft_pouch.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute right-3 top-4 w-24 sm:w-32 drop-shadow-[0_18px_22px_rgba(0,0,0,0.25)]"
              />

              <span className="relative inline-flex w-10 h-10 items-center justify-center rounded-xl bg-white/70 text-[#66000E]">
                <Package className="w-5 h-5" />
              </span>
              <h3 className="relative mt-4 max-w-[65%] text-xl sm:text-2xl font-medium tracking-tight leading-snug">
                {t('product_card_title', 'Etalase siap jual dalam hitungan menit')}
              </h3>

              <ul className="relative mt-5 space-y-2.5">
                {points.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-[#1A1414]/80">
                    <span className="flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-[#1A1414] text-[#F7C948]">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-auto pt-7 flex flex-col sm:flex-row gap-2.5">
                <motion.button
                  type="button"
                  onClick={onNavigateRegister}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-brand hover:bg-brand-hover text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  <span>{t('product_cta_add', 'Mulai Tambah Produk')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-lg bg-white/80 hover:bg-white text-[#66000E] font-medium text-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('product_cta_simulate', 'Simulasi Produk')}</span>
                </motion.button>
              </div>
            </div>
          </Reveal>

          {/* Kartu putih: katalog produk interaktif */}
          <Reveal className="lg:col-span-7" delay={0.12}>
            <div className="h-full rounded-[28px] border border-[#E4DCDC] bg-white p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-medium tracking-tight text-[#1A1414]">
                    {t('product_catalog_card_title', 'Katalog Produk Anda')}
                  </h3>
                  <p className="text-xs text-[#5F5652]">
                    {products.length} {t('product_catalog_card_active', 'produk aktif di etalase')}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_product', 'Tambah Produk')}</span>
                </motion.button>
              </div>

              {/* Notifikasi produk berhasil ditambahkan */}
              <AnimatePresence>
                {justAddedAlert && (
                  <motion.div
                    role="status"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      {t('product_modal_success', 'Produk baru berhasil ditambahkan ke etalase!')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Kartu produk: baris di HP, grid 3 kolom di layar lebar */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* initial={false}: hanya produk yang baru ditambahkan yang beranimasi masuk */}
                <AnimatePresence initial={false} mode="popLayout">
                  {products.slice(0, 3).map((prod) => {
                    const isLow = prod.status === 'Stok Menipis';
                    return (
                      <motion.article
                        key={prod.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                        className="group flex sm:flex-col items-center sm:items-stretch gap-3 rounded-2xl bg-[#FAF7F7] p-2.5 sm:p-3"
                      >
                        <div className="relative w-16 h-16 sm:w-full sm:h-auto sm:aspect-square shrink-0 overflow-hidden rounded-xl bg-white">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span
                            className={`absolute left-2 top-2 hidden sm:inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isLow ? 'bg-[#FFC2D1] text-[#66000E]' : 'bg-white/90 text-emerald-700'
                            }`}
                          >
                            {isLow ? t('product_status_low', 'Stok Menipis') : t('product_status_available', 'Tersedia')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 sm:px-0.5">
                          <p className="text-sm font-medium text-[#1A1414] truncate">{prod.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-[#800C19]">
                              Rp {prod.price.toLocaleString('id-ID')}
                            </span>
                            <span className={`text-[11px] ${isLow ? 'font-semibold text-[#800C19]' : 'text-[#5F5652]'}`}>
                              {prod.stock} pcs
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F5652]">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  {t('product_storefront_online', 'Etalase Toko Otomatis Online')}
                </span>
                <span className="font-medium text-[#800C19]">{t('product_synced_link', 'Tersinkronisasi ke Link Toko')}</span>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-sim-title"
            className="relative w-full max-w-md bg-white rounded-[24px] p-5 sm:p-6 shadow-2xl border border-[#E8DDDE] space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8DDDE] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 id="product-sim-title" className="font-bold text-base text-[#241A1A]">{t('product_modal_title', 'Simulasi Tambah Produk')}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label={t('product_modal_cancel', 'Batal')}
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
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
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
