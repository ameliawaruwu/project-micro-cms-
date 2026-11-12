import React, { useState } from 'react';
import { X, Truck, Send } from 'lucide-react';
import { Order, CourierType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProcessShippingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmShipping: (orderId: string, courier: CourierType, resiNumber: string) => void;
}

export const ProcessShippingModal: React.FC<ProcessShippingModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmShipping,
}) => {
  const { t } = useLanguage();
  const [selectedCourier, setSelectedCourier] = useState<CourierType>(order?.courier || 'J&T');
  const [resiNumber, setResiNumber] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen || !order) return null;

  const couriers: { id: CourierType; name: string; estimate: string; badge: string }[] = [
    { id: 'J&T', name: 'J&T Express', estimate: 'Pick-up otomatis ke toko', badge: 'Auto Pick-up' },
    { id: 'JNE', name: 'JNE Logistics', estimate: 'Drop di agen terdekat', badge: 'Jaringan Luas' },
    { id: 'SiCepat', name: 'SiCepat Ekspres', estimate: 'Pick-up kurir gratis', badge: 'Cepat' },
    { id: 'GoSend', name: 'GoSend Instant', estimate: 'Driver motor datang 15 mnt', badge: 'Instant 1 Jam' },
  ];

  const handleGenerateResi = () => {
    const randomResi = `${selectedCourier.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setResiNumber(randomResi);
    setIsGenerated(true);
  };

  const handleConfirm = () => {
    const finalResi = resiNumber || `${selectedCourier.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    onConfirmShipping(order.id, selectedCourier, finalResi);
    onClose();
  };

  return (
    <div id="modal-process-shipping" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-poppins">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-[#E5E0DD] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0DD]">
          <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
            <Truck className="w-5 h-5 text-[#66000E]" />
            <span>{t('process_shipping_title', 'Proses Pengiriman Paket')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Order Snapshot */}
          <div className="p-3.5 bg-[#F7F7F7] rounded-xl border border-[#E5E0DD] text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#1F1F1F]">{order.orderNumber}</span>
              <span className="font-semibold text-[#555555]">{order.customerName}</span>
            </div>
            <p className="text-[#777777] line-clamp-1">{order.customerAddress}, {order.customerCity}</p>
          </div>

          {/* Courier Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-2">
              {t('select_courier', 'Pilih Ekspedisi / Kurir')}
            </label>
            <div className="space-y-2">
              {couriers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCourier(c.id);
                    if (isGenerated) {
                      setResiNumber(`${c.id.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                    }
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    selectedCourier === c.id
                      ? 'border-[#66000E] bg-[#F5E8EA]'
                      : 'border-[#E5E0DD] hover:border-[#CCCCCC] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedCourier === c.id ? 'border-[#66000E] bg-[#66000E]' : 'border-[#CCCCCC]'
                    }`}>
                      {selectedCourier === c.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1F1F1F] text-xs">{c.name}</span>
                      <span className="text-[11px] text-[#777777] block">{c.estimate}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F7F7] text-[#555555] border border-[#E5E0DD]">
                    {c.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resi Number generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
                {t('resi_number_label', 'Nomor Resi / AWB')}
              </label>
              <button
                type="button"
                onClick={handleGenerateResi}
                className="text-[11px] font-semibold text-[#66000E] hover:underline cursor-pointer"
              >
                {t('auto_generate_resi', '+ Buat Resi Otomatis')}
              </button>
            </div>
            <input
              type="text"
              placeholder="Contoh: JT8891029312"
              value={resiNumber}
              onChange={(e) => setResiNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-mono font-semibold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
            />
            <p className="text-[11px] text-[#777777] mt-1">
              {t('resi_desc', 'Nomor resi akan otomatis terhubung ke halaman pelacakan status pesanan.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E5E0DD] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
          >
            {t('cancel', 'Batal')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-5 py-2.5 min-h-[40px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t('send_and_update_resi', 'Kirim & Update Resi')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

