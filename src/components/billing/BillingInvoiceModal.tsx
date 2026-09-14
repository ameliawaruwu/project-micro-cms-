import React from 'react';
import { X, Printer, Shield, CheckCircle2, QrCode } from 'lucide-react';
import { Store as StoreType } from '../../types';
import { formatRupiah } from '../../utils/formatters';

export interface InvoiceRecord {
  id: string;
  plan: string;
  cycle: string;
  date: string;
  amount: number;
  status: string;
}

interface BillingInvoiceModalProps {
  invoice: InvoiceRecord | null;
  store: StoreType;
  isOpen: boolean;
  onClose: () => void;
}

export const BillingInvoiceModal: React.FC<BillingInvoiceModalProps> = ({
  invoice,
  store,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5E0DD] my-4 animate-in fade-in zoom-in-95 duration-200 text-left">
        
        {/* Top Controls (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E0DD] print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-700">
              <Shield className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm text-[#1F1F1F]">
              Bukti Pembayaran & Invoice Resmi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="space-y-6 text-[#1F1F1F]">
          
          {/* Header & Paid Stamp */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b-2 border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-md bg-[#66000E] flex items-center justify-center text-white font-black text-xs shadow-xs">
                  K
                </div>
                <span className="text-lg font-black tracking-tight text-[#1F1F1F]">KROOMBOX</span>
              </div>
              <p className="text-[11px] text-[#706866] leading-tight">
                Platform Micro-CMS & Solusi Toko Online UMKM
              </p>
              <p className="text-[10px] text-[#706866] mt-0.5">
                PT Kroombox Teknologi Indonesia • billing@kroombox.id
              </p>
            </div>

            {/* Paid Badge Stamp */}
            <div className="border-2 border-emerald-600/80 bg-emerald-50/50 rounded-2xl px-4 py-2 text-center shrink-0">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LUNAS / PAID</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                VERIFIED MIDTRANS
              </span>
            </div>
          </div>

          {/* Invoice Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#706866] block mb-1">
                Diterbitkan Kepada:
              </span>
              <p className="font-bold text-sm text-[#1F1F1F]">{store.name}</p>
              <p className="text-[#706866] mt-0.5">kroombox.id/{store.slug}</p>
              <p className="text-[#706866] mt-0.5">WhatsApp: {store.phoneWhatsApp}</p>
              <p className="text-[#706866]">{store.city || 'Indonesia'}</p>
            </div>

            <div className="text-right sm:text-right space-y-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#706866] block">
                  Nomor Invoice:
                </span>
                <span className="font-mono font-bold text-sm text-[#66000E]">
                  {invoice.id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#706866] block">
                  Tanggal Pembayaran:
                </span>
                <span className="font-semibold text-gray-800">
                  {invoice.date}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#706866] block">
                  Metode Pembayaran:
                </span>
                <span className="font-semibold text-gray-800">
                  Payment Gateway (Otomatis)
                </span>
              </div>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F7] border-b border-gray-200 text-[#706866] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Deskripsi Layanan</th>
                  <th className="py-2.5 px-3">Siklus</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F1F1F] text-xs">
                      Langganan Platform Kroombox — {invoice.plan}
                    </p>
                    <p className="text-[10px] text-[#706866] mt-0.5">
                      Akses penuh fitur jualan online, integrasi pembayaran otomatis, dan domain etalase toko.
                    </p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#706866]">
                    {invoice.cycle}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">
                    {formatRupiah(invoice.amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#1F1F1F]">
                    {formatRupiah(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total Calculation */}
            <div className="bg-[#FAF7F7]/60 p-4 border-t border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#706866]">
                <span>Subtotal Layanan</span>
                <span className="font-medium text-[#1F1F1F]">{formatRupiah(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-[#706866]">
                <span>PPN (11%) & Biaya Admin Gateway</span>
                <span className="font-medium text-emerald-700">Rp 0 (Ditanggung Kroombox)</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black">
                <span className="text-[#1F1F1F]">Total Dibayar</span>
                <span className="text-base text-[#66000E] font-black">{formatRupiah(invoice.amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer & QR Verification */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 p-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`INVOICE-VERIFIED:${invoice.id}:${store.slug}:${invoice.amount}`)}&color=66000e`}
                  alt="Invoice Verification QR"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-[10px] text-[#706866] leading-tight">
                <p className="font-bold text-[#1F1F1F] flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-[#66000E]" />
                  <span>Verifikasi Elektronik Valid</span>
                </p>
                <p className="mt-0.5">
                  Scan QR code untuk memeriksa keaslian bukti pembayaran ini di server Kroombox.
                </p>
                <p className="text-[9px] text-[#999999] mt-0.5">
                  Dokumen ini diterbitkan sah secara digital tanpa memerlukan tanda tangan basah.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#706866] block">Otorisasi Finansial</span>
              <span className="text-xs font-bold text-[#66000E]">Kroombox Automated Billing</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
