import React, { useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Plus, ChevronDown, Inbox, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { User } from '../../types';
import {
  ticketService,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../services/ticketService';
import { Breadcrumb } from '../common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  SimpleModal,
  TicketStatusBadge,
  TicketStatusFilter,
  fieldClass,
  formatTicketDate,
  ghostBtn,
  labelClass,
  primaryBtn,
} from './ticketUi';

interface TicketRequesterPanelProps {
  user: User | null | undefined;
  store?: { id?: string; name?: string } | null;
  /** Peran pengaju yang tersimpan di tiket (default: user.role) */
  requesterRole?: User['role'];
  language?: string;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateDashboard?: () => void;
}

const EMPTY_FORM = { subject: '', category: 'lainnya' as TicketCategory, priority: 'normal' as TicketPriority, description: '' };

export const TicketRequesterPanel: React.FC<TicketRequesterPanelProps> = ({
  user,
  store,
  requesterRole,
  language,
  onShowToast,
  onNavigateDashboard,
}) => {
  const { language: ctxLanguage } = useLanguage();
  const isEn = (language || ctxLanguage) === 'en';
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      setTickets(await ticketService.listByRequester(user.id));
    } catch (err: any) {
      setLoadError(err?.message || 'Gagal memuat tiket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    }),
    [tickets]
  );

  const visible = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await ticketService.create({
        requester: requesterRole ? { ...user, role: requesterRole } : user,
        store: store?.id ? store : null,
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        description: form.description,
      });
      setTickets((prev) => [created, ...prev]);
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      setFilter('all');
      onShowToast?.(isEn ? `Ticket ${created.ticketNumber} submitted` : `Tiket ${created.ticketNumber} terkirim`, 'success');
    } catch (err: any) {
      setFormError(err?.message || 'Gagal mengirim tiket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 w-full text-left pb-20 lg:pb-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateDashboard },
          { label: isEn ? 'Support Tickets' : 'Tiket Bantuan', isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD] flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <LifeBuoy className="w-5 h-5 text-[#66000E]" />
          <span>{isEn ? 'Support Tickets' : 'Tiket Bantuan'}</span>
        </h1>
        <button type="button" className={primaryBtn} onClick={() => { setFormError(null); setIsFormOpen(true); }}>
          <Plus className="w-3.5 h-3.5" />
          {isEn ? 'New Ticket' : 'Buat Tiket'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TicketStatusFilter value={filter} onChange={setFilter} counts={counts} isEn={isEn} />
        <button type="button" onClick={load} className="p-2 rounded-lg text-[#706866] hover:text-[#66000E] hover:bg-white cursor-pointer shrink-0" title="Refresh">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center text-[#A8A09D]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="py-10 px-4 text-center text-xs text-[#66000E]">{loadError}</div>
        ) : visible.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-[#A8A09D]">
            <Inbox className="w-7 h-7" />
            <p className="text-xs">{isEn ? 'No tickets yet' : 'Belum ada tiket'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0ECEA]">
            {visible.map((t) => {
              const open = expandedId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : t.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF7F7] transition cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1F1F1F] truncate">{t.subject}</p>
                      <p className="text-[11px] text-[#A8A09D] mt-0.5 truncate">
                        {t.ticketNumber} · {CATEGORY_LABELS[t.category]?.[isEn ? 'en' : 'id'] || t.category} · {formatTicketDate(t.createdAt)}
                      </p>
                    </div>
                    {t.adminResponse && <MessageSquare className="w-3.5 h-3.5 text-[#66000E] shrink-0" />}
                    <TicketStatusBadge status={t.status} />
                    <ChevronDown className={`w-4 h-4 text-[#A8A09D] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-xs text-[#4A4242] whitespace-pre-wrap leading-relaxed">{t.description}</p>
                      {t.adminResponse && (
                        <div className="rounded-lg bg-[#FAF7F7] border border-[#F0ECEA] p-3">
                          <p className="text-[11px] font-medium text-[#66000E] mb-1">
                            {isEn ? 'Admin response' : 'Tanggapan admin'}
                            {t.handledBy ? ` · ${t.handledBy}` : ''}
                          </p>
                          <p className="text-xs text-[#4A4242] whitespace-pre-wrap leading-relaxed">{t.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SimpleModal
        open={isFormOpen}
        title={isEn ? 'New Ticket' : 'Buat Tiket'}
        onClose={() => !submitting && setIsFormOpen(false)}
        footer={
          <>
            <button type="button" className={ghostBtn} onClick={() => setIsFormOpen(false)} disabled={submitting}>
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button type="button" className={primaryBtn} onClick={() => handleSubmit()} disabled={submitting}>
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEn ? 'Submit' : 'Kirim'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>{isEn ? 'Subject' : 'Judul'}</label>
            <input
              className={fieldClass}
              value={form.subject}
              maxLength={200}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{isEn ? 'Category' : 'Kategori'}</label>
              <select className={fieldClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}>
                {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c][isEn ? 'en' : 'id']}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{isEn ? 'Priority' : 'Prioritas'}</label>
              <select className={fieldClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}>
                {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p][isEn ? 'en' : 'id']}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>{isEn ? 'Description' : 'Deskripsi'}</label>
            <textarea
              className={`${fieldClass} min-h-[110px] resize-y`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {formError && <p className="text-xs text-[#66000E]">{formError}</p>}
        </form>
      </SimpleModal>
    </div>
  );
};
