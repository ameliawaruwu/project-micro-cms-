import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Loader2, X, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Store } from '../../types';
import { adminDomainService } from '../../services/adminDomainService';

interface StoreDomainModalProps {
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
 */
export const StoreDomainModal: React.FC<StoreDomainModalProps> = ({ store, currentDomain, isEn, onClose, onSaved }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#66000E]" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">{isEn ? 'Store domain' : 'Domain toko'}</h3>
              <p className="text-[11px] text-gray-500">{store.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer" aria-label={isEn ? 'Close' : 'Tutup'}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 text-xs">
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 space-y-0.5">
            <p className="text-gray-500">{isEn ? 'Store address' : 'Alamat toko'}</p>
            <p className="font-mono text-gray-800">{store.slug}.{store.baseDomain || defaultDomain}</p>
            <p className="text-gray-500 pt-1">{isEn ? 'Custom domain' : 'Domain kustom'}</p>
            <p className="font-mono text-gray-800">{currentDomain || (isEn ? 'None' : 'Belum ada')}</p>
          </div>

          {loading ? (
            <p className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {isEn ? 'Loading panel domains…' : 'Memuat domain dari panel…'}
            </p>
          ) : loadError ? (
            <p className="flex items-start gap-2 text-red-600"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {loadError}</p>
          ) : parents.length === 0 ? (
            <p className="flex items-start gap-2 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {isEn
                ? 'No domain besides the default is registered for LapakQ in Kroombox Panel. Add the merchant’s domain in the panel first.'
                : 'Belum ada domain selain bawaan yang terdaftar untuk LapakQ di Kroombox Panel. Tambahkan domain merchant di panel dulu.'}
            </p>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-[11px]">{isEn ? 'Domain (from Kroombox Panel)' : 'Domain (dari Kroombox Panel)'}</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-mono focus:outline-none focus:border-[#66000E]"
                >
                  {parents.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-[11px]">{isEn ? 'Subdomain (optional)' : 'Subdomain (opsional)'}</label>
                <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-[#66000E] overflow-hidden">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(cleanLabel(e.target.value))}
                    placeholder={isEn ? 'empty = the domain itself' : 'kosong = domainnya langsung'}
                    className="flex-1 min-w-0 px-3 py-2 font-mono focus:outline-none"
                  />
                  <span className="px-2 py-2 bg-gray-50 text-gray-500 font-mono border-l border-gray-200 truncate max-w-[50%]">.{parent}</span>
                </div>
              </div>
              <p className="text-gray-600">
                {isEn ? 'Result:' : 'Hasil:'} <span className="font-mono font-semibold text-gray-900 break-all">{hostname}</span>
              </p>
            </>
          )}

          {error && <p className="flex items-start gap-2 text-red-600" role="alert"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}</p>}
          {notice && <p className="flex items-start gap-2 text-amber-700"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {notice}</p>}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
          {currentDomain ? (
            <button
              onClick={() => save('')}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {isEn ? 'Remove' : 'Lepas domain'}
            </button>
          ) : <span />}
          <button
            onClick={() => save(hostname)}
            disabled={saving || !hostname || hostname === currentDomain}
            className="px-4 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#4d000a] text-white font-semibold flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEn ? 'Save' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};
