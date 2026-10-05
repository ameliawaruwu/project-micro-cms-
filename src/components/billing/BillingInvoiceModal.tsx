import React, { useState } from 'react';
import { X, Printer, Copy, Check, Mail, Globe } from 'lucide-react';
import { Store as StoreType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { KroomifyLogo } from '../common/KroomifyLogo';

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
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [copied, setCopied] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format currency matching the reference (Rp430.000 without space)
  const formatInvoiceCurrency = (val: number) => {
    return `Rp${val.toLocaleString('id-ID')}`;
  };

  // Format current print timestamp e.g. "31 Agustus 2026 11:38 WIB"
  const printTimestamp = `${invoice.date} 11:38 WIB`;

  return (
    <div
      id="invoice-modal-overlay"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs font-sans"
    >
      {/* Modal Card Wrapper - Compact, Proportional & Internal Scroll */}
      <div
        id="invoice-modal-card"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[88vh] shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 text-left overflow-hidden flex flex-col"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-xs text-gray-700 truncate">
              {invoice.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyInvoiceNumber}
              className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{isEn ? 'Copied' : 'Tersalin'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>{isEn ? 'Copy' : 'Salin'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 rounded-lg bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>{isEn ? 'Print / PDF' : 'Cetak / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title={isEn ? 'Close' : 'Tutup'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= Printable Document Area (Scrollable Internally) ================= */}
        <div
          id="invoice-printable-area"
          className="p-4 sm:p-5 bg-white text-gray-900 space-y-3.5 overflow-y-auto"
        >
          {/* Header: Kroomify Brand Logo on Left, INVOICE title on Right */}
          <div className="flex items-start justify-between gap-3">
            {/* Brand Logo & Tagline */}
            <div className="space-y-0.5">
              <KroomifyLogo size="md" className="h-6 sm:h-7" />
              <p className="text-[10px] font-semibold text-gray-500">
                {isEn ? 'MSME Micro-CMS & Store Platform' : 'Platform Micro-CMS & Toko Online UMKM'}
              </p>
            </div>

            {/* Invoice Title & Number */}
            <div className="text-right space-y-0.5">
              <h1 className="text-base sm:text-lg font-black text-black tracking-[0.18em] uppercase leading-none">
                INVOICE
              </h1>
              <p className="font-bold text-xs text-[#66000E] tracking-wide font-mono">
                {invoice.id}
              </p>
            </div>
          </div>

          {/* DITERBITKAN ATAS NAMA & UNTUK */}
          <div className="grid grid-cols-2 gap-3 text-[10.5px] leading-snug pt-1">
            {/* Left: Diterbitkan Atas Nama */}
            <div>
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mb-1">
                {isEn ? 'ISSUED BY' : 'DITERBITKAN ATAS NAMA'}
              </span>
              <table className="text-[10.5px]">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-500 pr-2 py-0.5">{isEn ? 'Seller' : 'Penjual'}</td>
                    <td className="font-medium text-gray-500 pr-1 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5">Kroomify</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Untuk */}
            <div>
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mb-1">
                {isEn ? 'FOR' : 'UNTUK'}
              </span>
              <table className="text-[10.5px]">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-500 pr-2 py-0.5 whitespace-nowrap">{isEn ? 'Buyer' : 'Pembeli'}</td>
                    <td className="font-medium text-gray-500 pr-1 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5 uppercase truncate max-w-[120px]">
                      {store.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-500 pr-2 py-0.5 whitespace-nowrap">{isEn ? 'Date' : 'Tanggal'}</td>
                    <td className="font-medium text-gray-500 pr-1 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5">
                      {invoice.date}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Solid Separator Line (Micro CMS Brand Color) */}
          <div className="h-[2px] bg-[#66000E] w-full" />

          {/* Table Products */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#66000E] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-2.5 text-left">{isEn ? 'ITEM' : 'PRODUK'}</th>
                  <th className="py-2 px-1.5 text-center w-10">QTY</th>
                  <th className="py-2 px-2.5 text-right">{isEn ? 'PRICE' : 'HARGA'}</th>
                  <th className="py-2 px-2.5 text-right">{isEn ? 'TOTAL' : 'TOTAL'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-2.5 align-top">
                    <p className="font-bold text-gray-900 leading-snug">
                      {isEn
                        ? `Platform Subscription — ${invoice.plan} (${invoice.cycle})`
                        : `Langganan Platform — ${invoice.plan} (${invoice.cycle})`}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {store.slug ? `${store.slug}.kroombox.com` : 'kroomify.kroombox.com'}
                    </p>
                  </td>
                  <td className="py-2.5 px-1.5 text-center font-semibold text-gray-800 align-top">
                    1
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-semibold text-gray-800 align-top">
                    {formatInvoiceCurrency(invoice.amount)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-bold text-gray-900 align-top">
                    {formatInvoiceCurrency(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Calculation Area (Right Aligned) */}
          <div className="flex justify-end pt-1">
            <div className="w-60 space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-600 text-[10.5px]">
                <span className="uppercase font-semibold tracking-wide">
                  {isEn ? 'SUBTOTAL' : 'SUBTOTAL'}
                </span>
                <span className="font-bold text-gray-900">
                  {formatInvoiceCurrency(invoice.amount)}
                </span>
              </div>

              <div className="border-t border-gray-200 my-1" />

              <div className="flex justify-between items-center">
                <span className="uppercase font-bold text-xs text-gray-900 tracking-wide">
                  {isEn ? 'TOTAL' : 'TOTAL TAGIHAN'}
                </span>
                <span className="font-black text-sm text-[#66000E]">
                  {formatInvoiceCurrency(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: HUBUNGI KAMI on Left, Dicetak pada on Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] pt-2.5 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#66000E]" />
                support@kroombox.com
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#66000E]" />
                kroombox.com
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="italic text-gray-400">
                {isEn ? 'Printed:' : 'Dicetak:'} {printTimestamp}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Print CSS to fill page properly with standard margins (no giant whitespace) */}
      <style>{`
        @page {
          size: auto;
          margin: 12mm 15mm 12mm 15mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #invoice-printable-area,
          #invoice-printable-area * {
            visibility: visible;
          }
          #invoice-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            z-index: 99999 !important;
          }
          #invoice-modal-card {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            min-width: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }
          #invoice-printable-area {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
