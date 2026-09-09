import { Product } from '../types';
import { calculateProductStatus } from '../utils/formatters';
import { supabase } from './supabaseClient';

const PRODUCTS_KEY = 'microcms_products_clean_v1';

// Clean old dummy data from browser cache
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_products_v1');
    localStorage.removeItem('microcms_products');
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
  private getStoredProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      return [];
    }
    try {
      const parsed: Product[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveProducts(products: Product[]) {
    const uniqueMap = new Map<string, Product>();
    products.forEach((p) => {
      if (p && p.id) {
        uniqueMap.set(p.id, p);
      }
    });
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    // 1. Try fetching from Supabase Database
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const dbProducts = data.map(mapSupabaseRowToProduct);
        this.saveProducts(dbProducts);
        return dbProducts;
      }
    } catch (err: any) {
      console.warn('[Supabase Database] Offline fallback for products:', err?.message || err);
    }

    // 2. Fallback to LocalStorage (No fake dummy injection)
    const products = this.getStoredProducts();
    return products.filter((p) => p.storeId === storeId);
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
  ): Promise<Product> {
    const products = this.getStoredProducts();
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

    // 1. Save to Supabase Cloud Database
    try {
      const { error } = await supabase.from('products').insert({
        id: newProduct.id,
        store_id: storeId,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: newProduct.price,
        original_price: newProduct.originalPrice || null,
        stock: newProduct.stock,
        category: newProduct.category,
        image_url: newProduct.imageUrl,
        images: newProduct.images || [],
        status: newProduct.status,
        sku: newProduct.sku,
        weight_grams: newProduct.weightGrams || 250,
        variants: newProduct.variants || [],
        dimensions: newProduct.dimensions || { length: 10, width: 10, height: 10 },
        is_featured: newProduct.isFeatured || false,
        sales_count: newProduct.salesCount || 0,
      });

      if (error) {
        console.error('[Supabase Database Error]:', error);
        throw new Error(`Database Supabase: ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`[Supabase Database] Produk "${newProduct.name}" berhasil tersimpan ke tabel products!`);
      }
    } catch (err: any) {
      console.error('[Supabase Database] Gagal menyimpan ke cloud:', err);
      throw err;
    }

    // 2. Always persist to LocalStorage for instant UI update & offline reliability
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = this.getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Produk tidak ditemukan');

    const newStock = updates.stock !== undefined ? updates.stock : products[index].stock;
    const newStatus = calculateProductStatus(newStock);

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      status: updates.status || newStatus,
    };

    // 1. Update in Supabase Cloud Database
    try {
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.price !== undefined) dbPayload.price = updates.price;
      if (updates.originalPrice !== undefined) dbPayload.original_price = updates.originalPrice;
      if (updates.stock !== undefined) dbPayload.stock = updates.stock;
      if (updates.category !== undefined) dbPayload.category = updates.category;
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
      if (updates.sku !== undefined) dbPayload.sku = updates.sku;
      if (updates.weightGrams !== undefined) dbPayload.weight_grams = updates.weightGrams;
      if (updates.status !== undefined) dbPayload.status = updates.status;

      const { error } = await supabase.from('products').update(dbPayload).eq('id', id);
      if (error) {
        console.error('[Supabase Database Update Error]:', error);
        throw new Error(`Database Supabase: ${error.message}`);
      }
    } catch (err: any) {
      console.error('[Supabase Database] Gagal update ke cloud:', err);
      throw err;
    }

    // 2. Persist locally
    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    return this.updateProduct(id, {
      stock: Math.max(0, newStock),
      status: calculateProductStatus(newStock),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    // 1. Delete from Supabase Cloud Database
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('[Supabase Database Delete Error]:', error);
        throw new Error(`Database Supabase: ${error.message}`);
      }
    } catch (err: any) {
      console.error('[Supabase Database] Gagal hapus dari cloud:', err);
      throw err;
    }

    // 2. Delete from LocalStorage
    let products = this.getStoredProducts();
    products = products.filter((p) => p.id !== id);
    this.saveProducts(products);
  }

  async getCategories(storeId: string): Promise<string[]> {
    const products = await this.getProductsByStore(storeId);
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }
}

export const productService = new ProductService();
