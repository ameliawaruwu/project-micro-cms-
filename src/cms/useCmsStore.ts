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
import { normalizeThemeId } from '../themes/ThemeRegistry';
import { Product } from '../types';
import { productService } from '../services/productService';

export function productToCmsProduct(p: Product): CmsProduct {
  let cmsStatus: 'active' | 'draft' | 'archived' = 'active';
  if (p.status === 'Nonaktif' || p.status === 'Habis') {
    cmsStatus = 'draft';
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.imageUrl || (p.images && p.images[0]) || '',
    images: p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
    categoryId: p.category || 'all',
    categoryName: p.category || 'Umum',
    description: p.description || '',
    status: cmsStatus,
    isFeatured: Boolean(p.isFeatured),
    isNew: false,
    stock: p.stock ?? 10,
  };
}

export function cmsProductToProduct(cp: CmsProduct, storeId: string = ''): Product {
  let merchantStatus: 'Tersedia' | 'Hampir Habis' | 'Habis' | 'Nonaktif' = 'Tersedia';
  if (cp.status === 'draft' || cp.status === 'archived') {
    merchantStatus = 'Nonaktif';
  } else if ((cp.stock ?? 0) <= 0) {
    merchantStatus = 'Habis';
  } else if ((cp.stock ?? 0) <= 3) {
    merchantStatus = 'Hampir Habis';
  }

  return {
    id: cp.id,
    storeId,
    name: cp.name,
    slug: cp.slug || cp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: cp.description || '',
    price: cp.price,
    originalPrice: cp.originalPrice,
    stock: cp.stock ?? 10,
    category: cp.categoryName || 'Umum',
    imageUrl: cp.image || (cp.images && cp.images[0]) || '',
    images: cp.images && cp.images.length > 0 ? cp.images : (cp.image ? [cp.image] : []),
    status: merchantStatus,
    sku: `SKU-${cp.id.slice(-4).toUpperCase()}`,
    weightGrams: 250,
    createdAt: new Date().toISOString(),
  };
}

interface CmsState {
  storeInfo: CmsStoreInfo;
  products: CmsProduct[];
  categories: CmsCategory[];
  news: CmsNews[];
  navigation: CmsNavigationItem[];
  pages: CmsPage[];

  // Actions
  loadThemeData: (themeId: string) => void;
  updateStoreInfo: (info: Partial<CmsStoreInfo>) => void;
  updateProduct: (product: CmsProduct, storeId?: string) => void;
  addProduct: (product: CmsProduct, storeId?: string) => void;
  deleteProduct: (id: string) => void;
  setProductsFromMerchant: (products: Product[]) => void;

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check if draft has an active theme
      const draftStr = sessionStorage.getItem('microcms_preview_draft') || localStorage.getItem('microcms_preview_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        const themeId = normalizeThemeId(draft.layoutSettings?.activeThemeId || draft.layoutSettings?.themeStyle || 'editorial');
        if (THEME_DATA_MAP[themeId]?.products) {
          return THEME_DATA_MAP[themeId].products;
        }
      }
    } catch (e) {}
  }
  return THEME_DATA_MAP['editorial']?.products || THEME_DATA_MAP['minimalist']?.products || [];
};

const getInitialStoreInfo = (): CmsStoreInfo => {
  if (typeof window !== 'undefined') {
    try {
      const draftStr = sessionStorage.getItem('microcms_preview_draft') || localStorage.getItem('microcms_preview_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        const themeId = normalizeThemeId(draft.layoutSettings?.activeThemeId || draft.layoutSettings?.themeStyle || 'editorial');
        const themeData = THEME_DATA_MAP[themeId] || THEME_DATA_MAP['editorial'];
        return {
          name: draft.name || themeData.storeInfo.name || 'LOOKSEE',
          description: draft.description || themeData.storeInfo.description,
          address: draft.address || themeData.storeInfo.address,
          email: draft.email || themeData.storeInfo.email,
          phone: draft.phoneWhatsApp || themeData.storeInfo.phone,
          socials: themeData.storeInfo.socials,
        };
      }
    } catch (e) {}
  }
  return THEME_DATA_MAP['editorial']?.storeInfo || {
    name: "LOOKSEE",
    description: "Autumn / Winter Collection. High fashion editorial, tailoring & sophisticated silhouettes.",
    address: "Jakarta, Indonesia",
    email: "contact@looksee.id",
    phone: "+62 812 3456 7890",
    socials: { instagram: "@looksee.archive" }
  };
};

