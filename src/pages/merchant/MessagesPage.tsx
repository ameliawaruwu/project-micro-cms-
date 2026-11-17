import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Inbox, Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { storeMessageService, type StoreMessage } from '../../services/storeMessageService';

interface MessagesPageProps {
  storeId?: string;
  storeName?: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateDashboard?: () => void;
  /** Dipanggil setiap jumlah pesan belum dibaca berubah (badge menu). */
  onUnreadChange?: (count: number) => void;
}

type Filter = 'all' | 'unread';

/** Kotak masuk pesan dari formulir "Hubungi Kami" di storefront. */
export const MessagesPage: React.FC<MessagesPageProps> = ({ storeId, onShowToast, onNavigateDashboard, onUnreadChange }) => {
  const { t, isEn } = useLanguage();
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!storeId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      setMessages(await storeMessageService.list(storeId));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = useMemo(() => messages.filter((m) => !m.isRead).length, [messages]);
  useEffect(() => {
    if (!loading && !loadError) onUnreadChange?.(unreadCount);
  }, [unreadCount, loading, loadError, onUnreadChange]);

  const visible = filter === 'unread' ? messages.filter((m) => !m.isRead) : messages;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const setRead = async (msg: StoreMessage, isRead: boolean, silent = false) => {
    if (msg.isRead === isRead) return;
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, isRead } : m)));
    try {
      await storeMessageService.setRead([msg.id], isRead);
    } catch {
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, isRead: msg.isRead } : m)));
      if (!silent) onShowToast(isEn ? 'Failed to update the message status.' : 'Gagal memperbarui status pesan.', 'error');
    }
  };

  const toggleOpen = (msg: StoreMessage) => {
    setConfirmDeleteId(null);
    if (openId === msg.id) {
      setOpenId(null);
      return;
    }
    setOpenId(msg.id);
    if (!msg.isRead) void setRead(msg, true, true);
  };

  const handleDelete = async (msg: StoreMessage) => {
    if (confirmDeleteId !== msg.id) {
      setConfirmDeleteId(msg.id);
      return;
    }
    setBusyId(msg.id);
    try {
      await storeMessageService.remove(msg.id);
      setMessages((list) => list.filter((m) => m.id !== msg.id));
      setOpenId(null);
      onShowToast(isEn ? 'Message deleted.' : 'Pesan dihapus.');
    } catch {
      onShowToast(isEn ? 'Failed to delete the message.' : 'Gagal menghapus pesan.', 'error');
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const pageTitle = t('nav_messages', 'Pesan Masuk');

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-poppins pb-24 lg:pb-8 text-left w-full">
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: pageTitle, isActive: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-[#66000E]" />
            <span>{pageTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEn
              ? 'Messages sent by visitors through the Contact Us page of your store.'
              : 'Pesan dari pengunjung lewat halaman Hubungi Kami di toko Anda.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-xl bg-white border border-[#E5E0DD] p-0.5 text-xs">
            {(['all', 'unread'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${filter === f ? 'bg-[#66000E] text-white' : 'text-gray-600 hover:text-[#66000E]'}`}
              >
                {f === 'all'
                  ? (isEn ? `All (${messages.length})` : `Semua (${messages.length})`)
                  : (isEn ? `Unread (${unreadCount})` : `Belum dibaca (${unreadCount})`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#E5E0DD] text-gray-600 hover:text-[#66000E] transition cursor-pointer disabled:opacity-50"
            title={isEn ? 'Refresh' : 'Muat ulang'}
            aria-label={isEn ? 'Refresh' : 'Muat ulang'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && messages.length === 0 ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-8 text-center text-sm text-gray-500">
          {isEn ? 'Loading messages…' : 'Memuat pesan…'}
        </div>
      ) : loadError ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-8 text-center text-sm text-red-600">
          {isEn ? 'Failed to load messages. Please try again.' : 'Gagal memuat pesan. Silakan coba lagi.'}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-10 text-center space-y-2">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-700">
            {filter === 'unread'
              ? (isEn ? 'No unread messages.' : 'Tidak ada pesan yang belum dibaca.')
              : (isEn ? 'No messages yet.' : 'Belum ada pesan.')}
          </p>
          {filter === 'all' && (
            <p className="text-xs text-gray-500">
              {isEn
                ? 'Messages from the Contact Us page of your published store will appear here.'
                : 'Pesan dari halaman Hubungi Kami di toko yang sudah terbit akan muncul di sini.'}
            </p>
          )}
        </div>
      ) : (
        <ul className="bg-white border border-[#E5E0DD] rounded-2xl divide-y divide-[#F0EBEA] overflow-hidden">
          {visible.map((msg) => {
            const isOpen = openId === msg.id;
            return (
              <li key={msg.id} className={msg.isRead ? '' : 'bg-[#FDF6F7]'}>
                <button
                  type="button"
                  onClick={() => toggleOpen(msg)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer hover:bg-[#FAF7F7] transition"
                >
                  {msg.isRead
                    ? <MailOpen className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    : <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#66000E]" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${msg.isRead ? 'text-gray-700' : 'font-semibold text-[#1F1F1F]'}`}>{msg.senderName}</span>
                      <span className="text-[11px] text-gray-400 shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{msg.senderEmail}</p>
                    {!isOpen && <p className="text-xs text-gray-600 truncate mt-0.5">{msg.message}</p>}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pl-11 space-y-3">
                    <p className="text-sm text-[#241A1A] whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void setRead(msg, false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5E0DD] text-gray-700 hover:text-[#66000E] transition cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {isEn ? 'Mark as unread' : 'Tandai belum dibaca'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(msg)}
                        disabled={busyId === msg.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer disabled:opacity-50 ${
                          confirmDeleteId === msg.id
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-[#E5E0DD] text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {confirmDeleteId === msg.id
                          ? (isEn ? 'Click again to delete' : 'Klik lagi untuk menghapus')
                          : (isEn ? 'Delete' : 'Hapus')}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
