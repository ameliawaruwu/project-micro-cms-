import React, { useState, useEffect } from 'react';
import {
  Truck,
  Building2,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ShippingBranch, BiteshipRateOption, CourierType } from '../../types';
import { branchService } from '../../services/branchService';
import { shippingService } from '../../services/shippingService';
import { formatRupiah } from '../../utils/formatters';

interface CourierSelectorProps {
  storeId?: string;
  destinationPostalCode: string;
  weightGrams?: number;
  selectedBranchId?: string;
  selectedCourierCode?: string;
  selectedServiceCode?: string;
  onRateSelect: (rate: BiteshipRateOption, branch: ShippingBranch) => void;
  onBranchChange?: (branch: ShippingBranch) => void;
  showBranchDropdown?: boolean;
}

export const CourierSelector: React.FC<CourierSelectorProps> = ({
  storeId = 'store-andhika',
  destinationPostalCode,
  weightGrams = 500,
  selectedBranchId,
  selectedCourierCode,
  selectedServiceCode,
  onRateSelect,
  onBranchChange,
  showBranchDropdown = true,
}) => {
  const [branches, setBranches] = useState<ShippingBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<ShippingBranch | null>(null);
  const [rates, setRates] = useState<BiteshipRateOption[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<BiteshipRateOption | null>(null);
  const [rateError, setRateError] = useState('');

  // 1. Muat cabang-cabang yang tersedia
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList = await branchService.getBranches(storeId);
        const activeBranches = branchList.filter((b) => b.isActive);
        setBranches(activeBranches);

        const initialBranch = selectedBranchId
          ? activeBranches.find((b) => b.id === selectedBranchId)
          : activeBranches.find((b) => b.isDefault) || activeBranches[0];

        if (initialBranch) {
          setCurrentBranch(initialBranch);
          if (onBranchChange) onBranchChange(initialBranch);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    };

    fetchBranches();
  }, [storeId, selectedBranchId]);

  // 2. Fetch tarif kurir dinamis saat cabang atau kode pos tujuan berubah
  useEffect(() => {
    const fetchRates = async () => {
      if (!currentBranch) return;

      const destCode = destinationPostalCode ? destinationPostalCode.trim() : '12190';
      setIsLoadingRates(true);
      setRateError('');

      try {
        const result = await shippingService.checkBiteshipRates({
          branchId: currentBranch.id,
          destinationPostalCode: destCode,
          weight: weightGrams,
          couriers: 'jnt,jne,sicepat',
        });

        setRates(result.rates);

        // Pilih rate default atau yang cocok
        if (result.rates.length > 0) {
          let match = result.rates.find(
            (r) =>
              (!selectedCourierCode || r.courier_code.toLowerCase() === selectedCourierCode.toLowerCase()) &&
              (!selectedServiceCode || r.courier_service_code.toLowerCase() === selectedServiceCode.toLowerCase())
          );

          if (!match) {
            match = result.rates[0];
          }

          setSelectedRate(match);
          onRateSelect(match, currentBranch);
        }
      } catch (err: any) {
        setRateError('Gagal memuat tarif kurir otomatis.');
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
  }, [currentBranch?.id, destinationPostalCode, weightGrams]);

  const handleBranchSelect = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      if (onBranchChange) onBranchChange(branch);
    }
  };

  const handleRateClick = (rate: BiteshipRateOption) => {
    setSelectedRate(rate);
    if (currentBranch) {
      onRateSelect(rate, currentBranch);
    }
  };

  const getCourierLogoBadge = (courierCode: string) => {
    switch (courierCode.toLowerCase()) {
      case 'jnt':
        return { label: 'J&T', bg: 'bg-red-600 text-white' };
      case 'jne':
        return { label: 'JNE', bg: 'bg-blue-600 text-white' };
      case 'sicepat':
        return { label: 'SiCepat', bg: 'bg-red-700 text-white' };
      case 'gosend':
        return { label: 'GoSend', bg: 'bg-emerald-600 text-white' };
      default:
        return { label: courierCode.toUpperCase(), bg: 'bg-zinc-800 text-white' };
    }
  };

  return (
    <div className="space-y-3 font-poppins text-left">
      {/* 1. Origin Branch Dropdown Selector */}
      {showBranchDropdown && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-[#1F1F1F] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#66000E]" />
              <span>Cabang / Gudang Asal Pengiriman</span>
            </label>
            {currentBranch?.isDefault && (
              <span className="text-[10px] font-semibold text-[#66000E] bg-[#F5E8EA] px-2 py-0.5 rounded-full border border-[#E8DDDE]">
                Cabang Utama
              </span>
            )}
          </div>

          <div className="relative">
            <select
              value={currentBranch?.id || ''}
              onChange={(e) => handleBranchSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName} — {b.city} (Kode Pos: {b.postalCode}) {b.isDefault ? '★ Utama' : ''}
                </option>
              ))}
            </select>
          </div>

          {currentBranch && (
            <div className="flex items-start gap-1 text-[11px] text-[#777777] pl-1">
              <MapPin className="w-3 h-3 text-[#66000E] shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                {currentBranch.address}, {currentBranch.city} • PIC: {currentBranch.picName} ({currentBranch.picPhone})
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Courier Rates Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1F1F1F] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Pilihan Kurir & Layanan Pengiriman</span>
          </span>
          {isLoadingRates && (
            <span className="flex items-center gap-1 text-[11px] text-[#66000E] font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Menghitung ongkir...
            </span>
          )}
        </div>

        {rateError && (
          <div className="p-2.5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{rateError}</span>
          </div>
        )}

        {/* Skeleton Loader saat Tarif Dihitung Ulang via Edge Function */}
        {isLoadingRates ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-2xl border border-[#E5E0DD] bg-white animate-pulse flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                  <div className="w-12 h-5 rounded bg-gray-200"></div>
                  <div className="space-y-1.5">
                    <div className="w-36 h-3.5 rounded bg-gray-200"></div>
                    <div className="w-24 h-2.5 rounded bg-gray-100"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="w-16 h-4 rounded bg-gray-200 ml-auto"></div>
                  <div className="w-10 h-2.5 rounded bg-gray-100 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Radio Cards Kurir */
          <div className="space-y-2">
            {rates.map((rate) => {
              const isSelected =
                selectedRate?.courier_code === rate.courier_code &&
                selectedRate?.courier_service_code === rate.courier_service_code;
              const logo = getCourierLogoBadge(rate.courier_code);

            return (
              <div
                key={`${rate.courier_code}-${rate.courier_service_code}`}
                onClick={() => handleRateClick(rate)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#66000E] bg-[#F5E8EA] shadow-xs ring-1 ring-[#66000E]/20'
                    : 'border-[#E5E0DD] bg-white hover:border-[#CCCCCC] hover:bg-[#FAFAFA]'
                }`}
              >
                {/* Left: Radio & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Custom Radio Circle */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      isSelected ? 'border-[#66000E] bg-[#66000E]' : 'border-[#CCCCCC] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>

                  {/* Courier Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${logo.bg}`}
                  >
                    {logo.label}
                  </span>

                  {/* Service & ETD */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[#1F1F1F] truncate">
                        {rate.courier_name} - {rate.courier_service_name}
                      </span>
                      {rate.badge && (
                        <span className="text-[9px] font-semibold bg-[#F5E8EA] text-[#66000E] px-1.5 py-0.2 rounded-md">
                          {rate.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#777777] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Estimasi: {rate.etd}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs sm:text-sm text-[#1F1F1F]">
                    {formatRupiah(rate.price)}
                  </span>
                  <span className="block text-[10px] text-[#777777]">
                    {rate.tier === 'express' ? 'Kilat' : 'Reguler'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
