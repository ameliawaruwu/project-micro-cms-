import { Product } from '../types';
import { calculateProductStatus } from '../utils/formatters';
import { supabase } from './supabaseClient';
import { initialProducts } from './mockData';

// ============================================================
// MERCHANT DATA ISOLATION: localStorage di-partisi per storeId
// Key format: microcms_products_v2_{storeId}
// ============================================================
const PRODUCTS_KEY_PREFIX = 'microcms_products_v2_';
// Hapus key global lama agar tidak bocor antar merchant
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_products_v1');
    localStorage.removeItem('microcms_products');
    localStorage.removeItem('microcms_products_clean_v1');
  } catch {
    // ignore
  }
}

function mapSupabaseRowToProduct(row: any): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    stock: Number(row.stock),
    category: row.category || 'Umum',
    imageUrl: row.image_url || '',
    images: row.images || [],
    status: row.status || calculateProductStatus(Number(row.stock)),
    sku: row.sku || '',
    weightGrams: row.weight_grams ? Number(row.weight_grams) : 250,
    variants: row.variants || [],
    dimensions: row.dimensions || { length: 10, width: 10, height: 10 },
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    isFeatured: Boolean(row.is_featured),
    salesCount: row.sales_count ? Number(row.sales_count) : 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

class ProductService {
  // ============================================================
  // localStorage dipartisi per storeId untuk isolasi data merchant
  // ============================================================
  private storeKey(storeId: string): string {
    return `${PRODUCTS_KEY_PREFIX}${storeId}`;
  }

