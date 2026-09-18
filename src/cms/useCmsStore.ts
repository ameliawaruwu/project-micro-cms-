import { create } from 'zustand';
import {
  CmsStoreInfo,
  CmsProduct,
  CmsCategory,
  CmsNews,
  CmsNavigationItem,
  CmsPage,
  mockStoreInfo,
  mockProducts,
  mockCategories,
  mockNews,
  mockNavigation,
  mockPages
} from './mockCmsData';
import { THEME_DATA_MAP } from '../themes/themeData';

interface CmsState {
  storeInfo: CmsStoreInfo;
  products: CmsProduct[];
  categories: CmsCategory[];
  news: CmsNews[];
  navigation: CmsNavigationItem[];
  pages: CmsPage[];

  // Actions
  loadThemeData: (themeId: string) => void;
  updateProduct: (product: CmsProduct) => void;

  // Selectors/Helpers
  getProductBySlug: (slug: string) => CmsProduct | undefined;
  getProductsByCategory: (categoryId: string) => CmsProduct[];
  getNewsBySlug: (slug: string) => CmsNews | undefined;
  getPageBySlug: (slug: string) => CmsPage | undefined;
}

const getInitialProducts = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('microcms_cms_products') || localStorage.getItem('microcms_cms_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If cached data contains old fashion products, clear cache and return new hardware mock products
        const hasFashion = Array.isArray(parsed) && parsed.some(p => 
          /dress|blouse|cardigan|pants|skirt|fashion|amaryllis|knit/i.test(p.name || '') ||
          /dress|atasan|outerwear|bawahan/i.test(p.categoryName || '')
        );
        if (hasFashion) {
          sessionStorage.removeItem('microcms_cms_products');
          localStorage.removeItem('microcms_cms_products');
          return mockProducts;
        }
        return parsed;
      }
    } catch (e) {}
  }
  return mockProducts;
};

export const useCmsStore = create<CmsState>((set, get) => ({
  storeInfo: mockStoreInfo,
  products: getInitialProducts(),
  categories: mockCategories,
  news: mockNews,
  navigation: mockNavigation.sort((a, b) => a.order - b.order),
  pages: mockPages,

  getProductBySlug: (slug: string) => get().products.find(p => p.slug === slug),
  getProductsByCategory: (categoryId: string) => get().products.filter(p => p.categoryId === categoryId),
  getNewsBySlug: (slug: string) => get().news.find(n => n.slug === slug),
  getPageBySlug: (slug: string) => get().pages.find(p => p.slug === slug),

  updateProduct: (updatedProduct: CmsProduct) => set(state => {
    const newProducts = state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
        localStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
        window.dispatchEvent(new Event('cms_draft_updated'));
      } catch (e) {}
    }
    return { products: newProducts };
  }),

  loadThemeData: (themeId: string) => {
    // Check if user has saved custom edited products in session
    let activeProds: CmsProduct[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('microcms_cms_products') || localStorage.getItem('microcms_cms_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          const hasFashion = Array.isArray(parsed) && parsed.some(p => 
            /dress|blouse|cardigan|pants|skirt|fashion|amaryllis|knit/i.test(p.name || '')
          );
          if (!hasFashion) {
            activeProds = parsed;
          }
        }
      } catch (e) {}
    }

    const cleanThemeId = themeId === 'future_shop' || themeId === 'futuristic_dark' ? 'futuristic' : themeId;
    const themeData = THEME_DATA_MAP[cleanThemeId as keyof typeof THEME_DATA_MAP] || THEME_DATA_MAP['futuristic'];
    if (themeData) {
      const finalProducts = activeProds.length > 0 ? activeProds : themeData.products;
      set({
        storeInfo: themeData.storeInfo,
        products: finalProducts,
        categories: themeData.categories,
        navigation: themeData.navigation.sort((a, b) => a.order - b.order),
      });
    }
  },
}));
