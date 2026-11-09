import React, { createContext, useContext, useEffect, useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { cartService } from '../services/cartService';
import { cmsProductToProduct } from '../cms/useCmsStore';
import { Product } from '../types';

/**
 * Konteks toko untuk komponen tema (navbar, kartu produk): slug toko dipakai sebagai kunci keranjang.
 * Dipasang oleh CenterPreviewCanvas (editor & toko live).
 */
export const StorefrontContext = createContext<{ storeSlug: string }>({ storeSlug: '' });

export const useStorefrontSlug = () => useContext(StorefrontContext).storeSlug;

export const CART_UPDATED_EVENT = 'cart_updated';
const TOAST_EVENT = 'storefront_toast';

/** Tampilkan notifikasi di halaman toko (dirender oleh <StorefrontToast />). */
export function notifyStorefront(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message } }));
}

/** Ubah produk CMS/tema menjadi Product untuk disimpan di keranjang. */
function toCartProduct(product: any): Product {
  if (product && 'image' in product && !('imageUrl' in product)) return cmsProductToProduct(product);
  return product as Product;
}

/** Tambah produk ke keranjang toko, perbarui ikon keranjang, dan tampilkan notifikasi. */
export function addProductToCart(storeSlug: string, product: any, quantity = 1): boolean {
  if (!product) return false;
  if (!storeSlug) {
    notifyStorefront('Keranjang belum tersedia. Muat ulang halaman toko.');
    return false;
  }
  const cartProduct = toCartProduct(product);
  cartService.addToCart(storeSlug, cartProduct, quantity);
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  notifyStorefront(`"${cartProduct.name}" berhasil ditambahkan ke keranjang`);
  return true;
}

/** Jumlah barang di keranjang toko; ikut berubah saat keranjang diperbarui. */
export function useCartCount(storeSlug: string): number {
  const read = () => (storeSlug ? cartService.getCount(cartService.getCart(storeSlug)) : 0);
  const [count, setCount] = useState<number>(read);
  useEffect(() => {
    const update = () => setCount(read());
    update();
    window.addEventListener(CART_UPDATED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [storeSlug]);
  return count;
}

interface NavCartButtonProps {
  className?: string;
  /** Kelas badge jumlah barang (opsional). */
  badgeClassName?: string;
  children?: React.ReactNode;
}

/**
 * Ikon keranjang di navbar tema: membuka halaman Keranjang (lewat data-href yang ditangani
 * CenterPreviewCanvas) dan menampilkan jumlah barang.
 */
export const NavCartButton: React.FC<NavCartButtonProps> = ({ className = '', badgeClassName, children }) => {
  const count = useCartCount(useStorefrontSlug());
  return (
    <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" title="Keranjang Belanja" className={`${/(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? '' : 'relative '}cursor-pointer ${className}`}>
      {children ?? <ShoppingBag className="w-5 h-5" />}
      {count > 0 && (
        <span
          className={
            badgeClassName ||
            'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--sf-primary,#111111)] text-white text-[10px] font-bold leading-none flex items-center justify-center'
          }
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

interface AddToCartButtonProps {
  product: any;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Tombol "tambah ke keranjang" untuk kartu produk tema. */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, className = '', style, children }) => {
  const storeSlug = useStorefrontSlug();
  return (
    <button
      type="button"
      data-cart-action="add"
      className={`cursor-pointer ${className}`}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addProductToCart(storeSlug, product, 1);
      }}
    >
      {children ?? '+ Keranjang'}
    </button>
  );
};

/** Notifikasi singkat di halaman toko (editor & toko live). */
export const StorefrontToast: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent).detail?.message || null);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2800);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] bg-[#111111] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </span>
      <span>{message}</span>
    </div>
  );
};

/** Angka jumlah barang di keranjang (untuk badge bawaan tema). */
export const CartCount: React.FC = () => {
  const count = useCartCount(useStorefrontSlug());
  return <>{count > 99 ? '99+' : count}</>;
};

/** Badge jumlah keranjang yang hanya tampil bila ada barang. */
export const CartCountBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const count = useCartCount(useStorefrontSlug());
  if (count <= 0) return null;
  return <span className={className}>{count > 99 ? '99+' : count}</span>;
};
