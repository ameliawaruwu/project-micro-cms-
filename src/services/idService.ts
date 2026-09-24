import { supabase } from './supabaseClient';

export type TableEntity =
  | 'users'
  | 'stores'
  | 'products'
  | 'orders'
  | 'order_items'
  | 'templates'
  | 'layouts'
  | 'sections'
  | 'categories'
  | 'domain_requests'
  | 'store_subscriptions'
  | 'billing_plans'
  | 'wallet_transactions'
  | 'withdrawals'
  | 'shipping_branches'
  | 'platform_settings';

export const TABLE_PREFIXES: Record<TableEntity, string> = {
  users: 'USR',
  stores: 'STR',
  products: 'PRD',
  orders: 'ORD',
  order_items: 'OIT',
  templates: 'TPL',
  layouts: 'LYT',
  sections: 'SEC',
  categories: 'CAT',
  domain_requests: 'DMR',
  store_subscriptions: 'SUB',
  billing_plans: 'PLN',
  wallet_transactions: 'WLT',
  withdrawals: 'WDR',
  shipping_branches: 'SHP',
  platform_settings: 'SET',
};

export class IdService {
  /**
   * Format nomor urut menjadi 3 digit atau lebih dengan prefix
   * Contoh: formatId('USR', 1) => 'USR001'
   */
  formatId(prefix: string, num: number): string {
    const numStr = String(Math.max(1, Math.floor(num)));
    const padded = numStr.length >= 3 ? numStr : numStr.padStart(3, '0');
    return `${prefix}${padded}`;
  }

  /**
   * Mengambil ID urutan berikutnya secara atomik dan aman dari PostgreSQL Sequence via Supabase RPC get_next_id.
   * Jika offline atau terjadi kendala jaringan, menggunakan counter sequence fallback lokal.
   */
  async generateNextId(table: TableEntity): Promise<string> {
    const prefix = TABLE_PREFIXES[table] || 'GEN';
    try {
      const { data, error } = await supabase.rpc('get_next_id', { p_table: table });
      if (!error && data && typeof data === 'string' && data.startsWith(prefix)) {
        return data;
      }
    } catch (e) {
      console.warn(`[IdService] get_next_id error for ${table}, using local sequence fallback:`, e);
    }

    return this.getLocalNextId(table);
  }

  /**
   * Fallback aman berbasis sequence counter di local storage jika offline
   */
  private getLocalNextId(table: TableEntity): string {
    const prefix = TABLE_PREFIXES[table] || 'GEN';
    const storageKey = `microcms_seq_${table}`;
    const storedVal = localStorage.getItem(storageKey);
    let currentVal = storedVal ? parseInt(storedVal, 10) : 0;
    if (isNaN(currentVal) || currentVal < 0) {
      currentVal = 0;
    }
    const nextVal = currentVal + 1;
    localStorage.setItem(storageKey, String(nextVal));
    return this.formatId(prefix, nextVal);
  }
}

export const idService = new IdService();
