import React from 'react';
import {
  Search,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

interface AdminStoresTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPlan: string;
  setFilterPlan: (plan: string) => void;
  filteredStores: Store[];
  suspendedIds: string[];
  handleChangePlan: (storeId: string, plan: 'free' | 'starter' | 'premium') => void;
  handleToggleSuspend: (storeId: string, storeName: string) => void;
  onOpenStorefront?: (slug: string) => void;
  language: string;
  isEn: boolean;
}

export const AdminStoresTab: React.FC<AdminStoresTabProps> = ({
  searchQuery,
  setSearchQuery,
  filterPlan,
  setFilterPlan,
  filteredStores,
  suspendedIds,
  handleChangePlan,
  handleToggleSuspend,
  onOpenStorefront,
  language,
  isEn,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search store by name, domain, or owner...' : 'Cari toko berdasarkan nama, domain, atau pemilik...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'free', 'premium'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlan(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition cursor-pointer ${
                filterPlan === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'all'
                ? (language === 'en' ? 'All' : 'Semua')
                : p === 'premium'
                ? 'Pro'
                : (language === 'en' ? 'Free' : 'Gratis')}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Store' : 'Toko'}</th>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Plan' : 'Paket'}</th>
                <th className="py-2.5 px-3.5">{language === 'en' ? 'Wallet Balance' : 'Saldo Dompet'}</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">{language === 'en' ? 'Action' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStores.map((store) => {
                const isSuspended = suspendedIds.includes(store.id);
                return (
                  <tr key={store.id} className="hover:bg-gray-50/60 transition">
                    {/* Store details */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={store.logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                          alt={store.name}
                          className="w-7 h-7 rounded object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{store.name}</p>
                          <span className="text-[11px] text-gray-400">/{store.slug} • {store.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Plan Selector */}
                    <td className="py-2.5 px-3.5">
                      <select
                        value={store.plan || 'free'}
                        onChange={(e) => handleChangePlan(store.id, e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-[11px] font-medium text-gray-800 focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        <option value="free">FREE</option>
                        <option value="starter">STARTER</option>
                        <option value="premium">PRO</option>
                      </select>
                    </td>

                    {/* Balance */}
                    <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                      {formatRupiah(store.balance || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                          <Ban className="w-3 h-3" /> {isEn ? 'Suspended' : 'Disuspend'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isEn ? 'Active' : 'Aktif'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpenStorefront && (
                          <button
                            onClick={() => onOpenStorefront(store.slug)}
                            className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                            title={isEn ? 'View Storefront' : 'Lihat Storefront'}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleSuspend(store.id, store.name)}
                          className={`px-2 py-0.5 rounded font-medium text-[11px] transition cursor-pointer ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-white hover:bg-red-50 border border-red-200 text-red-600'
                          }`}
                        >
                          {isSuspended ? (isEn ? 'Activate' : 'Aktifkan') : (isEn ? 'Suspend' : 'Suspend')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
