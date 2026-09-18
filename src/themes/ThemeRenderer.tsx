import React from 'react';
import { Store, Product } from '../types';
import { getStoreSections, getStoreSectionsForPage } from '../utils/layoutConstants';
import { CenterPreviewCanvas } from '../components/layout-editor/CenterPreviewCanvas';
import { mockProducts } from '../cms/mockCmsData';
import { THEME_DATA_MAP } from './themeData';
import { normalizeThemeId } from './ThemeRegistry';

import { useCmsStore } from '../cms/useCmsStore';

interface ThemeRendererProps {
  store?: Store;
  products?: Product[];
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ store, products = [] }) => {
  if (!store) {
    return <div className="p-8 text-center text-gray-500">Store tidak ditemukan.</div>;
  }

  const cmsProducts = useCmsStore(state => state.products);
  const rawThemeId = (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist';
  const activeThemeId = normalizeThemeId(rawThemeId);
  const themeData = THEME_DATA_MAP[activeThemeId] || THEME_DATA_MAP['minimalist'];
  const themeProducts = themeData?.products && themeData.products.length > 0 ? themeData.products : mockProducts;
  const displayProducts = (products && products.length > 0) ? products : (cmsProducts && cmsProducts.length > 0 ? (cmsProducts as any[]) : (themeProducts as any[]));

  // Determine initial page based on query param or current browser path
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  const currentPath = window.location.pathname.toLowerCase();

  let initialPage = 'homepage';

  if (pageParam) {
    initialPage = pageParam;
  } else if (
    currentPath.includes('/katalog') || 
    currentPath.includes('/products') || 
    currentPath.includes('/catalog') || 
    currentPath.includes('/produk')
  ) {
    initialPage = 'katalog';
  } else if (currentPath.includes('/about') || currentPath.includes('/tentang')) {
    initialPage = 'about';
  } else if (currentPath.includes('/contact') || currentPath.includes('/kontak')) {
    initialPage = 'contact';
  } else if (currentPath.includes('/product/')) {
    initialPage = 'product';
  } else if (currentPath.includes('/cart') || currentPath.includes('/keranjang')) {
    initialPage = 'cart';
  } else if (currentPath.includes('/checkout')) {
    initialPage = 'checkout';
  } else if (currentPath.includes('/orders') || currentPath.includes('/pesanan')) {
    initialPage = 'orders';
  } else if (currentPath.includes('/profile') || currentPath.includes('/profil')) {
    initialPage = 'profile';
  } else if (currentPath.includes('/login') || currentPath.includes('/masuk')) {
    initialPage = 'login';
  } else if (currentPath.includes('/forgot-password') || currentPath.includes('/lupa-password')) {
    initialPage = 'forgot_password';
  } else if (currentPath.includes('/register') || currentPath.includes('/daftar')) {
    initialPage = 'register';
  } else if (currentPath.includes('/login') || currentPath.includes('/masuk')) {
    initialPage = 'login';
  } else if (currentPath.includes('/promo')) {
    initialPage = 'promo';
  } else if (currentPath.includes('/wishlist') || currentPath.includes('/favorit')) {
    initialPage = 'wishlist';
  } else if (currentPath.includes('/address') || currentPath.includes('/alamat')) {
    initialPage = 'address';
  } else if (currentPath.includes('/order-detail') || currentPath.includes('/detail-pesanan')) {
    initialPage = 'order_detail';
  } else if (currentPath.includes('/category/')) {
    initialPage = 'category';
  } else if ((store.layoutSettings as any)?.activePage) {
    initialPage = (store.layoutSettings as any).activePage;
  }

  const [activePage, setActivePage] = React.useState<string>(initialPage);

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
