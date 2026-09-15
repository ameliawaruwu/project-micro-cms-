import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Tag,
  Receipt,
  Scissors,
  CheckCircle2,
  Info,
  Truck,
  Building2,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReceiptModalProps {
  order: Order | null;
  store: StoreType;
  isOpen: boolean;
  onClose: () => void;
}

type PrintFormat = 'shipping_label' | 'invoice_a4' | 'thermal_receipt';

/**
 * Generates clean, deterministic SVG barcode lines from any code string (Resi / Order ID)
 */
const BarcodeSvg: React.FC<{ code: string }> = ({ code }) => {
  const safeCode = (code || '00000000').toUpperCase();
  const bars: { width: number; isSpace: boolean }[] = [];

  // Start guard
  bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 2, isSpace: false });

  for (let i = 0; i < safeCode.length; i++) {
    const charCode = safeCode.charCodeAt(i);
    const p1 = (charCode % 3) + 1;
    const p2 = ((charCode >> 1) % 2) + 1;
    const p3 = ((charCode >> 2) % 3) + 1;
    bars.push({ width: p1, isSpace: false });
    bars.push({ width: p2, isSpace: true });
    bars.push({ width: p3, isSpace: false });
    bars.push({ width: 1, isSpace: true });
  }

  // End guard
  bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 3, isSpace: false });

  let currentX = 0;
  const rects = [];
  for (let j = 0; j < bars.length; j++) {
    const bar = bars[j];
    if (!bar.isSpace) {
      rects.push(
        <rect
          key={j}
          x={currentX}
          y={0}
          width={bar.width * 1.5}
          height={48}
          fill="#000000"
        />
      );
    }
    currentX += bar.width * 1.5;
  }

  return (
    <div className="w-full flex justify-center py-1">
      <svg
        viewBox={`0 0 ${currentX} 48`}
        className="w-full max-w-[280px] h-11"
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
    </div>
  );
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  store,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  // Smart default: if order has resi, default to shipping label, else invoice A4
  const [format, setFormat] = useState<PrintFormat>(
    order?.resiNumber ? 'shipping_label' : 'invoice_a4'
  );

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const courierName = (order.courier || 'J&T').toUpperCase();
  const courierService = order.courierService || 'EZ (Reguler)';
  const resiNumber = order.resiNumber || order.trackingNumber || 'AUTO-PICKUP';
  const isCOD = order.paymentMethod === 'COD';

  return (
    <div id="modal-receipt" className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-poppins">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-[#EAEAEA] print:hidden shrink-0 space-y-3 bg-[#FAFAFA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-sm sm:text-base">
              <Printer className="w-4 h-4 text-[#9A0602]" />
              <span>{t('print_preview_title', 'Format Cetak & PDF Dokumen')}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#777777] hover:text-[#1F1F1F] hover:bg-[#EAEAEA] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Format Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#EDEDED] rounded-xl text-[10px] sm:text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFormat('shipping_label')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                format === 'shipping_label'
                  ? 'bg-white text-[#9A0602] shadow-xs font-bold'
                  : 'text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{t('format_shipping_label', 'Label Resi (Paket)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('invoice_a4')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                format === 'invoice_a4'
                  ? 'bg-white text-[#9A0602] shadow-xs font-bold'
                  : 'text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{t('format_invoice_a4', 'Faktur Resmi (A4)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('thermal_receipt')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                format === 'thermal_receipt'
                  ? 'bg-white text-[#9A0602] shadow-xs font-bold'
                  : 'text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{t('format_thermal_pos', 'Struk Kasir (80mm)')}</span>
            </button>
          </div>

          {/* Helpful PDF / Print instruction note */}
          <div className="flex items-start gap-2 bg-[#FFF9F9] border border-[#FECDCA] text-[#706866] text-[11px] p-2.5 rounded-xl leading-relaxed">
            <Info className="w-3.5 h-3.5 text-[#9A0602] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#1F1F1F]">Tips Cetak / PDF Bersih: </span>
              Pada dialog browser print, pilih <strong className="text-[#1F1F1F]">Save as PDF</strong> atau printer Anda. Di bagian <span className="underline">More settings</span>, hilangkan centang <strong className="text-[#1F1F1F]">"Headers and footers"</strong> agar nama website & tanggal tidak muncul di atas/bawah kertas.
            </div>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-[#F4F4F4] flex justify-center items-start">
          {/* ========================================================================= */}
          {/* 1. FORMAT: LABEL PENGIRIMAN (Standard Thermal 100x150mm / A6 Sticker) */}
          {/* ========================================================================= */}
          {format === 'shipping_label' && (
            <div
              id="printable-receipt"
              className="format-shipping-label w-full max-w-[100mm] bg-white text-[#000000] font-sans shadow-md rounded-md p-0 overflow-hidden border-2 border-black"
            >
              {/* Courier Header Bar */}
              <div className="bg-black text-white p-2.5 flex items-center justify-between border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-wider uppercase">{courierName}</span>
                  <span className="text-[11px] font-semibold bg-white/20 px-1.5 py-0.5 rounded tracking-wide">
                    {courierService}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                    isCOD ? 'bg-amber-400 text-black' : 'bg-white text-black'
                  }`}>
                    {isCOD ? `COD: ${formatRupiah(order.grandTotal)}` : 'NON-COD'}
                  </span>
                  <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded uppercase">
                    {order.shippingMethod === 'pickup' ? 'PICK-UP' : 'DROP-OFF'}
                  </span>
                </div>
              </div>

              {/* Barcode & Resi Box */}
              <div className="p-3 border-b-2 border-black text-center bg-white space-y-1">
                <BarcodeSvg code={resiNumber} />
                <div className="font-mono font-black text-base sm:text-lg tracking-widest text-black">
                  {resiNumber}
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-gray-700 px-1 pt-1 border-t border-dashed border-gray-300">
                  <span>No. Pesanan: #{order.orderNumber}</span>
                  <span>{formatDateIndo(order.createdAt)}</span>
                </div>
              </div>

              {/* Shipper & Consignee 2-Column Grid */}
              <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black text-[11px] leading-tight">
                {/* Consignee / Penerima */}
                <div className="p-2.5 space-y-1 bg-white">
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                    PENERIMA (KEPADA):
                  </div>
                  <div className="font-extrabold text-sm text-black">{order.customerName}</div>
                  <div className="font-mono font-bold text-black text-[11px]">{order.customerPhone}</div>
                  <div className="text-gray-800 text-[10px] leading-snug pt-0.5">
                    {order.customerAddress}
                  </div>
                  <div className="font-bold text-black text-[10px]">
                    {order.customerDistrict ? `${order.customerDistrict}, ` : ''}{order.customerCity} {order.customerPostalCode || ''}
                  </div>
                </div>

                {/* Shipper / Pengirim */}
                <div className="p-2.5 space-y-1 bg-white">
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                    PENGIRIM (DARI):
                  </div>
                  <div className="font-extrabold text-xs text-black">{store.name}</div>
                  <div className="font-mono text-black text-[10px]">{store.phoneWhatsApp || '-'}</div>
                  <div className="text-gray-800 text-[10px] leading-snug">
                    {store.city || 'Kota Toko'}
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono">
                    kroombox.id/{store.slug}
                  </div>
                </div>
              </div>

              {/* Shipping Notes (if provided) */}
              {order.notes && (
                <div className="p-2 border-b-2 border-black bg-gray-50 text-[10px] leading-snug">
                  <span className="font-bold text-black uppercase">Instruksi Pengiriman: </span>
                  <span className="italic text-gray-800">"{order.notes}"</span>
                </div>
              )}

              {/* Package Content & Specs */}
              <div className="p-2.5 border-b-2 border-black space-y-1.5 text-[10px] leading-tight">
                <div className="flex items-center justify-between font-bold border-b border-gray-200 pb-1">
                  <span>Berat: 1.0 Kg</span>
                  <span>Jml Barang: {order.items.reduce((acc, i) => acc + i.quantity, 0)} pcs</span>
                  <span>Ongkir: {formatRupiah(order.shippingCost)}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-gray-600 block mb-0.5 text-[9px]">Daftar Barang:</span>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-gray-900">
                        <span className="font-medium pr-2">
                          {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                        </span>
                        <span className="font-semibold shrink-0">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Total */}
              <div className="p-2 bg-black text-white flex items-center justify-between text-xs font-bold">
                <span>TOTAL DIBAYAR</span>
                <span className="text-sm tracking-wide">{formatRupiah(order.grandTotal)}</span>
              </div>

              {/* Scissors cutting guide for standard A4 paper prints */}
              <div className="text-center py-2 text-[9px] font-mono text-gray-500 border-t border-dashed border-gray-400 bg-white print:block">
                ✂ ---------------- Garis Potong Label Paket ---------------- ✂
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. FORMAT: FAKTUR PENJUALAN / INVOICE RESMI (Standar A4) */}
          {/* ========================================================================= */}
          {format === 'invoice_a4' && (
            <div
              id="printable-receipt"
              className="format-invoice-a4 w-full max-w-[195mm] bg-white text-black font-sans shadow-md rounded-md p-6 sm:p-8 space-y-6 border border-gray-200"
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">
                    {store.name}
                  </h1>
                  <p className="text-xs text-gray-600 mt-0.5">{store.city || 'Indonesia'}</p>
                  <p className="text-xs text-gray-600 font-mono">WA: {store.phoneWhatsApp || '-'}</p>
                  <p className="text-xs text-gray-500 font-mono">kroombox.id/{store.slug}</p>
                </div>

                <div className="text-right">
                  <div className="text-lg sm:text-xl font-black tracking-wider text-[#9A0602]">
                    FAKTUR PENJUALAN
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-800 mt-1">
                    NO: INV/{order.orderNumber}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tanggal: {formatDateIndo(order.createdAt)}
                  </div>
                  <div className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded border border-green-600 bg-green-50 text-green-700">
                    STATUS: {order.paymentStatus} ({order.paymentMethod})
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Grid */}
              <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-lg p-3.5 bg-gray-50/50 text-xs">
                <div>
                  <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
                    Ditagihkan Kepada:
                  </div>
                  <div className="font-extrabold text-sm text-black">{order.customerName}</div>
                  <div className="text-gray-700 font-mono">{order.customerPhone}</div>
                  <div className="text-gray-700 mt-1 leading-snug">{order.customerAddress}</div>
                  <div className="font-semibold text-gray-800">
                    {order.customerDistrict ? `${order.customerDistrict}, ` : ''}{order.customerCity} {order.customerPostalCode || ''}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
                    Detail Pengiriman:
                  </div>
                  <div className="font-bold text-black">
                    {courierName} ({courierService})
                  </div>
                  <div className="font-mono text-xs font-semibold text-black mt-0.5">
                    No. Resi: {resiNumber}
                  </div>
                  <div className="text-gray-700 mt-1">
                    Metode: {order.shippingMethod === 'pickup' ? 'Pick-up Kurir' : 'Drop-off Counter'}
                  </div>
                  {order.notes && (
                    <div className="text-[11px] italic text-gray-600 mt-1 bg-white p-1 rounded border border-gray-200">
                      Catatan: "{order.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-100 text-gray-800 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3 w-10">No</th>
                      <th className="py-2.5 px-3">Deskripsi Produk</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-black">{item.productName}</div>
                          {item.variantName && (
                            <div className="text-[10px] text-gray-500">Varian: {item.variantName}</div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{formatRupiah(item.price)}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-black">
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Breakdown & Stamp */}
              <div className="flex justify-between items-start pt-2 border-t-2 border-black">
                {/* Store Note & Authorized Stamp */}
                <div className="w-1/2 pr-4 space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-[11px] leading-relaxed">
                    <p className="font-bold text-gray-800">Syarat & Ketentuan Toko:</p>
                    <p>Barang yang telah dibeli dilindungi jaminan retur jika ditemukan cacat produksi maksimal 2x24 jam sejak paket diterima.</p>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Dokumen ini merupakan bukti transaksi yang sah dan diterbitkan secara elektronik oleh {store.name}.
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="w-1/2 pl-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-mono font-semibold">{formatRupiah(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim ({courierName})</span>
                    <span className="font-mono font-semibold">{formatRupiah(order.shippingCost)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Diskon Promosi</span>
                      <span className="font-mono">-{formatRupiah(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 text-black">
                    <span>TOTAL TAGIHAN</span>
                    <span className="font-mono">{formatRupiah(order.grandTotal)}</span>
                  </div>
                  <div className="text-right text-[10px] text-gray-500 pt-0.5">
                    Metode Pembayaran: <span className="font-bold text-black">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="pt-6 border-t border-dashed border-gray-300 text-center text-xs text-gray-500">
                Terima kasih atas pesanan Anda di <strong>{store.name}</strong> • Powered by Kroombox
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FORMAT: STRUK KASIR THERMAL (80mm Mini POS Style) */}
          {/* ========================================================================= */}
          {format === 'thermal_receipt' && (
            <div
              id="printable-receipt"
              className="format-thermal-receipt w-full max-w-[76mm] bg-white text-black font-mono text-[11px] shadow-md rounded-md p-3.5 space-y-2 border border-dashed border-gray-300 leading-snug"
            >
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
                <h2 className="text-sm font-bold tracking-tight text-black">{store.name}</h2>
                <p className="text-[10px] text-gray-600">{store.city}</p>
                <p className="text-[10px] text-gray-600">WA: {store.phoneWhatsApp || '-'}</p>
              </div>

              {/* Order Info */}
              <div className="text-[10px] space-y-0.5 py-1 border-b border-dashed border-black">
                <div className="flex justify-between">
                  <span>No: #{order.orderNumber}</span>
                  <span>{formatDateIndo(order.createdAt).slice(0, 11)}</span>
                </div>
                <div>Plg: {order.customerName} ({order.customerPhone})</div>
                <div>Kurir: {courierName} - {resiNumber}</div>
              </div>

              {/* Items */}
              <div className="py-1 border-b border-dashed border-black space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[10px]">
                    <div className="flex-1 pr-1">
                      <div>{item.quantity}x {item.productName}</div>
                      {item.variantName && <div className="text-[9px] text-gray-500">({item.variantName})</div>}
                    </div>
                    <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="py-1 border-b border-dashed border-black space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir</span>
                  <span>{formatRupiah(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                  <span>TOTAL</span>
                  <span>{formatRupiah(order.grandTotal)}</span>
                </div>
                <div className="text-center text-[9px] font-bold text-green-700 pt-0.5">
                  LUNAS ({order.paymentMethod})
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[9px] text-gray-500 space-y-0.5">
                <p>Terima kasih telah berbelanja!</p>
                <p>kroombox.id/{store.slug}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer Buttons */}
        <div className="p-3 sm:p-4 border-t border-[#EAEAEA] bg-white flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] font-semibold text-xs hover:bg-[#F7F7F7] transition cursor-pointer text-center"
          >
            {t('close', 'Tutup')}
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer text-center"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>
              {format === 'shipping_label'
                ? t('print_shipping_label', 'Cetak Label Resi Paket')
                : format === 'invoice_a4'
                ? t('print_invoice_a4', 'Cetak / Simpan PDF Faktur (A4)')
                : t('print_thermal_receipt', 'Cetak Struk Kasir')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
