import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Store } from '../../types';
import { adminDomainService } from '../../services/adminDomainService';

interface StoreDomainPanelProps {
  store: Store;
  currentDomain: string | null;
  isEn: boolean;
  onClose: () => void;
  onSaved: (storeId: string, hostname: string | null) => void;
}

const cleanLabel = (value: string) =>
  value.toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]/g, '').replace(/^\.+|\.+$/g, '');

/**
 * Super admin menetapkan domain kustom toko (mis. domain milik merchant yang sudah didaftarkan di
 * Kroombox Panel). Domain induk hanya dari daftar panel, jadi pilihan selalu bisa live.
 * Ditampilkan sebagai baris yang terbuka di bawah toko pada tabel Kelola Toko.
 */
export const StoreDomainPanel: React.FC<StoreDomainPanelProps> = ({ store, currentDomain, isEn, onClose, onSaved }) => {
  const [parents, setParents] = useState<string[]>([]);
  const [defaultDomain, setDefaultDomain] = useState('lapakq.com');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [parent, setParent] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    adminDomainService
      .getAllowedDomains(true)
      .then((info) => {
        if (!alive) return;
        const usable = info.domains.filter((d) => d !== info.defaultDomain);
        setDefaultDomain(info.defaultDomain);
        setParents(usable);
        const current = currentDomain || '';
        const match = usable
          .filter((p) => current === p || current.endsWith(`.${p}`))
          .sort((a, b) => b.length - a.length)[0];
        setParent(match || usable[0] || '');
        setLabel(match && current !== match ? current.slice(0, -(match.length + 1)) : '');
      })
      .catch((err: Error) => alive && setLoadError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [currentDomain]);

  const hostname = useMemo(() => {
    if (!parent) return '';
    const sub = cleanLabel(label);
    return sub ? `${sub}.${parent}` : parent;
  }, [parent, label]);

  const save = async (value: string) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await adminDomainService.setStoreDomain(store.id, value);
      onSaved(store.id, result.hostname);
      if (result.warning) setNotice(result.warning);
      else onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'h-8 px-2.5 rounded-md border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-[#66000E]';

  return (
    <div className="bg-[#FBF7F7] border-l-2 border-[#66000E] px-4 py-3 text-xs" role="region" aria-label={isEn ? `Domain of ${store.name}` : `Domain ${store.name}`}>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500">{isEn ? 'Store address' : 'Alamat toko'}</p>
          <p className="h-8 flex items-center font-mono text-gray-800">{store.slug}.{store.baseDomain || defaultDomain}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500">{isEn ? 'Custom domain' : 'Domain kustom'}</p>
          <p className="h-8 flex items-center font-mono text-gray-800">{currentDomain || (isEn ? 'None' : 'Belum ada')}</p>
        </div>

        {loading ? (
          <p className="h-8 flex items-center gap-2 text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {isEn ? 'Loading panel domains…' : 'Memuat domain dari panel…'}
          </p>
        ) : loadError ? (
          <p className="h-8 flex items-center gap-2 text-red-600"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {loadError}</p>
        ) : parents.length === 0 ? (
          <p className="flex items-start gap-2 text-amber-700 max-w-md">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {isEn
              ? 'No domain besides the default is registered for LapakQ in Kroombox Panel. Add the merchant’s domain in the panel first.'
              : 'Belum ada domain selain bawaan yang terdaftar untuk LapakQ di Kroombox Panel. Tambahkan domain merchant di panel dulu.'}
          </p>
        ) : (
          <>
            <label className="min-w-0">
              <span className="block text-[11px] text-gray-500">{isEn ? 'Subdomain (optional)' : 'Subdomain (opsional)'}</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(cleanLabel(e.target.value))}
                placeholder={isEn ? 'empty = the domain itself' : 'kosong = domainnya langsung'}
                className={`${fieldClass} w-44`}
              />
            </label>
            <label className="min-w-0">
              <span className="block text-[11px] text-gray-500">{isEn ? 'Domain (from Kroombox Panel)' : 'Domain (dari Kroombox Panel)'}</span>
              <select value={parent} onChange={(e) => setParent(e.target.value)} className={`${fieldClass} max-w-[14rem]`}>
                {parents.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500">{isEn ? 'Result' : 'Hasil'}</p>
              <p className="h-8 flex items-center font-mono font-semibold text-gray-900 break-all">{hostname}</p>
            </div>
          </>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {currentDomain && (
            <button
              type="button"
              onClick={() => save('')}
              disabled={saving}
              className="h-8 px-2.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {isEn ? 'Remove' : 'Lepas domain'}
            </button>
          )}
          <button
            type="button"
            onClick={() => save(hostname)}
            disabled={saving || !hostname || hostname === currentDomain}
            className="h-8 px-3.5 rounded-md bg-brand hover:bg-brand-hover text-white font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEn ? 'Save' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer"
            aria-label={isEn ? 'Close' : 'Tutup'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <p className="mt-2 flex items-start gap-2 text-red-600" role="alert"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}</p>}
      {notice && <p className="mt-2 flex items-start gap-2 text-amber-700"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {notice}</p>}
    </div>
  );
};
