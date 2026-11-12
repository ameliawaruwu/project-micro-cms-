import React from 'react';
import { X } from 'lucide-react';
import { TicketCategory, TicketPriority, TicketStatus } from '../../services/ticketService';

export const TICKET_STATUSES: TicketStatus[] = ['pending', 'in_progress', 'resolved'];

export const STATUS_META: Record<TicketStatus, { label: string; className: string; dot: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  in_progress: { label: 'On Progress', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

export const CATEGORY_LABELS: Record<TicketCategory, { id: string; en: string }> = {
  akun: { id: 'Akun', en: 'Account' },
  toko: { id: 'Toko', en: 'Store' },
  produk: { id: 'Produk', en: 'Product' },
  pembayaran: { id: 'Pembayaran', en: 'Payment' },
  teknis: { id: 'Teknis', en: 'Technical' },
  lainnya: { id: 'Lainnya', en: 'Other' },
};

export const PRIORITY_LABELS: Record<TicketPriority, { id: string; en: string; className: string }> = {
  low: { id: 'Rendah', en: 'Low', className: 'text-gray-500' },
  normal: { id: 'Normal', en: 'Normal', className: 'text-gray-700' },
  high: { id: 'Tinggi', en: 'High', className: 'text-[#66000E] font-semibold' },
};

export const formatTicketDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${meta.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

/** Chip filter status: Semua / Pending / On Progress / Resolved */
export const TicketStatusFilter: React.FC<{
  value: TicketStatus | 'all';
  onChange: (v: TicketStatus | 'all') => void;
  counts: Record<TicketStatus | 'all', number>;
  isEn?: boolean;
}> = ({ value, onChange, counts, isEn }) => {
  const items: { id: TicketStatus | 'all'; label: string }[] = [
    { id: 'all', label: isEn ? 'All' : 'Semua' },
    ...TICKET_STATUSES.map((s) => ({ id: s, label: STATUS_META[s].label })),
  ];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition cursor-pointer ${
              active
                ? 'bg-brand border-[#66000E] text-white'
                : 'bg-white border-[#E5E0DD] text-[#706866] hover:text-[#66000E] hover:border-[#E8DDDE]'
            }`}
          >
            {it.label}
            <span className={`ml-1.5 ${active ? 'text-white/80' : 'text-[#A8A09D]'}`}>{counts[it.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
};

export const SimpleModal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}> = ({ open, title, onClose, children, footer, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className={`bg-white w-full ${wide ? 'sm:max-w-xl' : 'sm:max-w-md'} rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E0DD]">
          <h3 className="text-sm font-semibold text-[#1F1F1F]">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-3">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-[#E5E0DD] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const fieldClass =
  'w-full px-3 py-2 rounded-lg border border-[#E5E0DD] bg-white text-sm text-[#1F1F1F] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/10';
export const labelClass = 'block text-xs font-medium text-[#706866] mb-1';
export const primaryBtn =
  'px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5';
export const ghostBtn =
  'px-3.5 py-2 rounded-lg border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] text-[#1F1F1F] text-xs font-medium transition cursor-pointer inline-flex items-center gap-1.5';
