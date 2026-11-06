import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Search, Inbox, Loader2, RefreshCw, Trash2, ChevronRight } from 'lucide-react';
import { User } from '../../../types';
import { ticketService, SupportTicket, TicketStatus } from '../../../services/ticketService';
import { ROLE_LABELS } from '../../../services/userAdminService';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_META,
  SimpleModal,
  TICKET_STATUSES,
  TicketStatusBadge,
  TicketStatusFilter,
  fieldClass,
  formatTicketDate,
  ghostBtn,
  labelClass,
  primaryBtn,
} from '../../../components/tickets/ticketUi';

interface AdminTicketsTabProps {
  currentUser?: User | null;
  language: string;
  onShowToast?: (msg: string) => void;
  onTicketsChanged?: () => void;
  onNavigateOverview?: () => void;
}

export const AdminTicketsTab: React.FC<AdminTicketsTabProps> = ({
  currentUser,
  language,
  onShowToast,
  onTicketsChanged,
  onNavigateOverview,
}) => {
  const isEn = language === 'en';
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [draftStatus, setDraftStatus] = useState<TicketStatus>('pending');
  const [draftResponse, setDraftResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTickets(await ticketService.listAll());
    } catch (err: any) {
      setLoadError(err?.message || 'Gagal memuat tiket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    }),
    [tickets]
  );

  const visible = tickets.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [t.subject, t.ticketNumber, t.requesterName, t.requesterEmail, t.storeName, t.communityName]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const openTicket = (t: SupportTicket) => {
    setSelected(t);
    setDraftStatus(t.status);
    setDraftResponse(t.adminResponse || '');
    setModalError(null);
  };

  const replaceTicket = (updated: SupportTicket) =>
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setModalError(null);
    try {
      const updated = await ticketService.update(selected.id, {
        status: draftStatus,
        adminResponse: draftResponse,
        handledBy: currentUser?.name || currentUser?.email || 'Super Admin',
      });
      replaceTicket(updated);
      setSelected(null);
      onTicketsChanged?.();
      onShowToast?.(`${updated.ticketNumber} → ${STATUS_META[updated.status].label}`);
    } catch (err: any) {
      setModalError(err?.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await ticketService.remove(selected.id);
      setTickets((prev) => prev.filter((t) => t.id !== selected.id));
      onShowToast?.(isEn ? 'Ticket deleted' : 'Tiket dihapus');
      setConfirmOpen(false);
      setSelected(null);
      onTicketsChanged?.();
    } catch (err: any) {
      setModalError(err?.message || 'Gagal menghapus.');
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateOverview },
          { label: isEn ? 'Manage Tickets' : 'Kelola Tiket', isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD] flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <Ticket className="w-5 h-5 text-[#66000E]" />
          <span>{isEn ? 'Manage Tickets' : 'Kelola Tiket'}</span>
        </h1>
        <button type="button" onClick={load} className={ghostBtn}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <TicketStatusFilter value={filter} onChange={setFilter} counts={counts} isEn={isEn} />
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A8A09D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${fieldClass} pl-8 py-1.5 text-xs`}
            placeholder={isEn ? 'Search…' : 'Cari…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
            <p className="text-xs">{isEn ? 'No tickets' : 'Tidak ada tiket'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0ECEA]">
            {visible.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => openTicket(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF7F7] transition cursor-pointer"
                >
                  {t.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-[#66000E] shrink-0" title="High" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F1F1F] truncate">{t.subject}</p>
                    <p className="text-[11px] text-[#A8A09D] mt-0.5 truncate">
                      {t.requesterName} · {ROLE_LABELS[t.requesterRole] || t.requesterRole}
                      {t.storeName ? ` · ${t.storeName}` : t.communityName ? ` · ${t.communityName}` : ''}
                      {' · '}
                      {formatTicketDate(t.createdAt)}
                    </p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                  <ChevronRight className="w-4 h-4 text-[#A8A09D] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SimpleModal
        open={!!selected}
        wide
        title={selected?.ticketNumber || ''}
        onClose={() => !saving && setSelected(null)}
        footer={
          <>
            <button type="button" onClick={() => setConfirmOpen(true)} disabled={saving} className={`${ghostBtn} mr-auto text-[#66000E]`}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button type="button" className={ghostBtn} onClick={() => setSelected(null)} disabled={saving}>
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button type="button" className={primaryBtn} onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEn ? 'Save' : 'Simpan'}
            </button>
          </>
        }
      >
        {selected && (
          <>
            <div>
              <p className="text-sm font-semibold text-[#1F1F1F]">{selected.subject}</p>
              <p className="text-[11px] text-[#A8A09D] mt-0.5">{formatTicketDate(selected.createdAt)}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-[#A8A09D]">{isEn ? 'From' : 'Pengaju'}</dt>
                <dd className="text-[#1F1F1F] truncate">{selected.requesterName}</dd>
                {selected.requesterEmail && <dd className="text-[#706866] truncate">{selected.requesterEmail}</dd>}
              </div>
              <div>
                <dt className="text-[#A8A09D]">{isEn ? 'Role' : 'Peran'}</dt>
                <dd className="text-[#1F1F1F]">{ROLE_LABELS[selected.requesterRole] || selected.requesterRole}</dd>
                <dd className="text-[#706866] truncate">{selected.storeName || selected.communityName || '-'}</dd>
              </div>
              <div>
                <dt className="text-[#A8A09D]">{isEn ? 'Category' : 'Kategori'}</dt>
                <dd className="text-[#1F1F1F]">{CATEGORY_LABELS[selected.category]?.[isEn ? 'en' : 'id'] || selected.category}</dd>
              </div>
              <div>
                <dt className="text-[#A8A09D]">{isEn ? 'Priority' : 'Prioritas'}</dt>
                <dd className={PRIORITY_LABELS[selected.priority]?.className}>
                  {PRIORITY_LABELS[selected.priority]?.[isEn ? 'en' : 'id'] || selected.priority}
                </dd>
              </div>
            </dl>

            <p className="text-xs text-[#4A4242] whitespace-pre-wrap leading-relaxed rounded-lg bg-[#FAF7F7] border border-[#F0ECEA] p-3">
              {selected.description}
            </p>

            <div>
              <label className={labelClass}>Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TICKET_STATUSES.map((s) => {
                  const active = draftStatus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraftStatus(s)}
                      className={`py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        active ? STATUS_META[s].className + ' ring-1 ring-current' : 'border-[#E5E0DD] text-[#706866] hover:bg-[#FAF7F7]'
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>{isEn ? 'Response' : 'Tanggapan'}</label>
              <textarea
                className={`${fieldClass} min-h-[90px] resize-y`}
                value={draftResponse}
                onChange={(e) => setDraftResponse(e.target.value)}
              />
            </div>

            {selected.handledBy && (
              <p className="text-[11px] text-[#A8A09D]">
                {isEn ? 'Last handled by' : 'Terakhir ditangani'} {selected.handledBy} · {formatTicketDate(selected.updatedAt)}
              </p>
            )}
            {modalError && <p className="text-xs text-[#66000E]">{modalError}</p>}
          </>
        )}
      </SimpleModal>

      <ConfirmDeleteModal
        isOpen={confirmOpen && !!selected}
        title={isEn ? 'Delete Ticket' : 'Hapus Tiket'}
        itemName={selected?.ticketNumber}
        isDeleting={saving}
        onConfirm={handleDelete}
        onClose={() => !saving && setConfirmOpen(false)}
      />
    </div>
  );
};
