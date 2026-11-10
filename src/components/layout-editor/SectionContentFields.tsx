import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { StoreSectionOptions } from '../../types';
import {
  DEFAULT_INGREDIENT_EYEBROW,
  DEFAULT_INGREDIENT_ITEMS,
  DEFAULT_SUSTAINABILITY_PILLARS,
  SustainabilityPillar,
} from '../../themes/sectionContent';

/**
 * Isian konten khusus untuk bagian yang memiliki daftar/field sendiri (di luar Judul &
 * Deskripsi umum): Bahan Baku Alami, Komitmen Keberlanjutan, dan Info Toko.
 */
interface SectionContentFieldsProps {
  sectionId: string;
  opts: StoreSectionOptions;
  onChange: (patch: Partial<StoreSectionOptions>) => void;
}

const inputClass =
  'w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E1E3E5] text-[12px] text-[#202223] focus:border-[#2C6ECB]';
const labelClass = 'text-[12px] font-bold text-[#202223]';
const MAX_LIST_ITEMS = 8;

const AddItemButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-[#C9CCCF] text-[12px] font-semibold text-[#2C6ECB] hover:bg-[#F1F8FF] disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <Plus className="w-3.5 h-3.5" /> {children}
  </button>
);

const RemoveItemButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="p-1.5 rounded-md text-[#8C9196] hover:text-[#D72C0D] hover:bg-[#FFF4F4] shrink-0"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

const IngredientStoryFields: React.FC<Omit<SectionContentFieldsProps, 'sectionId'>> = ({ opts, onChange }) => {
  const items: string[] = Array.isArray(opts.ingredients) ? opts.ingredients : DEFAULT_INGREDIENT_ITEMS;
  const setItems = (next: string[]) => onChange({ ingredients: next });

  return (
    <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
      <div className="space-y-1">
        <label className={labelClass}>Label Kecil di Atas Judul</label>
        <input
          type="text"
          value={opts.eyebrowText ?? DEFAULT_INGREDIENT_EYEBROW}
          onChange={(e) => onChange({ eyebrowText: e.target.value })}
          placeholder="Kosongkan untuk menyembunyikan"
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Daftar Bahan</label>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              type="text"
              value={item}
              onChange={(e) => setItems(items.map((it, i) => (i === index ? e.target.value : it)))}
              placeholder={`Bahan ${index + 1}`}
              className={inputClass}
            />
            <RemoveItemButton label={`Hapus bahan ${index + 1}`} onClick={() => setItems(items.filter((_, i) => i !== index))} />
          </div>
        ))}
        <AddItemButton onClick={() => setItems([...items, ''])} disabled={items.length >= MAX_LIST_ITEMS}>
          Tambah Bahan
        </AddItemButton>
      </div>
    </div>
  );
};

const SustainabilityFields: React.FC<Omit<SectionContentFieldsProps, 'sectionId'>> = ({ opts, onChange }) => {
  const pillars: SustainabilityPillar[] = Array.isArray(opts.features) ? opts.features : DEFAULT_SUSTAINABILITY_PILLARS;
  const setPillars = (next: SustainabilityPillar[]) => onChange({ features: next });
  const updatePillar = (index: number, patch: Partial<SustainabilityPillar>) =>
    setPillars(pillars.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
      <label className={labelClass}>Poin Komitmen</label>
      {pillars.map((pillar, index) => (
        <div key={index} className="p-2.5 rounded-lg bg-[#F6F6F7] border border-[#E1E3E5] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={pillar.title || ''}
              onChange={(e) => updatePillar(index, { title: e.target.value })}
              placeholder={`Judul poin ${index + 1}`}
              className={inputClass}
            />
            <RemoveItemButton label={`Hapus poin ${index + 1}`} onClick={() => setPillars(pillars.filter((_, i) => i !== index))} />
          </div>
          <textarea
            rows={2}
            value={pillar.desc || ''}
            onChange={(e) => updatePillar(index, { desc: e.target.value })}
            placeholder="Penjelasan singkat"
            className={inputClass}
          />
        </div>
      ))}
      <AddItemButton onClick={() => setPillars([...pillars, { title: '', desc: '' }])} disabled={pillars.length >= MAX_LIST_ITEMS}>
        Tambah Poin
      </AddItemButton>
    </div>
  );
};

const STORE_INFO_FIELDS: Array<{ key: string; label: string; placeholder: string; multiline?: boolean }> = [
  { key: 'address', label: 'Alamat', placeholder: 'Kosongkan untuk memakai alamat di Pengaturan Toko', multiline: true },
  { key: 'email', label: 'Email', placeholder: 'Kosongkan untuk memakai email toko' },
  { key: 'phone', label: 'Nomor WhatsApp / Telepon', placeholder: 'Contoh: 081234567890' },
  { key: 'openingHours', label: 'Jam Operasional', placeholder: 'Contoh: Setiap hari, 08:00 - 20:00 WIB' },
];

const StoreInfoFields: React.FC<Omit<SectionContentFieldsProps, 'sectionId'>> = ({ opts, onChange }) => (
  <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
    <label className={labelClass}>Detail Kontak</label>
    {STORE_INFO_FIELDS.map(({ key, label, placeholder, multiline }) => (
      <div key={key} className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">{label}</label>
        {multiline ? (
          <textarea rows={2} value={opts[key] ?? ''} onChange={(e) => onChange({ [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
        ) : (
          <input type="text" value={opts[key] ?? ''} onChange={(e) => onChange({ [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
        )}
      </div>
    ))}
    <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
      <span className="text-[12px] text-[#202223]">Tampilkan Tombol Chat WhatsApp</span>
      <input
        type="checkbox"
        checked={opts.showWhatsAppButton !== false}
        onChange={(e) => onChange({ showWhatsAppButton: e.target.checked })}
        className="w-4 h-4 accent-[#2C6ECB]"
      />
    </label>
  </div>
);

export const SectionContentFields: React.FC<SectionContentFieldsProps> = ({ sectionId, ...rest }) => {
  switch (sectionId) {
    case 'ingredient_story':
      return <IngredientStoryFields {...rest} />;
    case 'sustainability':
      return <SustainabilityFields {...rest} />;
    case 'store_info':
      return <StoreInfoFields {...rest} />;
    default:
      return null;
  }
};
