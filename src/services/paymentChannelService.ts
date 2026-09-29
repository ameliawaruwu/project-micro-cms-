export interface PaymentChannel {
  id: string; // Midtrans snap payment code e.g. 'qris', 'bca_va', etc.
  name: string;
  category: 'qris_ewallet' | 'virtual_account' | 'credit_card' | 'retail_paylater';
  categoryLabel: string;
  description: string;
  badge: string;
  color: string;
  iconCode: string;
  isEnabled: boolean;
}

const CHANNELS_STORAGE_KEY = 'microcms_midtrans_channels_v2';

export const DEFAULT_MIDTRANS_CHANNELS: PaymentChannel[] = [
  // 1. QRIS & E-Wallet
  {
    id: 'qris',
    name: 'QRIS Real-Time',
    category: 'qris_ewallet',
    categoryLabel: 'QRIS & E-Wallet',
    description: 'Scan & bayar dari semua aplikasi m-Banking (BCA, Mandiri, BRI, BNI) dan E-Wallet (GoPay, OVO, DANA, ShopeePay).',
    badge: 'Instan Otomatis',
    color: '#ED1C24',
    iconCode: 'QRIS',
    isEnabled: true,
  },
  {
    id: 'gopay',
    name: 'GoPay & GoPay Later',
    category: 'qris_ewallet',
    categoryLabel: 'QRIS & E-Wallet',
    description: 'Pembayaran langsung terintegrasi dengan saldo GoPay atau GoPay Later pelanggan.',
    badge: 'Instan',
    color: '#00AED6',
    iconCode: 'GOPAY',
    isEnabled: true,
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay & SPayLater',
    category: 'qris_ewallet',
    categoryLabel: 'QRIS & E-Wallet',
    description: 'Pembayaran instan langsung dari aplikasi Shopee pelanggan.',
    badge: 'Instan',
    color: '#EE4D2D',
    iconCode: 'SHOPEE',
    isEnabled: true,
  },

  // 2. Virtual Account (Transfer Bank Otomatis)
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Transfer otomatis via BCA Mobile, myBCA, KlikBCA, atau ATM BCA (Cek lunas instan 24 jam).',
    badge: 'Otomatis 24/7',
    color: '#003B70',
    iconCode: 'BCA',
    isEnabled: true,
  },
  {
    id: 'mandiri_bill',
    name: 'Mandiri Virtual Account',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Pembayaran via Livin by Mandiri (Bill Payment), Internet Banking, dan ATM Mandiri.',
    badge: 'Otomatis 24/7',
    color: '#003D79',
    iconCode: 'MANDIRI',
    isEnabled: true,
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Transfer otomatis via BNI Mobile Banking, Internet Banking, dan ATM BNI.',
    badge: 'Otomatis 24/7',
    color: '#005E6A',
    iconCode: 'BNI',
    isEnabled: true,
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account (BRIVA)',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Pembayaran instan via BRImo, Internet Banking BRI, dan ATM BRI.',
    badge: 'Otomatis 24/7',
    color: '#00529C',
    iconCode: 'BRI',
    isEnabled: true,
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Transfer via PermataMobile X, ATM Permata, dan transfer jaringan antarbank.',
    badge: 'Otomatis 24/7',
    color: '#008850',
    iconCode: 'PERMATA',
    isEnabled: true,
  },
  {
    id: 'cimb_va',
    name: 'CIMB Niaga Virtual Account',
    category: 'virtual_account',
    categoryLabel: 'Virtual Account',
    description: 'Pembayaran via OCTO Mobile, OCTO Clicks, dan ATM CIMB Niaga.',
    badge: 'Otomatis 24/7',
    color: '#7F1416',
    iconCode: 'CIMB',
    isEnabled: true,
  },

  // 3. Kartu Kredit & Debit Online
  {
    id: 'credit_card',
    name: 'Kartu Kredit & Debit (Visa / Mastercard / JCB)',
    category: 'credit_card',
    categoryLabel: 'Kartu Kredit',
    description: 'Mendukung kartu kredit dan debit berlogo Visa, MasterCard, JCB, dan AMEX dengan proteksi 3D Secure OTP.',
    badge: '3D Secure',
    color: '#4338CA',
    iconCode: 'CARD',
    isEnabled: true,
  },

  // 4. Gerai Retail & PayLater
  {
    id: 'indomaret',
    name: 'Indomaret / Ceriamart',
    category: 'retail_paylater',
    categoryLabel: 'Gerai Retail & PayLater',
    description: 'Bayar tunai di seluruh meja kasir Indomaret dan Ceriamart dengan kode pembayaran.',
    badge: 'Kasir Retail',
    color: '#005BAA',
    iconCode: 'INDOMARET',
    isEnabled: false,
  },
  {
    id: 'alfamart',
    name: 'Alfamart / Alfamidi',
    category: 'retail_paylater',
    categoryLabel: 'Gerai Retail & PayLater',
    description: 'Bayar tunai di seluruh meja kasir Alfamart, Alfamidi, dan Dan+Dan di seluruh Indonesia.',
    badge: 'Kasir Retail',
    color: '#E31B23',
    iconCode: 'ALFAMART',
    isEnabled: false,
  },
  {
    id: 'akulaku',
    name: 'Akulaku PayLater',
    category: 'retail_paylater',
    categoryLabel: 'Gerai Retail & PayLater',
    description: 'Cicilan instan tanpa kartu kredit dengan akun Akulaku pelanggan.',
    badge: 'PayLater',
    color: '#FF5000',
    iconCode: 'AKULAKU',
    isEnabled: false,
  },
];

