export const getCourierBadgeStyle = (courier?: string) => {
  const c = (courier || '').toUpperCase();
  if (c.includes('J&T')) return 'bg-red-50 text-red-700 border-red-200';
  if (c.includes('SICEPAT')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (c.includes('JNE')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (c.includes('GOSEND')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getShippingStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case 'Selesai':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Dikirim':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Diproses':
    case 'ready_to_ship':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Baru':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Dibatalkan':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const getShippingStatusLabel = (status?: string, isEn: boolean = false) => {
  switch (status) {
    case 'Baru':
      return isEn ? 'New Order' : 'Pesanan Baru';
    case 'Diproses':
    case 'ready_to_ship':
      return isEn ? 'Ready to Ship' : 'Siap Kirim';
    case 'Dikirim':
      return isEn ? 'In Shipping' : 'Dalam Pengiriman';
    case 'Selesai':
      return isEn ? 'Delivered' : 'Selesai';
    case 'Dibatalkan':
      return isEn ? 'Cancelled' : 'Dibatalkan';
    default:
      return status || (isEn ? 'Pending' : 'Menunggu');
  }
};

export const getPaymentStatusLabel = (status?: string, isEn: boolean = false) => {
  switch (status) {
    case 'Sudah Dibayar':
    case 'paid':
      return isEn ? 'Paid' : 'Sudah Dibayar';
    case 'Menunggu Pembayaran':
    case 'pending':
      return isEn ? 'Pending Payment' : 'Menunggu Pembayaran';
    case 'Gagal':
    case 'failed':
      return isEn ? 'Failed' : 'Gagal';
    case 'Dibatalkan':
    case 'cancelled':
      return isEn ? 'Cancelled' : 'Dibatalkan';
    default:
      return status || (isEn ? 'Pending' : 'Menunggu');
  }
};
