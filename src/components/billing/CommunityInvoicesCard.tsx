import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { CommunityTurnoverInvoice, Store } from '../../types';
import { communityService } from '../../services/communityService';
import { storeInCommunity, withExtraMemberships } from '../../utils/communityMembership';
import { formatRupiah } from '../../utils/formatters';

/**
 * Daftar tagihan omset komunitas untuk merchant (hanya baca).
 * Invoice diterbitkan & dilunasi oleh Super Admin; RLS hanya mengembalikan
 * invoice komunitas tempat toko merchant terdaftar.
 */
export const CommunityInvoicesCard: React.FC<{ store: Store }> = ({ store }) => {
  const [invoices, setInvoices] = useState<CommunityTurnoverInvoice[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([communityService.fetchCommunityInvoices(), withExtraMemberships([store])])
      .then(([rows, [storeWithMemberships]]) => {
        // Saring ke komunitas toko ini (admin yang membuka halaman ini bisa membaca semua invoice).
        if (!cancelled) setInvoices(rows.filter((inv) => storeInCommunity(storeWithMemberships, inv.communityId)));
      })
      .catch(() => {
        // Tabel belum tersedia / tidak ada akses: cukup sembunyikan kartu.
      });
    return () => {
      cancelled = true;
    };
  }, [store.id, store.communityId]);

  if (invoices.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs p-4 sm:p-5 space-y-3">
      <h2 className="text-sm sm:text-base font-bold text-[#241A1A] flex items-center gap-2">
        <Receipt className="w-4 h-4 text-[#66000E]" />
        <span>Tagihan Komunitas</span>
      </h2>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-3 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-[#241A1A]">{inv.invoiceNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    inv.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {inv.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                </span>
              </div>
              <p className="text-[11px] text-[#706866] mt-0.5">
                {inv.period} · Fee {inv.feePercent}% dari {formatRupiah(inv.totalTurnover)}
                {inv.status !== 'paid' && inv.dueDate
                  ? ` · Jatuh tempo ${new Date(inv.dueDate).toLocaleDateString('id-ID')}`
                  : ''}
              </p>
            </div>
            <span className="text-sm font-extrabold text-[#66000E] shrink-0">{formatRupiah(inv.totalBilled)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
