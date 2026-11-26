import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  ShoppingBag,
  Wallet,
  Package,
  Users,
  Globe,
  Receipt,
  UserPlus,
  CheckCheck,
  X,
} from 'lucide-react';
import { SupportAgentIcon } from './icons/SupportAgentIcon';
import { notificationService, AppNotification } from '../../services/notificationService';
import { notificationText } from '../../utils/notificationText';
import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationBellProps {
  /** Dipanggil saat notifikasi diklik: tab tujuan & toko terkait (bila ada). */
  onNavigate?: (link: string, storeId: string | null) => void;
}

const POLL_MS = 45_000;

const iconFor = (type: string) => {
  if (type.startsWith('order_paid') || type.startsWith('withdrawal')) return Wallet;
  if (type.startsWith('order')) return ShoppingBag;
  if (type.startsWith('product')) return Package;
  if (type.startsWith('community_invoice')) return Receipt;
  if (type.startsWith('community') || type.startsWith('join_request')) return Users;
  if (type.startsWith('ticket')) return SupportAgentIcon;
  if (type.startsWith('domain')) return Globe;
  if (type.startsWith('user')) return UserPlus;
  return Bell;
};

const timeAgo = (iso: string, isEn: boolean) => {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return isEn ? 'just now' : 'baru saja';
  const m = Math.floor(s / 60);
  if (m < 60) return isEn ? `${m}m ago` : `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return isEn ? `${h}h ago` : `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return isEn ? `${d}d ago` : `${d} hari lalu`;
  return new Date(t).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short' });
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { isEn } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const rows = await notificationService.list(30);
    setItems(rows);
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.readAt).length;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  };

  const markAll = async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    await notificationService.markAllRead();
  };

  const openItem = async (n: AppNotification) => {
    if (!n.readAt) {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: now } : x)));
      notificationService.markRead([n.id]);
    }
    setOpen(false);
    if (n.link) onNavigate?.(n.link, n.storeId);
  };

  const removeItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((x) => x.id !== id));
    await notificationService.remove(id);
  };

  // Satu gaya untuk semua halaman (mengikuti header admin).
  const buttonClass =
    'relative p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center';

  return (
    <div ref={wrapRef} className="relative shrink-0 font-poppins">
      <button
        type="button"
        onClick={toggle}
        className={buttonClass}
        aria-label={isEn ? 'Notifications' : 'Notifikasi'}
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#66000E] text-white text-[9px] font-bold leading-4 text-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white border border-[#E5E0DD] rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#E5E0DD]">
            <p className="text-xs font-bold text-[#241A1A]">{isEn ? 'Notifications' : 'Notifikasi'}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#66000E] hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                {isEn ? 'Mark all read' : 'Tandai semua dibaca'}
              </button>
            )}
          </div>

          <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[11px] text-[#706866]">{isEn ? 'Loading…' : 'Memuat…'}</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 text-[#E5E0DD] mx-auto mb-2" />
                <p className="text-[11px] text-[#706866]">
                  {isEn ? 'No notifications yet.' : 'Belum ada notifikasi.'}
                </p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = iconFor(n.type);
                const text = notificationText(n, isEn);
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openItem(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openItem(n);
                    }}
                    className={`group flex items-start gap-2.5 px-3.5 py-2.5 border-b border-[#F2EEEC] last:border-b-0 cursor-pointer transition hover:bg-[#FAF7F7] ${
                      n.readAt ? '' : 'bg-[#66000E]/[0.03]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        n.readAt ? 'bg-[#FAF7F7] text-[#706866]' : 'bg-[#66000E]/10 text-[#66000E]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] leading-snug text-[#241A1A] break-words ${n.readAt ? 'font-medium' : 'font-bold'}`}>
                        {text.title}
                      </p>
                      {text.body && (
                        <p className="text-[10px] leading-snug text-[#706866] mt-0.5 break-words line-clamp-3">{text.body}</p>
                      )}
                      <p className="text-[9px] text-[#A39C9A] mt-1">{timeAgo(n.createdAt, isEn)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-[#66000E] mt-1" />}
                      <button
                        type="button"
                        onClick={(e) => removeItem(e, n.id)}
                        className="p-0.5 rounded text-[#A39C9A] hover:text-[#66000E] sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                        aria-label={isEn ? 'Delete notification' : 'Hapus notifikasi'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
