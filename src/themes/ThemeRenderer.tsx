import React from 'react';
import { Store, Product } from '../types';
import { getStoreSectionsForPage } from '../utils/layoutConstants';
import { CenterPreviewCanvas } from '../components/layout-editor/CenterPreviewCanvas';
import { THEME_DATA_MAP } from './themeData';
import { normalizeThemeId } from './ThemeRegistry';

interface ThemeRendererProps {
  store?: Store;
  products?: Product[];
}

// Helper: determine initial page from URL/path (outside component to avoid re-computation)
const resolveInitialPage = (store?: Store): string => {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  const currentPath = window.location.pathname.toLowerCase();

  if (pageParam) return pageParam;
  if (currentPath.includes('/katalog') || currentPath.includes('/products') || currentPath.includes('/catalog') || currentPath.includes('/produk')) return 'katalog';
  if (currentPath.includes('/about') || currentPath.includes('/tentang')) return 'about';
  if (currentPath.includes('/contact') || currentPath.includes('/kontak')) return 'contact';
  if (currentPath.includes('/product/')) return 'product';
  if (currentPath.includes('/cart') || currentPath.includes('/keranjang')) return 'cart';
  if (currentPath.includes('/checkout')) return 'checkout';
  if (currentPath.includes('/orders') || currentPath.includes('/pesanan')) return 'orders';
  if (currentPath.includes('/profile') || currentPath.includes('/profil')) return 'profile';
  if (currentPath.includes('/forgot-password') || currentPath.includes('/lupa-password')) return 'forgot_password';
  if (currentPath.includes('/register') || currentPath.includes('/daftar')) return 'register';
  if (currentPath.includes('/login') || currentPath.includes('/masuk')) return 'login';
  if (currentPath.includes('/promo')) return 'promo';
  if (currentPath.includes('/wishlist') || currentPath.includes('/favorit')) return 'wishlist';
  if (currentPath.includes('/address') || currentPath.includes('/alamat')) return 'address';
  if (currentPath.includes('/order-detail') || currentPath.includes('/detail-pesanan')) return 'order_detail';
  if (currentPath.includes('/category/')) return 'category';
  if ((store?.layoutSettings as any)?.activePage) return (store?.layoutSettings as any).activePage;
  return 'homepage';
};

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ store, products = [] }) => {
  // ✅ Hooks MUST be called unconditionally at the top — before any early returns
  const [activePage, setActivePage] = React.useState<string>(() => resolveInitialPage(store));

  // Guard: if no store, render a fallback (after hooks)
  if (!store || !store.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memuat pratinjau...</span>
        </div>
      </div>
    );
  }

  const rawThemeId = (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist';
  const activeThemeId = normalizeThemeId(rawThemeId);
  const themeData = THEME_DATA_MAP[activeThemeId] || THEME_DATA_MAP['minimalist'];
  const displayProducts = products || [];

  const sections = getStoreSectionsForPage(store.layoutSettings, activePage);

  return (
    <CenterPreviewCanvas
      store={store}
      products={displayProducts}
      sections={sections}
      selectedSectionKey={null}
      onSelectSection={() => {}}
      deviceMode="desktop"
      onDeviceModeChange={() => {}}
      primaryAccent={store.layoutSettings?.primaryAccent || '#1A1A1A'}
      readonly={true}
      activeThemeId={activeThemeId as any}
      activePage={activePage}
      onPageChange={(newPage) => setActivePage(newPage)}
    />
  );
};
