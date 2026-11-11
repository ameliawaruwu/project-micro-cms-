import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { adminDomainService } from '../../services/adminDomainService';

interface PanelDomainSelectProps {
  value: string;
  onChange: (domain: string) => void;
  /** Sub-admin hanya melihat domain yang sudah ditetapkan super admin. */
  readOnly?: boolean;
}

/**
 * Pilihan domain induk komunitas. Daftar diambil dari Kroombox Panel (domain yang boleh dipakai
 * API key LapakQ), jadi domain yang dipilih pasti bisa didaftarkan saat toko dipublikasikan.
 * Nilai kosong = domain bawaan (lapakq.com).
 */
export const PanelDomainSelect: React.FC<PanelDomainSelectProps> = ({ value, onChange, readOnly = false }) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [defaultDomain, setDefaultDomain] = useState('lapakq.com');
  const [loading, setLoading] = useState(!readOnly);
  const [error, setError] = useState('');

  useEffect(() => {
    if (readOnly) return;
    let alive = true;
    adminDomainService
      .getAllowedDomains()
      .then((info) => {
        if (!alive) return;
        setDefaultDomain(info.defaultDomain);
        setDomains(info.domains.filter((d) => d !== info.defaultDomain));
      })
      .catch((err: Error) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [readOnly]);

  const className =
    'w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#66000E] disabled:bg-gray-50 disabled:text-gray-500';

  if (readOnly) {
    return <input type="text" value={value || defaultDomain} disabled className={className} />;
  }

  const unknownCurrent = !loading && !error && value && !domains.includes(value);

  return (
    <div className="space-y-1">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={loading} className={className}>
        <option value="">{loading ? 'Memuat domain panel…' : `${defaultDomain} (bawaan)`}</option>
        {domains.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
        {unknownCurrent && <option value={value}>{value} (tidak terdaftar di panel)</option>}
      </select>
      {error && (
        <p className="flex items-start gap-1 text-[11px] text-red-600"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {error}</p>
      )}
      {unknownCurrent && (
        <p className="flex items-start gap-1 text-[11px] text-amber-700">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          Domain ini belum diizinkan untuk LapakQ di Kroombox Panel; toko komunitas ini tidak bisa dipublikasikan sampai domainnya ditambahkan di panel.
        </p>
      )}
    </div>
  );
};
