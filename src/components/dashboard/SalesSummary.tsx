import React from 'react';
import { ArrowRight, AlertTriangle, Send, MessageCircle } from 'lucide-react';
import { Order, Product } from '../../types';
import { formatRupiah, generateWhatsAppLink } from '../../utils/formatters';

interface SalesSummaryProps {
  orders: Order[];
  lowStockProducts: Product[];
  onViewAllOrders: () => void;
  onProcessOrder: (order: Order) => void;
  onUpdateStock: (product: Product) => void;
}

export const SalesSummary: React.FC<SalesSummaryProps> = ({
  orders,
  lowStockProducts,
  onViewAllOrders,
  onProcessOrder,
  onUpdateStock,
}) => {
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Recent Orders (2 Columns on Desktop) */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1F1F1F]">Pesanan Terbaru Masuk</h3>
              <p className="text-xs text-[#555555] mt-0.5 font-normal">Segera kirim paket agar pelanggan puas</p>
            </div>
            <button
              onClick={onViewAllOrders}
              className="text-xs font-semibold text-[#9A0602] hover:text-[#7D0502] flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-[#777777] text-xs">
                Belum ada pesanan masuk hari ini.
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-[#EAEAEA] hover:border-[#9A0602] bg-white hover:bg-[#F7F7F7] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EAEAEA] overflow-hidden shrink-0">
                      <img
                        src={order.items[0]?.productImage || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=100'}
                        alt={order.items[0]?.productName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1F1F1F]">{order.orderNumber}</span>
                        <span className="text-[11px] text-[#777777]">• {order.customerName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[#555555] font-medium truncate max-w-xs mt-0.5">
                        {order.items[0]?.productName} {order.items.length > 1 ? `(+${order.items.length - 1} lainnya)` : ''}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#777777] mt-1">
                        <span className="font-bold text-[#1F1F1F]">{formatRupiah(order.grandTotal)}</span>
                        <span>•</span>
                        <span>{order.courier} ({order.customerCity})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={generateWhatsAppLink(order.customerPhone, `Halo Kak ${order.customerName}, terima kasih sudah order di toko kami (No: ${order.orderNumber}). Pesanan sedang kami siapkan ya!`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                      title="Hubungi Pembeli via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
                      <button
                        onClick={() => onProcessOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white text-xs font-semibold transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Proses Kirim</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#555555] bg-[#F7F7F7] border border-[#EAEAEA] px-2.5 py-1 rounded-lg">
                        {order.shippingStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#555555]">
          <span>Semua pesanan otomatis tersinkronisasi</span>
          <span className="font-mono text-[11px] text-[#777777]">Update Realtime</span>
        </div>
      </div>

      {/* Stock Alerts & Quick Tips (1 Column on Desktop) */}
      <div className="space-y-4">
        {/* Low stock reminder */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-xs">
          <div className="flex items-center gap-2 text-[#9A0602] mb-3">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm text-[#1F1F1F]">Perhatian Stok Menipis</h3>
          </div>
          <p className="text-xs text-[#555555] mb-3 font-normal">
            Ada produk dengan sisa stok sedikit. Segera tambah agar tidak kehabisan.
          </p>

          <div className="space-y-2.5">
            {lowStockProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF1F0] border border-[#FECDCA] text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-[#1F1F1F] truncate">{prod.name}</p>
                  <span className="text-[11px] text-[#9A0602] font-semibold">Sisa: {prod.stock} unit</span>
                </div>
                <button
                  onClick={() => onUpdateStock(prod)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#FECDCA] text-[#9A0602] font-semibold hover:bg-[#FFF1F0] transition shrink-0 cursor-pointer"
                >
                  + Tambah
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* UMKM Tip Box */}
        <div className="bg-[#1F1F1F] rounded-2xl p-5 text-white shadow-xs">
          <div className="flex items-center gap-2 text-[#FECDCA] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>💡 Tips Jualan Laris UMKM</span>
          </div>
          <h4 className="font-bold text-sm text-white mb-1.5">Pasang Link Toko di Bio Instagram & Status WA</h4>
          <p className="text-xs text-[#EAEAEA] leading-relaxed font-normal">
            Pembeli lebih suka order lewat link otomatis daripada manual tanya harga satu-satu. Bagikan tautan tokomu setiap hari!
          </p>
        </div>
      </div>
    </div>
  );
};

