import React, { useState } from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { useStoreChromeOptions } from './storeChrome';
import { Phone, MapPin } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { getDeviceClass } from '../../utils/responsivePreview';
import { useLanguage } from '../../contexts/LanguageContext';
import { storeMessageService, type SendMessageResult } from '../../services/storeMessageService';

interface ContactPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export const ContactPage: React.FC<ContactPageProps> = ({ themeData, themeId: propThemeId, store, onNavigate, deviceMode }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const isMobile = deviceMode ? deviceMode === 'mobile' : undefined;
  const { isEn } = useLanguage();
  const isTablet = deviceMode ? deviceMode === 'tablet' : undefined;
  const gridCols2Class = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 md:grid-cols-2',
  });
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

  // Kontak nyata dari data toko (tanpa data contoh). Hanya kota/provinsi, bukan alamat lengkap.
  const phoneRaw = String(store?.phoneWhatsApp || '').trim();
  const waDigits = phoneRaw.replace(/\D/g, '').replace(/^0/, '62');
  const location = [store?.city, store?.province]
    .map((v: unknown) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v: string, i: number, arr: string[]) => v && arr.indexOf(v) === i)
    .join(', ');

  // Formulir "Hubungi Kami" → POST /api/store-messages → kotak masuk merchant.
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendMessageResult | null>(null);
  const setField = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const RESULT_TEXT: Record<SendMessageResult, [string, string]> = {
    sent: ['Pesan terkirim. Penjual akan membalas ke email Anda.', 'Message sent. The seller will reply to your email.'],
    invalid: ['Data pesan tidak valid.', 'Invalid message data.'],
    name_required: ['Nama minimal 2 karakter.', 'Name must be at least 2 characters.'],
    email_invalid: ['Format email tidak valid.', 'Invalid email format.'],
    message_required: ['Pesan minimal 5 karakter.', 'Message must be at least 5 characters.'],
    rate_limited: ['Terlalu banyak pesan. Coba lagi beberapa menit lagi.', 'Too many messages. Please try again in a few minutes.'],
    store_not_found: ['Toko belum terbit, pesan belum bisa dikirim.', 'This store is not published yet, so messages cannot be sent.'],
    failed: ['Gagal mengirim pesan. Silakan coba lagi.', 'Failed to send the message. Please try again.'],
  };
  const resultText = result ? RESULT_TEXT[result][isEn ? 1 : 0] : '';
  const isSent = result === 'sent';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (name.length < 2) return setResult('name_required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setResult('email_invalid');
    if (message.length < 5) return setResult('message_required');
    if (!store?.id) return setResult('store_not_found');
    setSending(true);
    setResult(null);
    const r = await storeMessageService.send({ storeId: String(store.id), name, email, message, website: form.website });
    setSending(false);
    setResult(r);
    if (r === 'sent') setForm({ name: '', email: '', message: '', website: '' });
  };

  // Kolom jebakan bot: tidak terlihat & tidak bisa difokus pengunjung.
  const honeypot = (
    <input
      type="text"
      name="website"
      value={form.website}
      onChange={setField('website')}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] w-px h-px opacity-0"
    />
  );
  const feedback = (className: string) =>
    resultText ? (
      <p role="status" aria-live="polite" className={className}>{resultText}</p>
    ) : null;

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-center">
              {isEn ? 'CONTACT US' : 'HUBUNGI KAMI'}
            </h1>
            <form onSubmit={handleSubmit} noValidate className="relative bg-[#FF0000] p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-4">
              {honeypot}
              <input type="text" value={form.name} onChange={setField('name')} maxLength={100} required aria-label={isEn ? 'Full name' : 'Nama lengkap'} placeholder={isEn ? 'FULL NAME' : 'NAMA LENGKAP'} className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
              <input type="email" value={form.email} onChange={setField('email')} maxLength={254} required aria-label="Email" placeholder="EMAIL" className="w-full p-4 bg-white border-4 border-black font-black text-sm" />
              <textarea value={form.message} onChange={setField('message')} maxLength={2000} required aria-label={isEn ? 'Your message' : 'Pesan Anda'} placeholder={isEn ? 'YOUR MESSAGE...' : 'PESAN ANDA...'} rows={4} className="w-full p-4 bg-white border-4 border-black font-black text-sm" />
              <button type="submit" disabled={sending} className="w-full py-5 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-60">
                {sending ? (isEn ? 'SENDING...' : 'MENGIRIM...') : <>{isEn ? 'SEND MESSAGE' : 'KIRIM PESAN'} 📩</>}
              </button>
              {feedback(`p-3 border-4 border-black font-black text-sm ${isSent ? 'bg-yellow-300 text-black' : 'bg-white text-black'}`)}
            </form>
            {(phoneRaw || location) && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center font-black uppercase text-sm">
                {phoneRaw && <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border-4 border-black px-4 py-2 hover:bg-yellow-300"><Phone className="w-4 h-4" /> {phoneRaw}</a>}
                {location && <span className="flex items-center gap-2 border-4 border-black px-4 py-2"><MapPin className="w-4 h-4" /> {location}</span>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="text-xs text-[var(--sf-primary)] uppercase tracking-widest">[DISPATCH_COMMUNICATION]</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] bg-clip-text text-transparent mt-2">
                {isEn ? 'CONTACT MATRIX' : 'HUBUNGI KAMI'}
              </h1>
            </div>
            <form onSubmit={handleSubmit} noValidate className="relative bg-slate-900/60 border border-[var(--sf-primary-border)] rounded-3xl p-8 backdrop-blur-md space-y-4">
              {honeypot}
              <input type="text" value={form.name} onChange={setField('name')} maxLength={100} required aria-label={isEn ? 'Full name' : 'Nama lengkap'} placeholder={isEn ? 'FULL_NAME' : 'NAMA_LENGKAP'} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <input type="email" value={form.email} onChange={setField('email')} maxLength={254} required aria-label="Email" placeholder={isEn ? 'EMAIL_ADDRESS' : 'ALAMAT_EMAIL'} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <textarea value={form.message} onChange={setField('message')} maxLength={2000} required aria-label={isEn ? 'Your message' : 'Pesan Anda'} placeholder={isEn ? 'TRANSMISSION_DATA...' : 'ISI_PESAN...'} rows={4} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <button type="submit" disabled={sending} className="w-full py-4 bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-60">
                {sending ? (isEn ? 'TRANSMITTING...' : 'MENGIRIM...') : <>{isEn ? 'TRANSMIT MESSAGE' : 'KIRIM PESAN'} ⚡</>}
              </button>
              {feedback(`text-xs text-center ${isSent ? 'text-[var(--sf-primary)]' : 'text-red-400'}`)}
            </form>
            {(phoneRaw || location) && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center text-xs text-slate-400">
                {phoneRaw && <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--sf-primary)]"><Phone className="w-4 h-4 text-[var(--sf-primary)]" /> {phoneRaw}</a>}
                {location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--sf-primary)]" /> {location}</span>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL ETC
    return (
      <div className="pt-28 pb-24 bg-[var(--sf-subtle)] text-[var(--sf-text)] min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[var(--sf-card)] p-8 md:p-12 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-[var(--sf-text)]">{isEn ? 'Contact Us' : 'Hubungi Kami'}</h1>
              <p className="text-sm text-[var(--sf-muted)]">{isEn ? 'Have a question? Our team is ready to help you anytime.' : 'Ada pertanyaan? Tim kami siap membantu Anda kapan saja.'}</p>
            </div>
            <div className={`grid ${gridCols2Class} gap-8`}>
              <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
                {honeypot}
                <input type="text" value={form.name} onChange={setField('name')} maxLength={100} required aria-label={isEn ? 'Your name' : 'Nama Anda'} placeholder={isEn ? 'Your Name' : 'Nama Anda'} className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="email" value={form.email} onChange={setField('email')} maxLength={254} required aria-label={isEn ? 'Your email' : 'Email Anda'} placeholder={isEn ? 'Your Email' : 'Email Anda'} className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <textarea value={form.message} onChange={setField('message')} maxLength={2000} required aria-label={isEn ? 'Your message' : 'Pesan Anda'} placeholder={isEn ? 'Your Message...' : 'Pesan Anda...'} rows={4} className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <button type="submit" disabled={sending} className="w-full py-3.5 bg-[var(--sf-primary)] text-white font-bold text-sm rounded-[var(--sf-radius)] hover:bg-[var(--sf-primary)] transition shadow-md disabled:opacity-60">
                  {sending ? (isEn ? 'Sending...' : 'Mengirim...') : (isEn ? 'Send Message' : 'Kirim Pesan')}
                </button>
                {feedback(`text-sm text-center ${isSent ? 'text-green-700' : 'text-red-600'}`)}
              </form>
              <div className="bg-[var(--sf-subtle)] p-6 rounded-[var(--sf-radius)] space-y-4 text-sm text-[var(--sf-text-soft)] border border-[var(--sf-border)]">
                <p className="text-[var(--sf-muted)]">
                  {isEn ? 'Your message goes straight to the seller, who will reply to your email.' : 'Pesan Anda langsung masuk ke penjual dan akan dibalas ke email Anda.'}
                </p>
                {phoneRaw && (
                  <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[var(--sf-primary)]">
                    <Phone className="w-5 h-5 text-[var(--sf-muted)]" /> {phoneRaw} <span className="text-xs text-[var(--sf-muted)]">(WhatsApp)</span>
                  </a>
                )}
                {location && <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[var(--sf-muted)]" /> {location}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
