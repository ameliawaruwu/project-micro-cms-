import React, { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { Store } from '../../../types';
import { productService } from '../../../services/productService';
import { SimpleModal, fieldClass, ghostBtn, labelClass, primaryBtn } from '../../../components/tickets/ticketUi';

/**
 * Sub-Admin Produk: tambah produk ke salah satu toko binaan komunitasnya.
 * Daftar toko sudah dipersempit pemanggil; database tetap menolak toko di luar hak kelola
 * (RLS products_insert_manager → app_private.can_manage_store).
 */
interface AdminAddProductModalProps {
  open: boolean;
  stores: Store[];
  categories: string[];
  isEn: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const emptyForm = {
  storeId: '',
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '',
  weightGrams: '250',
  description: '',
};

const toInt = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN);

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({ open, stores, categories, isEn, onClose, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, storeId: stores.length === 1 ? stores[0].id : '' });
      setImages([]);
      setError(null);
    }
  }, [open, stores]);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const addImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    setError(null);
    const room = MAX_IMAGES - images.length;
    const picked: string[] = [];
    for (const file of files.slice(0, room)) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setError(isEn ? 'Photos must be JPG, PNG, WEBP or GIF.' : 'Foto harus JPG, PNG, WEBP, atau GIF.');
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(isEn ? 'Each photo max 5MB.' : 'Ukuran tiap foto maks. 5MB.');
        continue;
      }
      try {
        picked.push(await readAsDataUrl(file));
      } catch {
        setError(isEn ? 'Failed to read photo.' : 'Gagal membaca foto.');
      }
    }
    if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const validate = (): string | null => {
    if (!stores.some((s) => s.id === form.storeId)) return isEn ? 'Choose a member store.' : 'Pilih toko binaan.';
    const name = form.name.trim();
    if (name.length < 2 || name.length > 120) return isEn ? 'Product name must be 2–120 characters.' : 'Nama produk 2–120 karakter.';
    if (form.category.trim().length > 60) return isEn ? 'Category max 60 characters.' : 'Kategori maks. 60 karakter.';
    const price = toInt(form.price);
    if (!Number.isFinite(price) || price < 100 || price > 1_000_000_000)
      return isEn ? 'Price must be a whole number of at least Rp100.' : 'Harga harus bilangan bulat, minimal Rp100.';
    if (form.originalPrice.trim()) {
      const op = toInt(form.originalPrice);
      if (!Number.isFinite(op) || op <= price || op > 1_000_000_000)
        return isEn ? 'Strikethrough price must be higher than the price.' : 'Harga coret harus lebih tinggi dari harga jual.';
    }
    const stock = toInt(form.stock);
    if (!Number.isFinite(stock) || stock > 1_000_000) return isEn ? 'Stock must be a whole number.' : 'Stok harus bilangan bulat.';
    const weight = toInt(form.weightGrams);
    if (!Number.isFinite(weight) || weight < 1 || weight > 50_000) return isEn ? 'Weight must be 1–50,000 grams.' : 'Berat 1–50.000 gram.';
    if (form.description.length > 5000) return isEn ? 'Description max 5000 characters.' : 'Deskripsi maks. 5000 karakter.';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    const store = stores.find((s) => s.id === form.storeId)!;
    setSaving(true);
    setError(null);
    try {
      const { product, syncedToCloud, cloudError } = await productService.createProduct(store.id, {
        name: form.name.trim(),
        category: form.category.trim() || (isEn ? 'Other' : 'Lainnya'),
        price: toInt(form.price),
        originalPrice: form.originalPrice.trim() ? toInt(form.originalPrice) : undefined,
        stock: toInt(form.stock),
        weightGrams: toInt(form.weightGrams),
        description: form.description.trim(),
        imageUrl: images[0] || '',
        images,
        merchantId: store.merchantId,
      } as any);
      if (!syncedToCloud) {
        // Jangan tinggalkan salinan lokal yang tidak pernah tersimpan di database.
        try {
          await productService.deleteProduct(product.id, store.id);
        } catch {}
        console.warn('[AdminAddProductModal] insert gagal:', cloudError);
        setError(
          isEn
            ? 'The product could not be saved. Make sure the store is still a member of your community.'
            : 'Produk gagal disimpan. Pastikan toko masih menjadi toko binaan komunitas Anda.'
        );
        return;
      }
      onCreated(isEn ? `Product "${product.name}" added to ${store.name}` : `Produk "${product.name}" ditambahkan ke ${store.name}`);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to add product.' : 'Gagal menambahkan produk.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      wide
      title={isEn ? 'Add product to member store' : 'Tambah Produk Toko Binaan'}
      onClose={() => !saving && onClose()}
      footer={
        <>
          <button type="button" className={ghostBtn} onClick={onClose} disabled={saving}>
            {isEn ? 'Cancel' : 'Batal'}
          </button>
          <button type="submit" form="admin-add-product-form" className={primaryBtn} disabled={saving || stores.length === 0}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isEn ? 'Save product' : 'Simpan Produk'}
          </button>
        </>
      }
    >
      {stores.length === 0 ? (
        <p className="text-xs text-[#706866]">
          {isEn ? 'Your community has no member stores yet.' : 'Komunitas Anda belum memiliki toko binaan.'}
        </p>
      ) : (
        <form id="admin-add-product-form" onSubmit={submit} className="space-y-3">
          <div>
            <label className={labelClass}>{isEn ? 'Member store' : 'Toko binaan'} *</label>
            <select className={fieldClass} value={form.storeId} onChange={set('storeId')}>
              <option value="">{isEn ? '— Choose store —' : '— Pilih toko —'}</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isEn ? 'Product name' : 'Nama produk'} *</label>
            <input className={fieldClass} maxLength={120} value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{isEn ? 'Category' : 'Kategori'}</label>
              <input className={fieldClass} maxLength={60} list="admin-add-product-categories" value={form.category} onChange={set('category')} />
              <datalist id="admin-add-product-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>{isEn ? 'Weight (grams)' : 'Berat (gram)'} *</label>
              <input className={fieldClass} inputMode="numeric" value={form.weightGrams} onChange={set('weightGrams')} />
            </div>
            <div>
              <label className={labelClass}>{isEn ? 'Price (Rp)' : 'Harga jual (Rp)'} *</label>
              <input className={fieldClass} inputMode="numeric" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label className={labelClass}>{isEn ? 'Strikethrough price (optional)' : 'Harga coret (opsional)'}</label>
              <input className={fieldClass} inputMode="numeric" value={form.originalPrice} onChange={set('originalPrice')} />
            </div>
            <div>
              <label className={labelClass}>{isEn ? 'Stock' : 'Stok'} *</label>
              <input className={fieldClass} inputMode="numeric" value={form.stock} onChange={set('stock')} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{isEn ? 'Description' : 'Deskripsi'}</label>
            <textarea className={`${fieldClass} min-h-[80px] resize-y`} maxLength={5000} value={form.description} onChange={set('description')} />
          </div>
          <div>
            <label className={labelClass}>
              {isEn ? 'Photos' : 'Foto produk'} ({images.length}/{MAX_IMAGES})
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E5E0DD]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white cursor-pointer"
                    aria-label={isEn ? 'Remove photo' : 'Hapus foto'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-16 h-16 rounded-lg border border-dashed border-[#E5E0DD] flex items-center justify-center text-[#A8A09D] hover:text-[#66000E] hover:border-[#66000E] cursor-pointer transition">
                  <ImagePlus className="w-5 h-5" />
                  <input type="file" accept={IMAGE_TYPES.join(',')} multiple className="hidden" onChange={addImages} />
                </label>
              )}
            </div>
          </div>
          {error && <p className="text-xs text-[#66000E]">{error}</p>}
        </form>
      )}
    </SimpleModal>
  );
};
