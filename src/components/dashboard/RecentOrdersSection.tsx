import React from 'react';
import { ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDateIndo, getStatusBadgeColor } from '../../utils/formatters';

interface RecentOrdersSectionProps {
  orders: Order[];
  onViewAllOrders: () => void;
  onSelectOrder: (order: Order) => void;
}

export const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
  orders,
  onViewAllOrders,
  onSelectOrder,
}) => {
  const latestOrders = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] p-4 sm:p-5 lg:p-6 shadow-2xs font-sans text-left">
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[#241A1A]">Pesanan Terbaru</h2>
          </div>
        </div>

        <button
          onClick={onViewAllOrders}
          className="text-xs font-medium text-[#66000E] hover:text-[#801010] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {latestOrders.length === 0 ? (
        <div className="py-12 text-center text-[#706866]">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-[#E5E0DD]" />
          <p className="text-xs font-normal">Belum ada pesanan masuk hari ini.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E0DD] text-[#706866] font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">No. Pesanan</th>
                  <th className="py-3 px-3">Pembeli</th>
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0DD] font-normal text-[#241A1A]">
                {latestOrders.map((order) => {
                  const badge = getStatusBadgeColor(order.shippingStatus);
                  const firstItem = order.items[0];
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-[#FAF7F7] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono font-medium text-[#241A1A] group-hover:text-[#66000E]">
                          {order.orderNumber}
                        </span>
                        <span className="block text-[10px] text-[#706866] font-normal">
                          {formatDateIndo(order.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-medium text-[#241A1A]">{order.customerName}</p>
                        <p className="text-[10px] text-[#706866] font-normal">{order.customerCity}</p>
                      </td>

                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="flex items-center gap-2 truncate">
                          {firstItem && (
                            <img
                              src={firstItem.productImage}
                              alt={firstItem.productName}
                              className="w-7 h-7 rounded-md object-cover border border-[#E5E0DD] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="truncate">
                            <p className="truncate text-[#241A1A] font-normal">
                              {firstItem?.productName || 'Produk'}
                            </p>
                            {order.items.length > 1 && (
                              <span className="text-[10px] text-[#706866] font-normal">
                                +{order.items.length - 1} item lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[#241A1A]">
                          {formatRupiah(order.grandTotal)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F7] border border-[#E5E0DD] text-[#706866] text-[10px] font-medium">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                          {order.shippingStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F7] hover:bg-white hover:border-[#66000E] hover:text-[#66000E] text-[#241A1A] font-medium text-xs border border-[#E5E0DD] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Rincian</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-2.5 mt-3">
            {latestOrders.map((order) => {
              const badge = getStatusBadgeColor(order.shippingStatus);
              const firstItem = order.items[0];
              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-3.5 rounded-xl border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] transition space-y-2.5 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-medium text-xs text-[#241A1A]">
                        {order.orderNumber}
                      </span>
                      <p className="text-[10px] text-[#706866] font-normal">{formatDateIndo(order.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                      {order.shippingStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {firstItem && (
                      <img
                        src={firstItem.productImage}
                        alt={firstItem.productName}
                        className="w-11 h-11 rounded-lg object-cover border border-[#E5E0DD] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="truncate flex-1">
                      <p className="text-xs font-medium text-[#241A1A] truncate">{order.customerName}</p>
                      <p className="text-[11px] text-[#706866] font-normal truncate">{firstItem?.productName}</p>
                      <p className="text-xs font-medium text-[#241A1A] mt-0.5">
                        {formatRupiah(order.grandTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0DD] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#706866] font-normal">
                      {order.paymentMethod} • {order.courier}
                    </span>
                    <span className="font-medium text-[#66000E] flex items-center gap-1 text-xs">
                      <span>Kelola Pesanan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
