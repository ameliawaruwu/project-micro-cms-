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
      if (saved) return JSON.parse(saved);
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
        if (saved) activeProds = JSON.parse(saved);
      } catch (e) {}
    }

    const themeData = THEME_DATA_MAP[themeId as keyof typeof THEME_DATA_MAP];
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
