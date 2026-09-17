import React from 'react';
import {
  Palette,
  ChevronLeft,
  Type,
  Layout,
  MousePointer2,
  Box,
  Check,
} from 'lucide-react';
import { GlobalThemeSettings } from '../../types';

interface GlobalThemeSettingsPanelProps {
  settings: GlobalThemeSettings;
  onUpdate: (newSettings: Partial<GlobalThemeSettings>) => void;
  onClose?: () => void;
}

export const GlobalThemeSettingsPanel: React.FC<GlobalThemeSettingsPanelProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  const updateColors = (newColors: Partial<GlobalThemeSettings['colors']>) => {
    onUpdate({ colors: { ...settings.colors, ...newColors } });
  };

  const updateTypography = (newTypography: Partial<GlobalThemeSettings['typography']>) => {
    onUpdate({ typography: { ...settings.typography, ...newTypography } });
  };

  const updateButtons = (newButtons: Partial<GlobalThemeSettings['buttons']>) => {
    onUpdate({ buttons: { ...settings.buttons, ...newButtons } });
  };

  return (
    <aside className="w-full lg:w-[320px] bg-white border-l border-[#E1E3E5] flex flex-col h-full shrink-0 font-sans shadow-2xs select-none">
      {/* ── HEADER ── */}
      <div className="px-3 pt-3 pb-3 border-b border-[#E1E3E5] bg-white shrink-0">
        <div className="flex items-center min-w-0 gap-1.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#8C9196] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-[14px] font-bold text-[#202223] truncate flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#2C6ECB]" />
            Pengaturan Tema Global
          </h2>
        </div>
      </div>

      {/* ── SETTINGS LIST ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* Colors Group */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-bold text-[#202223] uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#8C9196]" /> Warna
          </h3>
          <div className="space-y-2">
            <ColorPickerItem label="Warna Utama" value={settings.colors.primary} onChange={(val) => updateColors({ primary: val })} />
            <ColorPickerItem label="Warna Sekunder" value={settings.colors.secondary} onChange={(val) => updateColors({ secondary: val })} />
            <ColorPickerItem label="Latar Belakang" value={settings.colors.background} onChange={(val) => updateColors({ background: val })} />
            <ColorPickerItem label="Teks Utama" value={settings.colors.text} onChange={(val) => updateColors({ text: val })} />
          </div>
        </div>

        {/* Typography Group */}
        <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
          <h3 className="text-[12px] font-bold text-[#202223] uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#8C9196]" /> Tipografi
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#6D7175]">Font Heading</label>
              <select
                value={settings.typography.headingFont}
                onChange={(e) => updateTypography({ headingFont: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] bg-white text-[13px] text-[#202223]"
              >
                <option value="Inter">Inter (Modern)</option>
                <option value="Space Grotesk">Space Grotesk (Tech)</option>
                <option value="Cormorant Garamond">Cormorant (Elegant)</option>
                <option value="Anton">Anton (Bold)</option>
                <option value="Lora">Lora (Editorial)</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#6D7175]">Font Tubuh</label>
              <select
                value={settings.typography.bodyFont}
                onChange={(e) => updateTypography({ bodyFont: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] bg-white text-[13px] text-[#202223]"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Group */}
        <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
          <h3 className="text-[12px] font-bold text-[#202223] uppercase tracking-wider flex items-center gap-1.5">
            <MousePointer2 className="w-3.5 h-3.5 text-[#8C9196]" /> Tombol
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#6D7175]">Sudut Tombol (Radius)</label>
              <div className="flex bg-[#F6F6F7] p-1 rounded-lg border border-[#E1E3E5]">
                {['none', 'sm', 'md', 'full'].map(radius => (
                  <button
                    key={radius}
                    onClick={() => updateButtons({ radius: radius as any })}
                    className={`flex-1 py-1 flex items-center justify-center rounded-md transition ${
                      settings.buttons.radius === radius
                        ? 'bg-white shadow-sm font-semibold text-[#202223]'
                        : 'text-[#6D7175] hover:text-[#202223]'
                    }`}
                  >
                    {radius === 'none' ? 'Kotak' : radius === 'sm' ? 'Kecil' : radius === 'md' ? 'Bulat' : 'Pill'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

const ColorPickerItem = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-[#E1E3E5] bg-white">
      <span className="text-[12px] font-semibold text-[#202223]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#8C9196] uppercase">{value}</span>
        <label className="w-6 h-6 rounded cursor-pointer border border-[#E1E3E5] shadow-sm relative overflow-hidden" style={{ backgroundColor: value }}>
          <input 
            type="color" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
