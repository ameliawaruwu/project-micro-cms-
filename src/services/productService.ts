import { Product } from '../types';
import { initialProducts } from './mockData';
import { calculateProductStatus } from '../utils/formatters';

const PRODUCTS_KEY = 'microcms_products_v1';

class ProductService {
  private getStoredProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    try {
      const parsed: Product[] = JSON.parse(data);
      
      // Deduplicate loaded products by ID
      const productMap = new Map<string, Product>();
      parsed.forEach((p) => {
        if (p && p.id) {
          productMap.set(p.id, p);
        }
      });

      let modified = false;
      initialProducts.forEach((p) => {
        if (!productMap.has(p.id)) {
          productMap.set(p.id, p);
          modified = true;
        }
      });

      const uniqueProducts = Array.from(productMap.values());
      if (modified || uniqueProducts.length !== parsed.length) {
        this.saveProducts(uniqueProducts);
      }
      return uniqueProducts;
    } catch {
      return initialProducts;
    }
  }

  private saveProducts(products: Product[]) {
    // Ensure all saved products are strictly unique by ID
    const uniqueMap = new Map<string, Product>();
    products.forEach((p) => {
      if (p && p.id) {
        uniqueMap.set(p.id, p);
      }
    });
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    let products = this.getStoredProducts();
    let storeProducts = products.filter((p) => p.storeId === storeId);

    // If store has 0 products, seed high quality default sample products for this store
    if (storeProducts.length === 0) {
      const templateItems = initialProducts.slice(0, 6).map((item, idx) => ({
        ...item,
        id: `prod-${storeId}-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        storeId,
        slug: `${item.slug}-${storeId.slice(-4)}`,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      }));

      products = [...products, ...templateItems];
      this.saveProducts(products);
      return templateItems;
    }

    return storeProducts;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const products = this.getStoredProducts();
    return products.find((p) => p.id === id);
  }

  async createProduct(storeId: string, data: Omit<Product, 'id' | 'storeId' | 'status' | 'createdAt' | 'slug'>): Promise<Product> {
    const products = this.getStoredProducts();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newProduct: Product = {
      ...data,
      id: `prod-${uniqueSuffix}`,
      storeId,
      slug: `${slug || 'produk'}-${uniqueSuffix.slice(-5)}`,
      status: calculateProductStatus(data.stock),
      createdAt: new Date().toISOString(),
    };

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

    products[index] = {
      ...products[index],
      ...updates,
      status: updates.status || newStatus,
    };
    this.saveProducts(products);
    return products[index];
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    return this.updateProduct(id, {
      stock: Math.max(0, newStock),
      status: calculateProductStatus(newStock),
    });
  }

  async deleteProduct(id: string): Promise<void> {
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