  private getStoredProducts(storeId?: string): Product[] {
    if (storeId) {
      // Partisi per toko — ini yang benar untuk isolasi
      const data = localStorage.getItem(this.storeKey(storeId));
      if (!data) return [];
      try {
        const parsed: Product[] = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveProducts(storeId: string, productsToSave: Product[]) {
    const existing = this.getStoredProducts(storeId);
    const uniqueMap = new Map<string, Product>();
    existing.forEach((p) => {
      if (p && p.id) uniqueMap.set(p.id, p);
    });
    productsToSave.forEach((p) => {
      if (p && p.id) uniqueMap.set(p.id, p);
    });
    const finalProducts = Array.from(uniqueMap.values());
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(finalProducts));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('microcms_products_updated', { detail: finalProducts }));
      window.dispatchEvent(new Event('cms_draft_updated'));
    }
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    const localProducts = this.getStoredProducts(storeId);

    // 1. Try fetching from Supabase Database (selalu filter by store_id)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const dbProducts = data.map(mapSupabaseRowToProduct);

        if (dbProducts.length > 0) {
          // Merge db products with any local-only products
          const map = new Map<string, Product>();
          dbProducts.forEach((p) => map.set(p.id, p));
          localProducts.forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          this.saveProducts(storeId, merged);
          return merged;
        } else if (localProducts.length > 0) {
          // Supabase kosong, gunakan local
          return localProducts;
        }

        // Seed hanya untuk toko demo bawaan
        if (storeId === 'store-andhika') {
          const defaultStoreProducts = initialProducts.filter((p) => p.storeId === storeId);
          if (defaultStoreProducts.length > 0) {
            const storeMapped = defaultStoreProducts.map((p) => ({ ...p, storeId }));
            this.saveProducts(storeId, storeMapped);
            return storeMapped;
          }
        }
        return [];
      }
    } catch (err: any) {
      console.warn('[Supabase Database] Offline fallback for products:', err?.message || err);
    }

    // 2. Fallback ke LocalStorage
    if (localProducts.length === 0 && storeId === 'store-andhika') {
      const defaultStoreProducts = initialProducts.filter((p) => p.storeId === storeId);
      if (defaultStoreProducts.length > 0) {
        const storeMapped = defaultStoreProducts.map((p) => ({ ...p, storeId }));
        this.saveProducts(storeId, storeMapped);
        return storeMapped;
      }
    }
    return localProducts;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseRowToProduct(data);
      }
    } catch {
      // ignore, fallback to local
    }

    const products = this.getStoredProducts();
    return products.find((p) => p.id === id);
  }

  async createProduct(
    storeId: string,
    data: Omit<Product, 'id' | 'storeId' | 'status' | 'createdAt' | 'slug'>
  ): Promise<{ product: Product; syncedToCloud: boolean; cloudError?: string }> {
    const products = this.getStoredProducts(storeId);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newProduct: Product = {
      ...data,
      id: `prd-${uniqueSuffix}`,
      storeId,
      slug: `${slug || 'produk'}-${uniqueSuffix.slice(-5)}`,
      status: calculateProductStatus(data.stock),
      createdAt: new Date().toISOString(),
    };

    // 1. Always persist to LocalStorage first for instant UI update & zero blocking
    products.unshift(newProduct);
    this.saveProducts(storeId, products);

    // 2. Sync to Supabase Cloud Database
    let syncedToCloud = false;
    let cloudError: string | undefined;

    try {
      const { error } = await supabase.from('products').insert({
        id: newProduct.id,
        store_id: storeId,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        sku: newProduct.sku || '',
        weight_grams: newProduct.weightGrams || 250,
        description: newProduct.description || '',
        image_url: newProduct.imageUrl || '',
        images: newProduct.images || [],
        status: newProduct.status,
        slug: newProduct.slug,
      });

      if (error) {
        cloudError = `${error.message} (Code: ${error.code})`;
        console.warn('[Supabase Database]:', cloudError);
      } else {
        syncedToCloud = true;
        console.log(`[Supabase Database] Produk "${newProduct.name}" tersinkron ke cloud!`);
      }
    } catch (err: any) {
      cloudError = err?.message || 'Koneksi ke Supabase gagal';
      console.warn('[Supabase Database] Gagal sinkron ke cloud:', err);
    }

    return { product: newProduct, syncedToCloud, cloudError };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    // Dapatkan storeId dari updates atau dari localStorage
    const storeId = updates.storeId || this._findStoreIdForProduct(id);
    const products = this.getStoredProducts(storeId);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Produk tidak ditemukan');

    const newStock = updates.stock !== undefined ? updates.stock : products[index].stock;
    const newStatus = calculateProductStatus(newStock);

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      status: updates.status || newStatus,
    };

    // 1. Persist locally first
    products[index] = updatedProduct;
    this.saveProducts(storeId, products);

    // 2. Sync to Supabase Cloud Database — update divalidasi dengan store_id (ownership)
    try {
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.category !== undefined) dbPayload.category = updates.category;
      if (updates.price !== undefined) dbPayload.price = updates.price;
      if (updates.stock !== undefined) dbPayload.stock = updates.stock;
      if (updates.sku !== undefined) dbPayload.sku = updates.sku;
      if (updates.weightGrams !== undefined) dbPayload.weight_grams = updates.weightGrams;
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
      if (updates.images !== undefined) dbPayload.images = updates.images;
      if (updates.status !== undefined) dbPayload.status = updates.status;

      // Validasi ownership: hanya update produk yang store_id-nya cocok
      const { error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', id)
        .eq('store_id', storeId); // <- ownership check
      if (error) {
        console.warn('[Supabase Database Update]:', error.message);
      } else {
        console.log(`[Supabase Database] Produk "${id}" berhasil diperbarui di cloud!`);
      }
    } catch (err: any) {
      console.warn('[Supabase Database] Gagal update ke cloud:', err);
    }

    return updatedProduct;
  }

  /** Helper: cari storeId dari produk di localStorage (semua partisi) */
  private _findStoreIdForProduct(productId: string): string {
    // Cari di semua partisi yang ada
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PRODUCTS_KEY_PREFIX)) {
        try {
          const items: Product[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(items) && items.find((p) => p.id === productId)) {
            return key.replace(PRODUCTS_KEY_PREFIX, '');
          }
        } catch { /* ignore */ }
      }
    }
    return '';
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    return this.updateProduct(id, {
      stock: Math.max(0, newStock),
      status: calculateProductStatus(newStock),
    });
  }

  async deleteProduct(id: string, storeId?: string): Promise<void> {
    // Temukan storeId yang tepat untuk isolasi
    const resolvedStoreId = storeId || this._findStoreIdForProduct(id);

    // 1. Delete from localStorage (partisi per toko)
    if (resolvedStoreId) {
      let products = this.getStoredProducts(resolvedStoreId);
      products = products.filter((p) => p.id !== id);
      localStorage.setItem(this.storeKey(resolvedStoreId), JSON.stringify(products));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('microcms_products_updated', { detail: [] }));
      window.dispatchEvent(new Event('cms_draft_updated'));
    }

    // 2. Sync delete ke Supabase — validasi ownership dengan store_id
    try {
      let query = supabase.from('products').delete().eq('id', id);
      if (resolvedStoreId) {
        query = query.eq('store_id', resolvedStoreId); // <- ownership check
      }
      const { error } = await query;
      if (error) {
        console.warn('[Supabase Database Delete]:', error.message);
      }
    } catch (err: any) {
      console.warn('[Supabase Database] Gagal hapus dari cloud:', err);
    }
  }

  async getCategories(storeId: string): Promise<string[]> {
    const products = await this.getProductsByStore(storeId);
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }

  // Sinkronisasi manual/otomatis seluruh produk lokal ke Supabase
  async syncAllLocalToCloud(storeId: string): Promise<{ success: boolean; count: number; error?: string }> {
    const local = this.getStoredProducts(storeId);
    if (local.length === 0) {
      return { success: true, count: 0 };
    }

    let syncedCount = 0;
    for (const prod of local) {
      try {
        const { error } = await supabase.from('products').upsert({
          id: prod.id,
          store_id: storeId,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          stock: prod.stock,
          sku: prod.sku || '',
          weight_grams: prod.weightGrams || 250,
          description: prod.description || '',
          image_url: prod.imageUrl || '',
          images: prod.images || [],
          status: prod.status,
          slug: prod.slug,
        });

        if (error) {
          return { success: false, count: syncedCount, error: `${error.message} (Code: ${error.code})` };
        }
        syncedCount++;
      } catch (err: any) {
        return { success: false, count: syncedCount, error: err?.message || 'Gagal tersambung ke Supabase' };
      }
    }

    return { success: true, count: syncedCount };
  }
}

export const productService = new ProductService();
