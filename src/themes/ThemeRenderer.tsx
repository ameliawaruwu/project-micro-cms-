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
    return <div>Store tidak ditemukan.</div>;
  }

  const sections = getStoreSections(store.layoutSettings);

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
                deviceMode="desktop"
                primaryAccent={store.layoutSettings?.primaryAccent || '#2563EB'}
                onSelectSection={() => {}}
                onDeviceModeChange={() => {}}
                readonly={true}
              />
            } 
          />
          {/* Add more routes here as needed for catalog, about, etc */}
        </Routes>
      </div>
    </MemoryRouter>
  );
};
