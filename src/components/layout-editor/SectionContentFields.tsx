import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { StoreSectionOptions } from '../../types';
import {
  DEFAULT_INGREDIENT_EYEBROW,
  DEFAULT_INGREDIENT_ITEMS,
  DEFAULT_SUSTAINABILITY_PILLARS,
  SustainabilityPillar,
  defaultFeatureItems,
} from '../../themes/sectionContent';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Isian konten khusus untuk bagian yang memiliki daftar/field sendiri (di luar Judul &
 * Deskripsi umum): Bahan Baku Alami, Komitmen Keberlanjutan, Poin Keunggulan, dan Info Toko.
 */
interface SectionContentFieldsProps {
  sectionId: string;
  opts: StoreSectionOptions;
  onChange: (patch: Partial<StoreSectionOptions>) => void;
  /** Tema aktif (sudah dinormalisasi); poin bawaan berbeda per tema. */
  themeId?: string;
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
  const { isEn } = useLanguage();

  return (
    <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
      <div className="space-y-1">
        <label className={labelClass}>{isEn ? 'Small Label Above Title' : 'Label Kecil di Atas Judul'}</label>
        <input
          type="text"
          value={opts.eyebrowText ?? DEFAULT_INGREDIENT_EYEBROW}
          onChange={(e) => onChange({ eyebrowText: e.target.value })}
          placeholder={isEn ? 'Leave empty to hide' : 'Kosongkan untuk menyembunyikan'}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>{isEn ? 'Ingredient List' : 'Daftar Bahan'}</label>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              type="text"
              value={item}
              onChange={(e) => setItems(items.map((it, i) => (i === index ? e.target.value : it)))}
              placeholder={isEn ? `Ingredient ${index + 1}` : `Bahan ${index + 1}`}
              className={inputClass}
            />
            <RemoveItemButton label={isEn ? `Remove ingredient ${index + 1}` : `Hapus bahan ${index + 1}`} onClick={() => setItems(items.filter((_, i) => i !== index))} />
          </div>
        ))}
        <AddItemButton onClick={() => setItems([...items, ''])} disabled={items.length >= MAX_LIST_ITEMS}>
          {isEn ? 'Add Ingredient' : 'Tambah Bahan'}
        </AddItemButton>
      </div>
    </div>
  );
};

/** Daftar poin judul + penjelasan (opts.features): Komitmen Keberlanjutan & Poin Keunggulan. */
const FeatureListFields: React.FC<Omit<SectionContentFieldsProps, 'sectionId' | 'themeId'> & {
  defaults: SustainabilityPillar[];
  title: string;
  allowEmpty?: boolean;
}> = ({ opts, onChange, defaults, title, allowEmpty }) => {
  const saved = Array.isArray(opts.features) ? (opts.features as SustainabilityPillar[]) : null;
  // Poin keunggulan yang dikosongkan semua kembali ke bawaan di toko, jadi panel juga menampilkan bawaan.
  const pillars: SustainabilityPillar[] = saved && (allowEmpty || saved.length > 0) ? saved : defaults;
  const setPillars = (next: SustainabilityPillar[]) => onChange({ features: next });
  const updatePillar = (index: number, patch: Partial<SustainabilityPillar>) =>
    setPillars(pillars.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  const { isEn } = useLanguage();

  return (
    <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
      <label className={labelClass}>{title}</label>
      {pillars.map((pillar, index) => (
        <div key={index} className="p-2.5 rounded-lg bg-[#F6F6F7] border border-[#E1E3E5] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={pillar.title || ''}
              onChange={(e) => updatePillar(index, { title: e.target.value })}
              placeholder={isEn ? `Point title ${index + 1}` : `Judul poin ${index + 1}`}
              className={inputClass}
            />
            <RemoveItemButton label={isEn ? `Remove point ${index + 1}` : `Hapus poin ${index + 1}`} onClick={() => setPillars(pillars.filter((_, i) => i !== index))} />
          </div>
          <textarea
            rows={2}
            value={pillar.desc || ''}
            onChange={(e) => updatePillar(index, { desc: e.target.value })}
            placeholder={isEn ? 'Short description' : 'Penjelasan singkat'}
            className={inputClass}
          />
        </div>
      ))}
      <AddItemButton onClick={() => setPillars([...pillars, { title: '', desc: '' }])} disabled={pillars.length >= MAX_LIST_ITEMS}>
        {isEn ? 'Add Point' : 'Tambah Poin'}
      </AddItemButton>
    </div>
  );
};

const getStoreInfoFields = (isEn: boolean): Array<{ key: string; label: string; placeholder: string; multiline?: boolean }> => [
  { key: 'address', label: isEn ? 'Address' : 'Alamat', placeholder: isEn ? 'Leave empty to use the address in Store Settings' : 'Kosongkan untuk memakai alamat di Pengaturan Toko', multiline: true },
  { key: 'email', label: 'Email', placeholder: isEn ? 'Leave empty to use the store email' : 'Kosongkan untuk memakai email toko' },
  { key: 'phone', label: isEn ? 'WhatsApp / Phone Number' : 'Nomor WhatsApp / Telepon', placeholder: isEn ? 'Example: 081234567890' : 'Contoh: 081234567890' },
  { key: 'openingHours', label: isEn ? 'Opening Hours' : 'Jam Operasional', placeholder: isEn ? 'Example: Every day, 08:00 - 20:00 WIB' : 'Contoh: Setiap hari, 08:00 - 20:00 WIB' },
];

const StoreInfoFields: React.FC<Omit<SectionContentFieldsProps, 'sectionId'>> = ({ opts, onChange }) => {
  const { isEn } = useLanguage();
  return (
  <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
    <label className={labelClass}>{isEn ? 'Contact Details' : 'Detail Kontak'}</label>
    {getStoreInfoFields(isEn).map(({ key, label, placeholder, multiline }) => (
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
      <span className="text-[12px] text-[#202223]">{isEn ? 'Show WhatsApp Chat Button' : 'Tampilkan Tombol Chat WhatsApp'}</span>
      <input
        type="checkbox"
        checked={opts.showWhatsAppButton !== false}
        onChange={(e) => onChange({ showWhatsAppButton: e.target.checked })}
        className="w-4 h-4 accent-[#2C6ECB]"
      />
    </label>
  </div>
  );
};

export const SectionContentFields: React.FC<SectionContentFieldsProps> = ({ sectionId, themeId = '', ...rest }) => {
  const { isEn } = useLanguage();
  switch (sectionId) {
    case 'ingredient_story':
      return <IngredientStoryFields {...rest} />;
    case 'sustainability':
      return (
        <FeatureListFields
          {...rest}
          defaults={DEFAULT_SUSTAINABILITY_PILLARS}
          title={isEn ? 'Commitment Points' : 'Poin Komitmen'}
          allowEmpty
        />
      );
    case 'tech_features':
    case 'store_benefits':
      return (
        <FeatureListFields
          {...rest}
          defaults={defaultFeatureItems(sectionId, themeId, isEn) || []}
          title={isEn ? 'Benefit Points' : 'Poin Keunggulan'}
        />
      );
    case 'store_info':
      return <StoreInfoFields {...rest} />;
    default:
      return null;
  }
};
