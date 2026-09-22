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

export function cmsProductToProduct(cp: CmsProduct, storeId: string = 'store-andhika'): Product {
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

  setProductsFromMerchant: (merchantProducts: Product[]) => {
    if (!merchantProducts || merchantProducts.length === 0) return;
    const cmsList = merchantProducts.map(productToCmsProduct);
    set({ products: cmsList });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('microcms_cms_products', JSON.stringify(cmsList));
        localStorage.setItem('microcms_cms_products', JSON.stringify(cmsList));
        window.dispatchEvent(new Event('cms_draft_updated'));
      } catch (e) {}
    }
  },

  updateProduct: (updatedProduct: CmsProduct, storeId: string = 'store-andhika') => {
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

  addProduct: (newProduct: CmsProduct, storeId: string = 'store-andhika') => {
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
