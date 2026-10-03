import React from 'react';
import { ThemeSchema } from '../schema';
import { Product, CartItem } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { cartService } from '../../services/cartService';

interface CartPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  onNavigate?: (pageId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ themeData, themeId: propThemeId, store, products = [], onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const liveStoreInfo = useCmsStore((state) => state.storeInfo);
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const storeName = liveStoreInfo?.name || store?.name || 'Toko Kami';
  const storeDesc = liveStoreInfo?.description || store?.description || '';
  const activeStoreSlug = store?.slug || (liveStoreInfo as any)?.slug;

  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    if (!activeStoreSlug) return [];
    try {
      return cartService.getCart(activeStoreSlug);
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      if (activeStoreSlug) {
        try {
          setCartItems(cartService.getCart(activeStoreSlug));
        } catch (e) {}
      }
    };
    window.addEventListener('cart_updated', handleUpdate);
    return () => window.removeEventListener('cart_updated', handleUpdate);
  }, [activeStoreSlug]);

  const handleRemove = (productId: string) => {
    if (!activeStoreSlug) return;
    const updated = cartService.removeFromCart(activeStoreSlug, productId);
    setCartItems([...updated]);
    window.dispatchEvent(new CustomEvent('cart_updated'));
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (!activeStoreSlug) return;
    const updated = cartService.updateQuantity(activeStoreSlug, productId, qty);
    setCartItems([...updated]);
    window.dispatchEvent(new CustomEvent('cart_updated'));
  };

  const totalAmount = cartItems.reduce((acc, it) => acc + (it.product.price * it.quantity), 0);

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const navbarOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    tagline: storeDesc,
    ...((headerSection as any)?.options || (headerSection as any)?.settings)
  };

  const footerOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    ...((footerSection as any)?.options || (footerSection as any)?.settings)
  };

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderEmptyCart = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 text-center min-h-[50vh]">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
        Anda belum menambahkan barang apapun ke keranjang belanja. Jelajahi katalog kami dan temukan produk terbaik.
      </p>
      <button 
        type="button"
        onClick={() => onNavigate ? onNavigate('katalog') : null}
        className="px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition cursor-pointer shadow-md"
      >
        Mulai Belanja
      </button>
    </div>
  );

  const renderCartContent = () => {
    if (cartItems.length === 0) {
      return renderEmptyCart();
    }

    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-black uppercase tracking-tighter mb-8">
              KERANJANG BELANJA
            </h1>
            <div className="bg-[#FF0000] p-6 md:p-12 border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] space-y-4 sm:space-y-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-white p-4 sm:p-6 border-4 border-black flex items-center justify-between shadow-[6px_6px_0px_rgba(0,0,0,1)] gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={item.product.imageUrl || (item.product as any).image} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-black shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-black text-base sm:text-xl uppercase truncate">{item.product.name}</h3>
                      <p className="font-black text-sm sm:text-lg text-[#FF0000]">Rp {item.product.price.toLocaleString('id-ID')} x {item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemove(item.product.id)}
                    className="p-2 sm:p-3 bg-black text-white font-black hover:bg-[#FF0000] border-2 border-black cursor-pointer shrink-0"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
              <div className="bg-yellow-300 p-4 sm:p-6 border-4 border-black flex justify-between items-center text-lg sm:text-xl font-black">
                <span>TOTAL:</span>
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate ? onNavigate('checkout') : null}
                className="w-full py-4 sm:py-6 bg-black text-white text-xl sm:text-2xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                LANJUT PENGIRIMAN 🚀
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. DEFAULT / MINIMALIST / OTHERS
    return (
      <div className="pt-28 pb-24 bg-white text-[#1A1A1A] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight mb-6 sm:mb-8">Keranjang Belanja ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} Item)</h1>
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-8 border border-gray-200 space-y-4 sm:space-y-6">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <img src={item.product.imageUrl || (item.product as any).image} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium">Rp {item.product.price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-gray-800 px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-sm sm:text-base text-gray-900">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleRemove(item.product.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition cursor-pointer"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center font-bold text-lg sm:text-xl text-gray-900">
              <span>Total Pembayaran</span>
              <span className="text-[#66000E]">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>

            <button 
              type="button"
              onClick={() => onNavigate ? onNavigate('checkout') : null}
              className="w-full py-3.5 sm:py-4 bg-[#1A1A1A] hover:bg-black text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Pembayaran &amp; Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? (
        <CustomNavbar sectionOptions={navbarOptions} />
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderCartContent()}</div>

      {CustomFooter ? (
        <CustomFooter sectionOptions={footerOptions} />
      ) : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
