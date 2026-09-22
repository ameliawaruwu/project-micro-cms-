import React, { useState } from 'react';
import { X, Printer, Copy, Check, Mail, Globe } from 'lucide-react';
import { Store as StoreType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-gray-950/70 backdrop-blur-xs overflow-y-auto font-sans"
    >
      {/* Modal Card Wrapper */}
      <div
        id="invoice-modal-card"
        className="bg-white rounded-2xl max-w-2xl w-full p-0 shadow-2xl border border-gray-200 my-4 animate-in fade-in zoom-in-95 duration-150 text-left overflow-hidden flex flex-col"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-xs text-gray-700">
              {isEn ? 'Official Invoice Preview' : 'Preview Invoice Resmi'} — {invoice.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyInvoiceNumber}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{isEn ? 'Copied!' : 'Tersalin!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>{isEn ? 'Copy Inv No.' : 'Salin No. Inv'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / Download PDF' : 'Cetak / Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title={isEn ? 'Close' : 'Tutup'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Document Area ================= */}
        <div
          id="invoice-printable-area"
          className="p-6 sm:p-8 bg-white text-gray-900 space-y-4 sm:space-y-5"
        >
          
          {/* Header: Clean Brand Text on Left (No Logo), INVOICE title on Right */}
          <div className="flex items-start justify-between">
            {/* Brand Typography */}
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-[#66000E] tracking-tight uppercase">KROOMSTORE</h2>
              <p className="text-[11px] font-semibold text-gray-500">
                {isEn ? 'MSME Micro-CMS & Online Store Platform' : 'Platform Micro-CMS & Toko Online UMKM'}
              </p>
            </div>

            {/* Invoice Title & Number */}
            <div className="text-right space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-black tracking-[0.25em] uppercase">
                INVOICE
              </h1>
              <p className="font-bold text-xs sm:text-sm text-[#66000E] tracking-wide">
                {invoice.id}
              </p>
            </div>
          </div>

          {/* DITERBITKAN ATAS NAMA & UNTUK */}
          <div className="grid grid-cols-2 gap-6 text-[11px] leading-relaxed pt-2">
            
            {/* Left: Diterbitkan Atas Nama */}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block mb-1.5">
                {isEn ? 'ISSUED ON BEHALF OF' : 'DITERBITKAN ATAS NAMA'}
              </span>
              <table className="text-[11px]">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-600 pr-3 py-0.5">{isEn ? 'Seller' : 'Penjual'}</td>
                    <td className="font-medium text-gray-600 pr-2 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5">KroomStore</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Untuk */}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block mb-1.5">
                {isEn ? 'FOR' : 'UNTUK'}
              </span>
              <table className="text-[11px]">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-600 pr-3 py-0.5 whitespace-nowrap">{isEn ? 'Buyer' : 'Pembeli'}</td>
                    <td className="font-medium text-gray-600 pr-2 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5 uppercase">
                      {store.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-600 pr-3 py-0.5 whitespace-nowrap">{isEn ? 'Purchase Date' : 'Tanggal Pembelian'}</td>
                    <td className="font-medium text-gray-600 pr-2 py-0.5">:</td>
                    <td className="font-bold text-gray-900 py-0.5">
                      {invoice.date}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Solid Separator Line (Micro CMS Brand Color) */}
          <div className="h-[2.5px] bg-[#66000E] w-full" />

          {/* Table Products */}
          <div className="overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#66000E] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-left">{isEn ? 'PRODUCT INFO' : 'INFO PRODUK'}</th>
                  <th className="py-2.5 px-2 text-center w-14">QTY</th>
                  <th className="py-2.5 px-3 text-right">{isEn ? 'UNIT PRICE' : 'HARGA SATUAN'}</th>
                  <th className="py-2.5 px-3 text-right">{isEn ? 'TOTAL PRICE' : 'TOTAL HARGA'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-3 align-top">
                    <p className="font-bold text-gray-900 text-xs leading-snug">
                      {isEn ? `KroomStore Platform Subscription — ${invoice.plan} (${invoice.cycle}) + Store Domain (${store.slug ? `kroomstore.id/${store.slug}` : 'kroomstore.id'})` : `Langganan Platform KroomStore — ${invoice.plan} (${invoice.cycle}) + Domain Toko (${store.slug ? `kroomstore.id/${store.slug}` : 'kroomstore.id'})`}
                    </p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">
                      {isEn ? 'Access to online store features, product catalog, automated payment gateway, and store showcase domain' : 'Akses fitur jualan online, katalog produk, payment gateway otomatis, dan domain etalase toko'}
                    </p>
                  </td>
                  <td className="py-4 px-2 text-center font-semibold text-gray-800 align-top">
                    1
                  </td>
                  <td className="py-4 px-3 text-right font-semibold text-gray-800 align-top">
                    {formatInvoiceCurrency(invoice.amount)}
                  </td>
                  <td className="py-4 px-3 text-right font-bold text-gray-900 align-top">
                    {formatInvoiceCurrency(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Calculation Area (Right Aligned) */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-gray-600 text-[11px]">
                <span className="uppercase font-semibold text-[10px] tracking-wide">
                  {isEn ? 'TOTAL PRICE (1 ITEM)' : 'TOTAL HARGA (1 BARANG)'}
                </span>
                <span className="font-bold text-gray-900">
                  {formatInvoiceCurrency(invoice.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600 text-[11px]">
                <span className="uppercase font-semibold text-[10px] tracking-wide">
                  {isEn ? 'SHOPPING TOTAL' : 'TOTAL BELANJA'}
                </span>
                <span className="font-bold text-gray-900">
                  {formatInvoiceCurrency(invoice.amount)}
                </span>
              </div>

              <div className="border-t border-gray-300 my-1.5" />

              <div className="flex justify-between items-center pt-0.5">
                <span className="uppercase font-bold text-xs text-gray-900 tracking-wide">
                  {isEn ? 'TOTAL BILL' : 'TOTAL TAGIHAN'}
                </span>
                <span className="font-bold text-base text-[#66000E]">
                  {formatInvoiceCurrency(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: HUBUNGI KAMI on Left, Dicetak pada on Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-[10.5px] pt-4 border-t border-gray-200">
            
            {/* Contact Info */}
            <div className="space-y-1">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[9.5px] block">
                {isEn ? 'CONTACT US' : 'HUBUNGI KAMI'}
              </span>
              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#66000E]" />
                <span>support@kroomstore.id</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#66000E]" />
                <span>kroomstore.id</span>
              </div>
            </div>

            {/* Print Date */}
            <div className="text-left sm:text-right">
              <span className="italic text-[10px] text-gray-400">
                {isEn ? 'Printed on:' : 'Dicetak pada:'} {printTimestamp}
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
