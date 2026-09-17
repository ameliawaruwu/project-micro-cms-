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

  return (
    <MemoryRouter initialEntries={['/']}>
      <div className="min-h-screen relative font-sans w-full bg-white">
        <Routes>
          <Route 
            path="/" 
            element={
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
              />
            } 
          />
          {/* Add more routes here as needed for catalog, about, etc */}
        </Routes>
      </div>
    </MemoryRouter>
  );
};
