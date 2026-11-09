import React from 'react';
import { ShieldCheck, Truck, CreditCard, MapPin, Mail } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { getStorefrontThemeVars } from '../pages/storefrontTheme';

/**
 * Bagian umum (Pengumuman, Banner Promo, Keunggulan Toko, Info Toko) yang bisa ditambahkan
 * merchant lewat "Tambah Bagian" di tema mana pun. Warna, sudut, dan font diambil dari
 * palet tema induk (`--sf-*`) sehingga bagian baru menyatu dengan template, bukan memakai
 * desain bawaan LapakQ.
 */
interface ThemedBlockProps {
  sectionOptions?: any;
  themeId?: string;
  accentColor?: string;
}

const ThemeScope: React.FC<{ themeId?: string; accentColor?: string; className?: string; children: React.ReactNode }> = ({
  themeId,
  accentColor,
  className = '',
  children,
}) => (
  <section className={`w-full ${className}`} style={getStorefrontThemeVars(themeId, accentColor)}>
    {children}
  </section>
);

export const ThemedAnnouncement: React.FC<ThemedBlockProps> = ({ sectionOptions = {}, themeId, accentColor }) => {
  const text = sectionOptions.announcementText || 'Selamat datang di toko kami — pengiriman ke seluruh Indonesia';
  return (
    <ThemeScope themeId={themeId} accentColor={accentColor}>
      <div className="w-full px-4 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide bg-[var(--sf-primary)] text-[var(--sf-primary-contrast)]">
        <p className="max-w-5xl mx-auto line-clamp-2 sm:truncate">{text}</p>
      </div>
    </ThemeScope>
  );
};

export const ThemedPromoBanner: React.FC<ThemedBlockProps> = ({ sectionOptions = {}, themeId, accentColor }) => {
  const badge = sectionOptions.discountBadge;
  const heading = sectionOptions.heading || 'Penawaran Spesial';
  const description = sectionOptions.description || '';
  const buttonLabel = sectionOptions.buttonLabel || 'Lihat Katalog';
  const buttonLink = sectionOptions.buttonLink || '#katalog';
  return (
    <ThemeScope themeId={themeId} accentColor={accentColor} className="bg-[var(--sf-page)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-[var(--sf-radius)] bg-[var(--sf-primary-soft)] border border-[var(--sf-primary-border)] px-6 py-10 sm:px-12 sm:py-14 text-center flex flex-col items-center gap-3 sm:gap-4">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-[var(--sf-primary)] text-[var(--sf-primary-contrast)]">
              {badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--sf-text)] max-w-2xl break-words">{heading}</h2>
          {description && <p className="text-sm sm:text-base text-[var(--sf-text-soft)] max-w-xl">{description}</p>}
          <a
            href={buttonLink}
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-[var(--sf-radius)] text-sm font-semibold bg-[var(--sf-primary)] text-[var(--sf-primary-contrast)] hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </ThemeScope>
  );
};

const BENEFITS = [
  { icon: ShieldCheck, title: 'Produk Terjamin', desc: 'Produk dicek sebelum dikirim' },
  { icon: Truck, title: 'Pengiriman Aman', desc: 'Dikemas rapi ke seluruh Indonesia' },
  { icon: CreditCard, title: 'Pembayaran Mudah', desc: 'Transfer, QRIS, atau COD' },
];

export const ThemedStoreBenefits: React.FC<ThemedBlockProps> = ({ sectionOptions = {}, themeId, accentColor }) => {
  const heading = sectionOptions.heading || 'Mengapa Belanja di Toko Kami?';
  return (
    <ThemeScope themeId={themeId} accentColor={accentColor} className="bg-[var(--sf-page)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {heading && (
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-center text-[var(--sf-text)] mb-6 sm:mb-10">{heading}</h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 p-4 sm:p-6 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center bg-[var(--sf-primary-soft)] text-[var(--sf-primary)]">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-[var(--sf-text)]">{title}</h3>
                <p className="text-xs sm:text-sm text-[var(--sf-text-soft)] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ThemeScope>
  );
};

export const ThemedStoreInfo: React.FC<ThemedBlockProps> = ({ sectionOptions = {}, themeId, accentColor }) => {
  const storeInfo = useCmsStore((s) => s.storeInfo);
  const heading = sectionOptions.heading || 'Kunjungi & Hubungi Toko Kami';
  const address = storeInfo?.address;
  const email = storeInfo?.email;
  if (!address && !email) {
    return (
      <ThemeScope themeId={themeId} accentColor={accentColor} className="bg-[var(--sf-page)]">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--sf-text)]">{heading}</h2>
          <p className="text-sm text-[var(--sf-muted)] mt-2">Lengkapi alamat & email toko di Pengaturan Toko agar tampil di sini.</p>
        </div>
      </ThemeScope>
    );
  }
  return (
    <ThemeScope themeId={themeId} accentColor={accentColor} className="bg-[var(--sf-page)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14" id="kontak">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-center text-[var(--sf-text)] mb-6 sm:mb-8">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {address && (
            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)]">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[var(--sf-primary)]" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--sf-text)]">Alamat</h3>
                <p className="text-sm text-[var(--sf-text-soft)] mt-0.5 break-words">{address}</p>
              </div>
            </div>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-start gap-3 p-4 sm:p-5 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)] hover:border-[var(--sf-primary-border)] transition-colors">
              <Mail className="w-5 h-5 shrink-0 mt-0.5 text-[var(--sf-primary)]" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--sf-text)]">Email</h3>
                <p className="text-sm text-[var(--sf-text-soft)] mt-0.5 break-all">{email}</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </ThemeScope>
  );
};