export const useCmsStore = create<CmsState>((set, get) => ({
  storeInfo: getInitialStoreInfo(),
  products: getInitialProducts(),
  categories: mockCategories,
  news: mockNews,
  navigation: mockNavigation.sort((a, b) => a.order - b.order),
  pages: mockPages,

  getProductBySlug: (slug: string) => get().products.find(p => p.slug === slug),
  getProductsByCategory: (categoryId: string) => get().products.filter(p => p.categoryId === categoryId),
  getNewsBySlug: (slug: string) => get().news.find(n => n.slug === slug),
  getPageBySlug: (slug: string) => get().pages.find(p => p.slug === slug),

  updateStoreInfo: (info: Partial<CmsStoreInfo>) => {
    set(state => ({
      storeInfo: {
        ...state.storeInfo,
        ...info,
      }
    }));
  },

  setProductsFromMerchant: (merchantProducts: Product[]) => {
    if (!merchantProducts || merchantProducts.length === 0) {
      set({ products: [] });
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('microcms_cms_products');
          localStorage.removeItem('microcms_cms_products');
        } catch (e) {}
      }
      return;
    }
    const cmsList = merchantProducts.map(productToCmsProduct);
    set({ products: cmsList });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('microcms_cms_products', JSON.stringify(cmsList));
        localStorage.setItem('microcms_cms_products', JSON.stringify(cmsList));
      } catch (e) {}
    }
  },

  updateProduct: (updatedProduct: CmsProduct, storeId: string = '') => {
    set(state => {
      const newProducts = state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          localStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          window.dispatchEvent(new Event('cms_draft_updated'));
          window.dispatchEvent(new CustomEvent('microcms_products_updated', { detail: newProducts }));
        } catch (e) {}
      }
      return { products: newProducts };
    });

    // Bidirectional sync to merchant ProductService
    try {
      productService.updateProduct(updatedProduct.id, {
        name: updatedProduct.name,
        price: updatedProduct.price,
        imageUrl: updatedProduct.image,
        category: updatedProduct.categoryName,
        description: updatedProduct.description,
        stock: updatedProduct.stock,
      }).catch(() => {
        // If product didn't exist in productService yet, create it
        const newMerchantProd = cmsProductToProduct(updatedProduct, storeId);
        productService.createProduct(storeId, newMerchantProd).catch(() => {});
      });
    } catch (e) {}
  },

  addProduct: (newProduct: CmsProduct, storeId: string = '') => {
    set(state => {
      const exists = state.products.some(p => p.id === newProduct.id);
      const newProducts = exists
        ? state.products.map(p => p.id === newProduct.id ? newProduct : p)
        : [newProduct, ...state.products];
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          localStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          window.dispatchEvent(new Event('cms_draft_updated'));
          window.dispatchEvent(new CustomEvent('microcms_products_updated', { detail: newProducts }));
        } catch (e) {}
      }
      return { products: newProducts };
    });

    // Bidirectional sync to merchant ProductService
    try {
      const merchantProduct = cmsProductToProduct(newProduct, storeId);
      productService.createProduct(storeId, merchantProduct)
        .catch(err => console.warn('[useCmsStore] addProduct sync error:', err));
    } catch (e) {}
  },

  deleteProduct: (id: string) => {
    set(state => {
      const newProducts = state.products.filter(p => p.id !== id);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          localStorage.setItem('microcms_cms_products', JSON.stringify(newProducts));
          window.dispatchEvent(new Event('cms_draft_updated'));
          window.dispatchEvent(new CustomEvent('microcms_products_updated', { detail: newProducts }));
        } catch (e) {}
      }
      return { products: newProducts };
    });

    // Bidirectional sync delete to merchant ProductService
    try {
      productService.deleteProduct(id)
        .catch(err => console.warn('[useCmsStore] deleteProduct sync error:', err));
    } catch (e) {}
  },

  loadThemeData: (themeId: string) => {
    const cleanThemeId = normalizeThemeId(themeId);

    // Check if user has saved custom edited products in session
    let activeProds: CmsProduct[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('microcms_cms_products') || localStorage.getItem('microcms_cms_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeProds = parsed;
          }
        }
      } catch (e) {}
    }

    const themeData = THEME_DATA_MAP[cleanThemeId] || THEME_DATA_MAP['editorial'] || THEME_DATA_MAP['minimalist'];
    if (themeData) {
      const finalProducts = activeProds.length > 0 ? activeProds : themeData.products;
      set((state) => ({
        storeInfo: {
          ...themeData.storeInfo,
          // Preserve custom name if already modified by merchant and not the old generic ones
          name: state.storeInfo.name && state.storeInfo.name !== 'Green Market Indonesia' && state.storeInfo.name !== 'Toko Sayur'
            ? state.storeInfo.name
            : themeData.storeInfo.name,
        },
        products: finalProducts,
        categories: themeData.categories,
        navigation: themeData.navigation.sort((a, b) => a.order - b.order),
      }));
    }
  },
}));
