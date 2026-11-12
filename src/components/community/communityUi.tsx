import React from 'react';
import { JoinRequestStatus } from '../../services/communityMembershipService';

export const REQUEST_STATUS_META: Record<JoinRequestStatus, { id: string; en: string; className: string; dot: string }> = {
  pending: { id: 'Menunggu', en: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  approved: { id: 'Disetujui', en: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { id: 'Ditolak', en: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  cancelled: { id: 'Dibatalkan', en: 'Cancelled', className: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

export const RequestStatusBadge: React.FC<{ status: JoinRequestStatus; isEn: boolean }> = ({ status, isEn }) => {
  const meta = REQUEST_STATUS_META[status] || REQUEST_STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${meta.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {isEn ? meta.en : meta.id}
    </span>
  );
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(iso));
  } catch {
    return iso;
  }
};
