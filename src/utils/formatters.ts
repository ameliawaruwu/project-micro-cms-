import { CourierType, ProductStatus } from '../types';

export const formatRupiah = (number: number | undefined | null): string => {
  const n = typeof number === 'number' && !isNaN(number) ? number : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatNumber = (num: number | undefined | null): string => {
  const n = typeof num === 'number' && !isNaN(num) ? num : 0;
  return new Intl.NumberFormat('id-ID').format(n);
};

export const formatDateIndo = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const generateWhatsAppLink = (phone: string | undefined | null, message: string): string => {
  const rawPhone = phone || '081234567890';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
};

export const generateTrackingLink = (courier: CourierType | string, resi: string): string => {
  if (!resi) return '#';
  const c = courier.toUpperCase();
  if (c.includes('J&T')) {
    return `https://jet.co.id/track?awb=${resi}`;
  }
  if (c.includes('JNE')) {
    return `https://www.jne.co.id/tracking?resi=${resi}`;
  }
  if (c.includes('SICEPAT')) {
    return `https://www.sicepat.com/checkAwb/${resi}`;
  }
  if (c.includes('GOSEND')) {
    return `https://www.gojek.com/gosend/tracking/${resi}`;
  }
  return `https://cekresi.com/?noresi=${resi}`;
};

export const calculateProductStatus = (stock: number): ProductStatus => {
  if (stock <= 0) return 'Habis';
  if (stock <= 5) return 'Hampir Habis';
  return 'Tersedia';
};

export const getStatusBadgeColor = (status: string): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'Tersedia':
    case 'Selesai':
    case 'Sudah Dibayar':
    case 'Terhubung':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Hampir Habis':
    case 'Diproses':
    case 'Baru':
      return { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Dikirim':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Habis':
    case 'Nonaktif':
    case 'Belum Dibayar':
    case 'Gagal':
    case 'Dibatalkan':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', border: 'border-slate-200' };
  }
};
