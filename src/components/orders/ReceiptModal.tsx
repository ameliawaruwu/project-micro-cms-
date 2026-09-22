import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Tag,
  Receipt,
  Info,
} from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ShippingLabelView } from './receipt/ShippingLabelView';
import { InvoiceA4View } from './receipt/InvoiceA4View';
import { ThermalReceiptView } from './receipt/ThermalReceiptView';

interface ReceiptModalProps {
  order: Order | null;
  store: StoreType;
  isOpen: boolean;
  onClose: () => void;
}

type PrintFormat = 'shipping_label' | 'invoice_a4' | 'thermal_receipt';

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
        <div className="p-4 border-b border-[#E5E0DD] print:hidden shrink-0 space-y-3 bg-[#FAFAFA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-sm sm:text-base">
              <Printer className="w-4 h-4 text-[#66000E]" />
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
                  ? 'bg-white text-[#66000E] shadow-xs font-bold'
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
                  ? 'bg-white text-[#66000E] shadow-xs font-bold'
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
                  ? 'bg-white text-[#66000E] shadow-xs font-bold'
                  : 'text-[#555555] hover:text-[#1F1F1F]'
              }`}
            >
              <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{t('format_thermal_pos', 'Struk Kasir (80mm)')}</span>
            </button>
          </div>

          {/* Helpful PDF / Print instruction note */}
          <div className="flex items-start gap-2 bg-[#F5E8EA] border border-[#E8DDDE] text-[#706866] text-[11px] p-2.5 rounded-xl leading-relaxed">
            <Info className="w-3.5 h-3.5 text-[#66000E] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#1F1F1F]">{t('receipt_tips_title', 'Tips Cetak / PDF Bersih: ')}</span>
              {t('receipt_tips_desc', 'Pada dialog browser print, pilih Save as PDF atau printer Anda. Di bagian More settings, hilangkan centang "Headers and footers" agar nama website & tanggal tidak muncul di atas/bawah kertas.')}
            </div>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-[#F4F4F4] flex justify-center items-start">
          {format === 'shipping_label' && (
            <ShippingLabelView
              order={order}
              store={store}
              courierName={courierName}
              courierService={courierService}
              resiNumber={resiNumber}
              isCOD={isCOD}
            />
          )}

          {format === 'invoice_a4' && (
            <InvoiceA4View
              order={order}
              store={store}
              courierName={courierName}
              courierService={courierService}
              resiNumber={resiNumber}
            />
          )}

          {format === 'thermal_receipt' && (
            <ThermalReceiptView
              order={order}
              store={store}
              courierName={courierName}
              resiNumber={resiNumber}
            />
          )}
        </div>

        {/* Action Footer Buttons */}
        <div className="p-3 sm:p-4 border-t border-[#E5E0DD] bg-white flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#555555] hover:text-[#1F1F1F] font-semibold text-xs hover:bg-[#F7F7F7] transition cursor-pointer text-center"
          >
            {t('close', 'Tutup')}
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[40px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer text-center"
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
