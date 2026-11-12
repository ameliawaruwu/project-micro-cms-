import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { useStoreChromeOptions } from './storeChrome';
import { Mail, Phone, MapPin, LogOut, Pencil, UserRound } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { customerService, CustomerInfo } from '../../services/customerService';

interface ProfilePageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  tab?: string;
  onNavigate?: (pageId: string) => void;
}

/**
 * Halaman profil pelanggan. Data disimpan di perangkat pelanggan (localStorage lewat
 * customerService) dan otomatis dipakai untuk mengisi form checkout berikutnya.
 */

const EMPTY_PROFILE: CustomerInfo = {
  name: '',
  phoneWhatsApp: '',
  email: '',
  province: '',
  city: '',
  district: '',
  postalCode: '',
  address: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = keyof Omit<CustomerInfo, 'notes'>;

const PROFILE_FIELDS: Array<{ key: FieldKey; label: string; maxLength: number; type?: string; multiline?: boolean; wide?: boolean }> = [
  { key: 'name', label: 'Nama Lengkap', maxLength: 100, wide: true },
  { key: 'phoneWhatsApp', label: 'Nomor WhatsApp', maxLength: 20, type: 'tel' },
  { key: 'email', label: 'Email', maxLength: 120, type: 'email' },
  { key: 'address', label: 'Alamat Lengkap', maxLength: 300, multiline: true, wide: true },
  { key: 'district', label: 'Kecamatan', maxLength: 80 },
  { key: 'city', label: 'Kota / Kabupaten', maxLength: 80 },
  { key: 'province', label: 'Provinsi', maxLength: 80 },
  { key: 'postalCode', label: 'Kode Pos', maxLength: 10 },
];

/** Rapikan isian (trim) dan kembalikan pesan error pertama bila tidak valid. */
function normalizeProfile(draft: CustomerInfo): { profile: CustomerInfo; error: string | null } {
  const profile = Object.fromEntries(
    Object.entries({ ...EMPTY_PROFILE, ...draft }).map(([key, value]) => [key, String(value ?? '').trim()]),
  ) as unknown as CustomerInfo;

  const phoneDigits = profile.phoneWhatsApp.replace(/\D/g, '');
  if (!profile.name) return { profile, error: 'Nama lengkap wajib diisi.' };
  if (phoneDigits.length < 8 || phoneDigits.length > 15) return { profile, error: 'Nomor WhatsApp harus berisi 8–15 digit.' };
  if (profile.email && !EMAIL_PATTERN.test(profile.email)) return { profile, error: 'Format email tidak valid.' };
  if (profile.postalCode && !/^\d{5}$/.test(profile.postalCode)) return { profile, error: 'Kode pos harus 5 digit angka.' };
  return { profile, error: null };
}

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]!.toUpperCase()).join('') || '?';
}

function formatAddress(profile: CustomerInfo): string {
  return [profile.address, profile.district, profile.city, profile.province, profile.postalCode].filter(Boolean).join(', ');
}

/** Gaya per tema; markup halaman tetap satu agar perilakunya sama di semua tema. */
interface ProfileSkin {
  page: string;
  container: string;
  title: string;
  card: string;
  muted: string;
  strong: string;
  input: string;
  label: string;
  primaryButton: string;
  secondaryButton: string;
  error: string;
  success: string;
  avatar: string;
}

const DEFAULT_SKIN: ProfileSkin = {
  page: 'pt-28 pb-24 bg-[var(--sf-subtle)] text-[var(--sf-text)] min-h-screen font-sans',
  container: 'max-w-3xl mx-auto px-6 space-y-6',
  title: 'text-3xl font-bold text-[var(--sf-text)]',
  card: 'bg-[var(--sf-card)] p-6 sm:p-8 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-sm space-y-6',
  muted: 'text-[var(--sf-muted)]',
  strong: 'text-[var(--sf-text)]',
  input: 'w-full px-3 py-2.5 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)] text-sm text-[var(--sf-text)] focus:outline-none focus:border-[var(--sf-primary)]',
  label: 'text-xs font-semibold text-[var(--sf-text-soft)]',
  primaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--sf-primary)] text-white font-bold text-xs rounded-[var(--sf-radius)] hover:opacity-90 transition',
  secondaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--sf-border)] text-[var(--sf-text-soft)] font-bold text-xs rounded-[var(--sf-radius)] hover:bg-[var(--sf-subtle)] transition',
  error: 'text-xs font-semibold text-red-600',
  success: 'text-xs font-semibold text-green-600',
  avatar: 'w-16 h-16 bg-[var(--sf-subtle)] rounded-full flex items-center justify-center font-bold text-xl text-[var(--sf-text-soft)] shrink-0',
};