class PaymentChannelService {
  getChannels(): PaymentChannel[] {
    const raw = localStorage.getItem(CHANNELS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(DEFAULT_MIDTRANS_CHANNELS));
      return DEFAULT_MIDTRANS_CHANNELS;
    }
    try {
      const parsed: PaymentChannel[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_MIDTRANS_CHANNELS;
      }
      // Merge with default list in case new channels were added
      const map = new Map<string, PaymentChannel>();
      parsed.forEach((c) => map.set(c.id, c));
      const merged = DEFAULT_MIDTRANS_CHANNELS.map((def) => {
        const existing = map.get(def.id);
        return existing ? { ...def, isEnabled: existing.isEnabled } : def;
      });
      return merged;
    } catch {
      return DEFAULT_MIDTRANS_CHANNELS;
    }
  }

  saveChannels(channels: PaymentChannel[]): void {
    localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(channels));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('microcms_payment_channels_updated', { detail: channels }));
      try {
        const bc = new BroadcastChannel('microcms_payment_channel');
        bc.postMessage({ type: 'payment_channels_updated', channels });
        bc.close();
      } catch {
        // ignore
      }
    }
  }

  toggleChannel(id: string): { channels: PaymentChannel[]; updatedItem: PaymentChannel | undefined } {
    const channels = this.getChannels();
    let updatedItem: PaymentChannel | undefined;
    const updated = channels.map((c) => {
      if (c.id === id) {
        updatedItem = { ...c, isEnabled: !c.isEnabled };
        return updatedItem;
      }
      return c;
    });
    this.saveChannels(updated);
    return { channels: updated, updatedItem };
  }

  setAllChannels(enabled: boolean): PaymentChannel[] {
    const channels = this.getChannels();
    const updated = channels.map((c) => ({ ...c, isEnabled: enabled }));
    this.saveChannels(updated);
    return updated;
  }

  getEnabledPaymentIds(): string[] {
    const channels = this.getChannels();
    const enabled = channels.filter((c) => c.isEnabled).map((c) => c.id);
    return enabled.length > 0 ? enabled : ['qris', 'bca_va'];
  }
}

export const paymentChannelService = new PaymentChannelService();

export const CHANNEL_NAME_MAP: Record<string, { id: string; en: string }> = {
  credit_card: {
    id: 'Kartu Kredit & Debit (Visa / Mastercard / JCB)',
    en: 'Credit & Debit Card (Visa / Mastercard / JCB)',
  },
};

