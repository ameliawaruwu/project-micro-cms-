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

  // Selectors/Helpers
  getProductBySlug: (slug: string) => CmsProduct | undefined;
  getProductsByCategory: (categoryId: string) => CmsProduct[];
  getNewsBySlug: (slug: string) => CmsNews | undefined;
  getPageBySlug: (slug: string) => CmsPage | undefined;
}

export const useCmsStore = create<CmsState>((set, get) => ({
  storeInfo: mockStoreInfo,
  products: mockProducts,
  categories: mockCategories,
  news: mockNews,
  navigation: mockNavigation.sort((a, b) => a.order - b.order),
  pages: mockPages,

  getProductBySlug: (slug: string) => get().products.find(p => p.slug === slug),
  getProductsByCategory: (categoryId: string) => get().products.filter(p => p.categoryId === categoryId),
  getNewsBySlug: (slug: string) => get().news.find(n => n.slug === slug),
  getPageBySlug: (slug: string) => get().pages.find(p => p.slug === slug),

  loadThemeData: (themeId: string) => {
    // Only load if the theme is in our data map
    const themeData = THEME_DATA_MAP[themeId as keyof typeof THEME_DATA_MAP];
    if (themeData) {
      set({
        storeInfo: themeData.storeInfo,
        products: themeData.products,
        categories: themeData.categories,
        navigation: themeData.navigation.sort((a, b) => a.order - b.order),
      });
    }
  },
}));
