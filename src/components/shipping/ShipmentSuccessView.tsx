import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Printer,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Order, ShippingBranch, CreateShipmentResult } from '../../types';
import { ShipmentThermalLabel } from './ShipmentThermalLabel';

interface ShipmentSuccessViewProps {
  order: Order;
  shipmentResult: CreateShipmentResult;
  showThermalPreview: boolean;
  setShowThermalPreview: (val: boolean) => void;
  dynamicCourierName: string;
  dynamicServiceName: string;
  deliveryType: 'drop_off' | 'pickup';
  selectedBranch: ShippingBranch | null;
  isCopiedResi: boolean;
  handleCopyResi: () => void;
  handlePrintLabel: () => void;
  onClose: () => void;
}

export const ShipmentSuccessView: React.FC<ShipmentSuccessViewProps> = ({
  order,
  shipmentResult,
  showThermalPreview,
  setShowThermalPreview,
  dynamicCourierName,
  dynamicServiceName,
  deliveryType,
  selectedBranch,
  isCopiedResi,
  handleCopyResi,
  handlePrintLabel,
  onClose,
}) => {
  if (showThermalPreview) {
    return (
      <div className="space-y-4">
        {/* Navigasi Kontrol Preview */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EAEAEA] print:hidden">
          <button
            onClick={() => setShowThermalPreview(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Resi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintLabel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8DDDE] bg-[#F5E8EA] text-[#66000E] hover:bg-[#F9EDEF] font-semibold text-xs transition cursor-pointer"
              title="Buka Pelacakan Online Biteship"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lacak Biteship</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label Thermal</span>
            </button>
          </div>
        </div>

        {/* Printable Area Label Thermal 10x15 cm (A6) */}
        <ShipmentThermalLabel
          order={order}
          dynamicCourierName={dynamicCourierName}
          dynamicServiceName={dynamicServiceName}
          deliveryType={deliveryType}
          trackingNumber={shipmentResult.tracking_number}
          selectedBranch={selectedBranch}
        />
      </div>
    );
  }

  return (
    <div className="p-5 bg-[#FBFDFB] border border-[#ABEFC6] rounded-2xl space-y-4 text-center font-poppins">
      <div className="w-12 h-12 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <div>
        <h4 className="font-bold text-sm text-[#1F1F1F]">Pengiriman Berhasil Diatur!</h4>
        <p className="text-[#555555] text-xs mt-0.5">
          {deliveryType === 'pickup'
            ? `Kurir ${dynamicCourierName} akan menjemput paket sesuai jadwal ke alamat gudang asal Anda.`
            : `Paket siap diantar ke counter gerai ${dynamicCourierName} terdekat.`}
        </p>
      </div>

      {/* Box Nomor Resi */}
      <div className="p-4 bg-white rounded-xl border border-[#E5E0DD] shadow-2xs space-y-2 text-left">
        <div className="flex items-center justify-between text-[#777777]">
          <span className="text-[11px] font-semibold">
            Nomor Resi / AWB ({dynamicCourierName} - {dynamicServiceName})
          </span>
          <span className="text-[10px] uppercase font-bold bg-[#F5E8EA] text-[#66000E] px-2 py-0.5 rounded">
            Biteship Verified
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-mono font-bold text-[#1F1F1F] tracking-wide">
            {shipmentResult.tracking_number}
          </span>
          <button
            onClick={handleCopyResi}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#1F1F1F] font-semibold text-xs transition cursor-pointer"
          >
            {isCopiedResi ? <Check className="w-3.5 h-3.5 text-[#027A48]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopiedResi ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>

        {/* Mock Barcode Graphic */}
        <div className="pt-2 border-t border-[#F0F0F0] flex flex-col items-center">
          <div className="h-9 w-48 flex items-stretch gap-0.5 justify-center py-1 opacity-80">
            {[1, 3, 2, 4, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2].map((w, i) => (
              <div
                key={i}
                className={`bg-zinc-800 h-full ${w === 1 ? 'w-0.5' : w === 2 ? 'w-1' : w === 3 ? 'w-1.5' : 'w-2'}`}
              ></div>
            ))}
          </div>
          <span className="text-[10px] font-mono text-[#777777]">{shipmentResult.tracking_number}</span>
        </div>
      </div>

      {/* Action Buttons Cetak PDF & Thermal */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
        <button
          onClick={handlePrintLabel}
          className="w-full sm:flex-1 py-2.5 px-3.5 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Cetak Label Pengiriman (PDF)</span>
        </button>

        <button
          onClick={() => setShowThermalPreview(true)}
          className="w-full sm:flex-1 py-2.5 px-3.5 rounded-xl border border-[#66000E] text-[#66000E] hover:bg-[#F5E8EA] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Pratinjau & Cetak Label Thermal</span>
        </button>

        <button
          onClick={() => {
            setShowThermalPreview(false);
            onClose();
          }}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#EAEAEA] text-[#555555] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
