import React from 'react';
import {
  EyeOff,
  Store as StoreIcon,
  MessageCircle,
  ArrowRight,
  Globe,
  Sparkles,
  ShieldAlert,
  Home,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Store } from '../../types';
import { Shield } from 'lucide-react';

interface StoreNotFoundPageProps {
  store?: Store | null;
  slug?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  onGoToDashboard?: () => void;
  onGoToAdmin?: () => void;
  onPublishStore?: () => void;
}

export const StoreNotFoundPage: React.FC<StoreNotFoundPageProps> = ({
  store,
  slug,
  isOwner = false,
  isAdmin = false,
  onGoToDashboard,
  onGoToAdmin,
  onPublishStore,
}) => {
  const isUnpublished = store && !store.isPublished;
  const storeName = store?.name || (slug ? `Toko (${slug})` : 'Toko Online');
  const storeSlug = store?.slug || slug || '';
  const phoneWhatsApp = store?.phoneWhatsApp?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FAF7F7] via-[#FDFBFB] to-[#F5EFEF] flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 font-sans text-center relative overflow-hidden selection:bg-[#F5E8EA] selection:text-[#66000E]">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

      {/* ═══════════ HEADER: KROOMIFY BRAND ═══════════ */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 shrink-0 z-10">
        <a
          href="https://kroomify.kroombox.com"
          className="inline-flex items-center gap-2.5 text-left group transition cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#66000E] to-[#990014] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <StoreIcon className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#241A1A] block font-poppins">
              Kroomify<span className="text-[#66000E]">.</span>
            </span>
            <span className="text-[10px] text-[#706866] block -mt-1 font-medium">
              E-Commerce Platform
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#66000E] text-[11px] font-bold border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Status: Tidak Aktif</span>
          </span>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT CARD ═══════════ */}
      <main className="my-auto py-8 w-full max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 border border-[#E5E0DD] shadow-xl space-y-6 animate-in zoom-in-95 duration-200 text-left">

          {/* Icon Container */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-rose-100/60 rounded-2xl animate-ping opacity-25" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAF5F5] to-rose-50 border-2 border-rose-200 text-[#66000E] flex items-center justify-center shadow-xs">
              <EyeOff className="w-9 h-9 text-[#66000E]" />
            </div>
          </div>

          {/* Heading & Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-mono font-semibold border border-gray-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{isUnpublished ? 'Draf • Belum Dipublikasikan' : '404 • Store Inactive'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#241A1A] tracking-tight font-poppins">
              {isUnpublished ? 'Toko Belum Dipublikasikan' : 'Toko Tidak Ditemukan'}
            </h1>

            <p className="text-xs sm:text-sm text-[#706866] leading-relaxed">
              {isUnpublished ? (
                <>
                  Website toko online <strong className="text-[#241A1A] font-semibold">"{storeName}"</strong> saat ini belum dipublikasikan untuk umum karena masih dalam tahap penyusunan atau berstatus draf oleh pemiliknya.
                </>
              ) : (
                <>
                  Website toko online dengan alamat <strong className="text-[#241A1A] font-semibold">"{storeSlug || storeName}"</strong> saat ini tidak tersedia atau belum terdaftar di platform.
                </>
              )}
            </p>
          </div>

          {/* Store Info Mini Card */}
          {storeSlug && (
            <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#EBE5E2] flex items-center justify-between text-xs">
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Alamat Subdomain</span>
                <span className="font-mono text-[11px] text-gray-700 truncate block font-medium">
                  {storeSlug}.kroombox.com
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {isUnpublished ? 'Belum Terbit' : 'Tidak Ditemukan'}
              </span>
            </div>
          )}

          {/* Conditional Action Buttons */}
          <div className="space-y-3 pt-2">
            {isAdmin ? (
              <div className="space-y-3 pt-2 border-t border-[#E5E0DD]">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed text-left">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Mode Administrator Super</span>
                  </div>
                  Toko <strong className="text-amber-950">"{storeName}"</strong> saat ini berstatus <strong>Draf / Belum Publish</strong>. Halaman publik storefront belum dapat diakses oleh pembeli hingga pemilik toko mempublikasikannya.
                </div>

                {onGoToAdmin && (
                  <button
                    type="button"
                    onClick={onGoToAdmin}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#66000E] hover:bg-[#55000C] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-200" />
                    <span>Kembali ke Admin Panel</span>
                  </button>
                )}
              </div>
            ) : isOwner ? (
              <div className="space-y-2 pt-2 border-t border-[#E5E0DD]">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-bold block text-amber-950">Anda Pemilik Toko Ini:</span>
                  Toko sedang dimatikan dari akses publik. Anda dapat mempublikasikannya kembali kapan saja melalui editor layout.
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {onGoToDashboard && (
                    <button
                      type="button"
                      onClick={onGoToDashboard}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#241A1A] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-gray-600" />
                      <span>Ke Dashboard</span>
                    </button>
                  )}

                  {onPublishStore && (
                    <button
                      type="button"
                      onClick={onPublishStore}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
                      <span>Publikasikan Lagi</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {phoneWhatsApp && (
                  <a
                    href={`https://wa.me/${phoneWhatsApp}?text=${encodeURIComponent(`Halo ${storeName}, saya melihat toko online Anda sedang tidak aktif. Apakah masih menerima pesanan?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>Hubungi Penjual via WhatsApp</span>
                  </a>
                )}

                <a
                  href="https://kroomify.kroombox.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Bikin Toko Online Sendiri di Kroomify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="w-full max-w-4xl py-3 text-center text-xs text-[#706866] shrink-0 z-10 space-y-1">
        <p className="text-[11px]">
          Didukung oleh <strong className="text-[#241A1A]">Kroomify</strong> &bull; Platform Toko Online &amp; Katalog Cepat untuk UMKM
        </p>
        <p className="text-[10px] text-gray-400">
          Hak Cipta &copy; {new Date().getFullYear()} Kroombox Network. Seluruh hak dilindungi.
        </p>
      </footer>
    </div>
  );
};