const THEME_SKINS: Record<string, Partial<ProfileSkin>> = {
  bold: {
    page: 'pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black',
    container: 'max-w-4xl mx-auto px-6 space-y-8',
    title: 'text-5xl md:text-7xl font-black uppercase tracking-tighter',
    card: 'bg-white p-6 sm:p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6',
    muted: 'text-gray-700 font-bold',
    strong: 'text-black font-black uppercase',
    input: 'w-full px-3 py-2.5 bg-white border-4 border-black text-sm font-bold text-black focus:outline-none focus:bg-yellow-100',
    label: 'text-xs font-black uppercase text-black',
    primaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition',
    secondaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-black uppercase border-4 border-black hover:bg-[#FF0000] hover:text-white transition',
    error: 'text-sm font-black uppercase text-[#FF0000]',
    success: 'text-sm font-black uppercase text-green-700',
    avatar: 'w-16 h-16 bg-[#FF0000] border-4 border-black flex items-center justify-center font-black text-2xl text-white shrink-0',
  },
  futuristic: {
    page: 'pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono',
    container: 'max-w-4xl mx-auto px-6 space-y-8',
    title: 'text-4xl font-bold bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] bg-clip-text text-transparent',
    card: 'bg-slate-900/60 border border-[var(--sf-primary-border)] rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6',
    muted: 'text-slate-400',
    strong: 'text-[var(--sf-primary)] font-bold',
    input: 'w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-[var(--sf-primary-border)] text-sm text-white focus:outline-none focus:border-[var(--sf-primary)]',
    label: 'text-xs uppercase tracking-widest text-slate-400',
    primaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--sf-primary)] text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition',
    secondaryButton: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--sf-primary-border)] text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition',
    error: 'text-xs font-bold text-red-400',
    success: 'text-xs font-bold text-emerald-400',
    avatar: 'w-16 h-16 rounded-2xl bg-slate-950 border border-[var(--sf-primary-border)] flex items-center justify-center font-bold text-xl text-[var(--sf-primary)] shrink-0',
  },
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ themeData, themeId: propThemeId, store, tab, onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const liveStoreInfo = useCmsStore((state) => state.storeInfo);
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const storeName = liveStoreInfo?.name || store?.name || 'Toko Kami';
  const storeDesc = liveStoreInfo?.description || store?.description || '';

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  // Sama seperti halaman Keranjang/Login agar navbar & footer konsisten di semua halaman toko.
  const navbarBase = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    tagline: storeDesc,
    ...((headerSection as any)?.options || (headerSection as any)?.settings)
  };

  const footerBase = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    ...((footerSection as any)?.options || (footerSection as any)?.settings)
  };
  const { navbarOptions, footerOptions, isStickyHeader } = useStoreChromeOptions(navbarBase, footerBase);

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const skin: ProfileSkin = { ...DEFAULT_SKIN, ...THEME_SKINS[activeThemeId] };

  // Data dari localStorage dirapikan dulu (bisa saja diubah manual / format lama).
  const [profile, setProfile] = React.useState<CustomerInfo | null>(() => {
    const saved = customerService.getSavedInfo();
    if (!saved || typeof saved !== 'object') return null;
    const { profile: cleaned } = normalizeProfile(saved);
    return cleaned.name ? cleaned : null;
  });
  const [draft, setDraft] = React.useState<CustomerInfo>(() => ({ ...EMPTY_PROFILE, ...(profile ?? {}) }));
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const startEditing = () => {
    setDraft({ ...EMPTY_PROFILE, ...(profile ?? {}) });
    setError(null);
    setNotice(null);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { profile: next, error: validationError } = normalizeProfile(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      customerService.saveInfo({ ...next, notes: profile?.notes });
    } catch {
      setError('Profil gagal disimpan. Pastikan penyimpanan browser tidak diblokir.');
      return;
    }
    setProfile(next);
    setIsEditing(false);
    setError(null);
    setNotice('Profil berhasil disimpan.');
  };

  const handleLogout = () => {
    customerService.clearInfo();
    setProfile(null);
    setDraft(EMPTY_PROFILE);
    setIsEditing(false);
    setNotice(null);
    onNavigate?.('home');
  };

  const title = tab === 'address' ? 'Alamat Saya' : 'Profil Saya';

  const renderForm = () => (
    <form onSubmit={handleSave} className={skin.card} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROFILE_FIELDS.map(({ key, label, maxLength, type, multiline, wide }) => (
          <label key={key} className={`space-y-1.5 ${wide ? 'sm:col-span-2' : ''}`}>
            <span className={skin.label}>{label}</span>
            {multiline ? (
              <textarea
                rows={3}
                value={draft[key]}
                maxLength={maxLength}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className={skin.input}
              />
            ) : (
              <input
                type={type || 'text'}
                value={draft[key]}
                maxLength={maxLength}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className={skin.input}
              />
            )}
          </label>
        ))}
      </div>
      {error && <p role="alert" className={skin.error}>{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={skin.primaryButton}>Simpan Profil</button>
        {profile && (
          <button type="button" onClick={() => { setIsEditing(false); setError(null); }} className={skin.secondaryButton}>
            Batal
          </button>
        )}
      </div>
    </form>
  );

  const renderEmptyState = () => (
    <div className={`${skin.card} text-center`}>
      <div className={`${skin.avatar} mx-auto`}><UserRound className="w-7 h-7" /></div>
      <div className="space-y-2">
        <p className={`text-lg ${skin.strong}`}>Belum ada data profil</p>
        <p className={`text-sm ${skin.muted}`}>
          Lengkapi nama, nomor WhatsApp, dan alamat agar checkout berikutnya lebih cepat. Data hanya disimpan di perangkat ini.
        </p>
      </div>
      <button type="button" onClick={startEditing} className={skin.primaryButton}>
        <Pencil className="w-4 h-4" /> Lengkapi Profil
      </button>
    </div>
  );

  const renderProfile = (data: CustomerInfo) => {
    const fullAddress = formatAddress(data);
    return (
      <div className={skin.card}>
        <div className="flex items-center gap-4">
          <div className={skin.avatar}>{initialsOf(data.name)}</div>
          <div className="min-w-0">
            <h2 className={`text-xl break-words ${skin.strong}`}>{data.name}</h2>
            <p className={`text-xs ${skin.muted}`}>Pelanggan {storeName}</p>
          </div>
        </div>
        <div className={`space-y-3 text-sm ${skin.muted}`}>
          <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 shrink-0" /> <span className="break-all">{data.phoneWhatsApp}</span></div>
          {data.email && <div className="flex items-start gap-3"><Mail className="w-4 h-4 mt-0.5 shrink-0" /> <span className="break-all">{data.email}</span></div>}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="break-words">{fullAddress || 'Alamat belum diisi.'}</span>
          </div>
        </div>
        {notice && <p role="status" className={skin.success}>{notice}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={startEditing} className={skin.primaryButton}>
            <Pencil className="w-4 h-4" /> Edit Profil
          </button>
          <button type="button" onClick={handleLogout} className={skin.secondaryButton}>
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div className={skin.page}>
      <div className={skin.container}>
        <h1 className={skin.title}>{title}</h1>
        {isEditing ? renderForm() : profile ? renderProfile(profile) : renderEmptyState()}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--sf-page)] text-[var(--sf-text)]">
      {CustomNavbar ? (
        <div className={isStickyHeader ? 'sticky top-0 z-50' : undefined}>
          <CustomNavbar sectionOptions={navbarOptions} />
        </div>
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}

      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? (
        <CustomFooter sectionOptions={footerOptions} />
      ) : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
