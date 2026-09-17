import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Store, Product } from '../types';
import { getStoreSections } from '../utils/layoutConstants';
import { CenterPreviewCanvas } from '../components/layout-editor/CenterPreviewCanvas';

interface ThemeRendererProps {
  store?: Store;
  products?: Product[];
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ store, products = [] }) => {
  if (!store) {
    return <div className="p-8 text-center text-gray-500">Store tidak ditemukan.</div>;
  }

  const sections = getStoreSections(store.layoutSettings);
  const activeThemeId = (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist';

  const renderCanvas = (activePage: string) => (
    <CenterPreviewCanvas 
      store={store}
      products={products}
      sections={sections}
      selectedSectionKey={null}
      onSelectSection={() => {}}
      deviceMode="desktop"
      onDeviceModeChange={() => {}}
      primaryAccent={store.layoutSettings?.primaryAccent || '#1A1A1A'}
      readonly={true}
      activeThemeId={activeThemeId as any}
      activePage={activePage}
    />
  );

  return (
    <MemoryRouter initialEntries={['/']}>
      <div className="min-h-screen relative font-sans w-full bg-white">
        <Routes>
          <Route path="/" element={renderCanvas('homepage')} />
          <Route path="/products" element={renderCanvas('catalog')} />
          <Route path="/catalog" element={renderCanvas('catalog')} />
          <Route path="/product/:id" element={renderCanvas('product')} />
          <Route path="/cart" element={renderCanvas('cart')} />
          <Route path="/about" element={renderCanvas('about')} />
          <Route path="/checkout" element={renderCanvas('checkout')} />
          <Route path="/orders" element={renderCanvas('orders')} />
          <Route path="/profile" element={renderCanvas('profile')} />
          <Route path="/login" element={renderCanvas('login')} />
          <Route path="/contact" element={renderCanvas('contact')} />
        </Routes>
      </div>
    </MemoryRouter>
  );
};
