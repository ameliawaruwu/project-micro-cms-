export interface CustomerInfo {
  name: string;
  phoneWhatsApp: string;
  email: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
  notes?: string;
}

const CUSTOMER_SAVED_INFO_KEY = 'microcms_customer_info';

export const customerService = {
  getSavedInfo(): CustomerInfo | null {
    try {
      const data = localStorage.getItem(CUSTOMER_SAVED_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveInfo(info: CustomerInfo): void {
    localStorage.setItem(CUSTOMER_SAVED_INFO_KEY, JSON.stringify(info));
  },
};
