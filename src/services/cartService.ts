import { CartItem, Product } from '../types';

const CART_KEY_PREFIX = 'microcms_cart_';

class CartService {
  getCart(storeSlug: string): CartItem[] {
    const data = localStorage.getItem(`${CART_KEY_PREFIX}${storeSlug}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveCart(storeSlug: string, items: CartItem[]) {
    localStorage.setItem(`${CART_KEY_PREFIX}${storeSlug}`, JSON.stringify(items));
  }

  addToCart(storeSlug: string, product: Product, quantity = 1): CartItem[] {
    const items = this.getCart(storeSlug);
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        product,
        quantity,
      });
    }

    this.saveCart(storeSlug, items);
    return items;
  }

  updateQuantity(storeSlug: string, productId: string, quantity: number): CartItem[] {
    let items = this.getCart(storeSlug);
    if (quantity <= 0) {
      items = items.filter((item) => item.product.id !== productId);
    } else {
      const existing = items.find((item) => item.product.id === productId);
      if (existing) {
        existing.quantity = quantity;
      }
    }
    this.saveCart(storeSlug, items);
    return items;
  }

  removeFromCart(storeSlug: string, productId: string): CartItem[] {
    const items = this.getCart(storeSlug).filter((item) => item.product.id !== productId);
    this.saveCart(storeSlug, items);
    return items;
  }

  clearCart(storeSlug: string) {
    localStorage.removeItem(`${CART_KEY_PREFIX}${storeSlug}`);
  }

  getTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export const cartService = new CartService();