export const CHANNEL_DESC_MAP: Record<string, { id: string; en: string }> = {
  qris: {
    id: 'Scan & bayar dari semua aplikasi m-Banking (BCA, Mandiri, BRI, BNI) dan E-Wallet (GoPay, OVO, DANA, ShopeePay).',
    en: 'Scan & pay from all mobile banking apps (BCA, Mandiri, BRI, BNI) and E-Wallets (GoPay, OVO, DANA, ShopeePay).',
  },
  gopay: {
    id: 'Pembayaran langsung terintegrasi dengan saldo GoPay atau GoPay Later pelanggan.',
    en: 'Direct payment integrated with customer\'s GoPay or GoPay Later balance.',
  },
  shopeepay: {
    id: 'Pembayaran instan langsung dari aplikasi Shopee pelanggan.',
    en: 'Instant checkout directly from customer\'s Shopee application.',
  },
  bca_va: {
    id: 'Transfer otomatis via BCA Mobile, myBCA, KlikBCA, atau ATM BCA (Cek lunas instan 24 jam).',
    en: 'Automated transfer via BCA Mobile, myBCA, KlikBCA, or BCA ATM (Instant 24/7 verification).',
  },
  mandiri_bill: {
    id: 'Pembayaran via Livin by Mandiri (Bill Payment), Internet Banking, dan ATM Mandiri.',
    en: 'Payment via Livin by Mandiri (Bill Payment), Internet Banking, and Mandiri ATM.',
  },
  bni_va: {
    id: 'Transfer otomatis via BNI Mobile Banking, Internet Banking, dan ATM BNI.',
    en: 'Automated transfer via BNI Mobile Banking, Internet Banking, and BNI ATM.',
  },
  bri_va: {
    id: 'Pembayaran instan via BRImo, Internet Banking BRI, dan ATM BRI.',
    en: 'Instant payment via BRImo, BRI Internet Banking, and BRI ATM.',
  },
  permata_va: {
    id: 'Transfer via PermataMobile X, ATM Permata, dan transfer jaringan antarbank.',
    en: 'Transfer via PermataMobile X, Permata ATM, and interbank network transfers.',
  },
  cimb_va: {
    id: 'Pembayaran via OCTO Mobile, OCTO Clicks, dan ATM CIMB Niaga.',
    en: 'Payment via OCTO Mobile, OCTO Clicks, and CIMB Niaga ATM.',
  },
  credit_card: {
    id: 'Mendukung kartu kredit dan debit berlogo Visa, MasterCard, JCB, dan AMEX dengan proteksi 3D Secure OTP.',
    en: 'Supports credit and debit cards with Visa, MasterCard, JCB, and AMEX with 3D Secure OTP protection.',
  },
  indomaret: {
    id: 'Bayar tunai di seluruh meja kasir Indomaret dan Ceriamart dengan kode pembayaran.',
    en: 'Pay in cash at all Indomaret and Ceriamart counters using a payment code.',
  },
  alfamart: {
    id: 'Bayar tunai di seluruh meja kasir Alfamart, Alfamidi, dan Dan+Dan di seluruh Indonesia.',
    en: 'Pay in cash at all Alfamart, Alfamidi, and Dan+Dan counters across Indonesia.',
  },
  akulaku: {
    id: 'Cicilan instan tanpa kartu kredit dengan akun Akulaku pelanggan.',
    en: 'Instant installment without credit card using customer\'s Akulaku account.',
  },
};

export const getLocalizedChannelDescription = (channelId: string, fallbackDesc?: string, lang: 'id' | 'en' = 'id'): string => {
  if (CHANNEL_DESC_MAP[channelId]) {
    return CHANNEL_DESC_MAP[channelId][lang] || CHANNEL_DESC_MAP[channelId].id;
  }
  return fallbackDesc || '';
};

export const getLocalizedChannelName = (channelId: string, fallbackName: string, lang: 'id' | 'en' = 'id'): string => {
  if (CHANNEL_NAME_MAP[channelId]) {
    return CHANNEL_NAME_MAP[channelId][lang] || CHANNEL_NAME_MAP[channelId].id;
  }
  return fallbackName;
};
