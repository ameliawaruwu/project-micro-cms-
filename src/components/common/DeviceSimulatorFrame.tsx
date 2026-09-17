import React from 'react';
import { Smartphone, Globe, X } from 'lucide-react';

interface DeviceSimulatorFrameProps {
  title?: string;
  urlPath?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({
  title = 'Mobile Preview',
  urlPath = 'kroomify.id/toko-batik',
  onClose,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-6 px-4 bg-black/80 backdrop-blur-md font-sans">
      {/* Device frame header */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between text-white/90 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Smartphone className="w-4 h-4 text-[#9A0602]" />
          <span>{title} (Simulator HP)</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-xl transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Tutup Simulator</span>
          </button>
        )}
      </div>

      {/* Phone Shell */}
      <div className="relative w-full max-w-[400px] h-[780px] bg-[#1F1F1F] rounded-[48px] p-3.5 shadow-2xl ring-1 ring-white/20 border-4 border-[#2B2B2B] flex flex-col overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-[#9A0602]/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2B2B2B] border border-[#3E3E3E]"></div>
        </div>

        {/* Browser URL Bar inside simulator if storefront */}
        {urlPath && (
          <div className="pt-8 pb-2 px-3 bg-white border-b border-[#EAEAEA] flex items-center gap-2 shrink-0 z-40 rounded-t-[36px]">
            <div className="flex-1 bg-[#F7F7F7] rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] text-[#555555] font-mono">
              <Globe className="w-3 h-3 text-[#9A0602]" />
              <span className="truncate">{urlPath}</span>
            </div>
          </div>
        )}

        {/* Simulator Screen Content */}
        <div className={`flex-1 overflow-y-auto bg-[#FEFEFE] custom-scrollbar relative ${!urlPath ? 'pt-7 rounded-t-[36px]' : ''} rounded-b-[36px]`}>
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="w-32 h-1 bg-white/40 rounded-full mx-auto my-1.5 shrink-0"></div>
      </div>
    </div>
  );
};

