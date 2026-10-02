import { ShippingBranch } from '../types';
import { supabase } from './supabaseClient';
import { storeService } from './storeService';
import { idService } from './idService';

// ============================================================
// MERCHANT DATA ISOLATION: localStorage dipartisi per storeId
// Key format: microcms_branches_v2_{storeId}
// ============================================================
const BRANCHES_STORAGE_KEY_PREFIX = 'microcms_branches_v2_';
// Hapus key global lama
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_shipping_branches_v1');
  } catch { /* ignore */ }
}

export const initialBranches: ShippingBranch[] = [];

function mapDbRowToBranch(row: any): ShippingBranch {
  return {
    id: row.id,
    storeId: row.store_id,
    branchName: row.branch_name,
    picName: row.pic_name,
    picPhone: row.pic_phone,
    address: row.address,
    subdistrict: row.subdistrict || '',
    city: row.city,
    province: row.province,
    postalCode: String(row.postal_code),
    isDefault: Boolean(row.is_default),
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class BranchService {
  private storeKey(storeId: string): string {
    return `${BRANCHES_STORAGE_KEY_PREFIX}${storeId}`;
  }

  private getStoredBranches(storeId?: string): ShippingBranch[] {
    if (storeId) {
      const data = localStorage.getItem(this.storeKey(storeId));
      if (!data) return [];
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveBranches(storeId: string, branchesToSave: ShippingBranch[]) {
    const existing = this.getStoredBranches(storeId);
    const map = new Map<string, ShippingBranch>();
    existing.forEach((b) => {
      if (b && b.id) map.set(b.id, b);
    });
    branchesToSave.forEach((b) => {
      if (b && b.id) map.set(b.id, b);
    });
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(Array.from(map.values())));
  }

  async getBranches(storeId?: string): Promise<ShippingBranch[]> {
    // 1. Ambil dari Supabase Database (selalu filter by store_id jika ada)
    try {
      if (!storeId) {
        // Tanpa storeId, kembalikan array kosong (bukan semua branch global)
        return [];
      }
      const { data, error } = await supabase
        .from('shipping_branches')
        .select('*')
        .eq('store_id', storeId)
        .order('is_default', { ascending: false });

      if (!error && data && data.length > 0) {
        const branches = data.map(mapDbRowToBranch);
        this.saveBranches(storeId, branches);
        return branches;
      }
    } catch (err) {
      console.warn('[Supabase Database] Falling back to local branch storage:', err);
    }

    // 2. Ambil dari LocalStorage (partisi per storeId)
    if (storeId) {
      const localBranches = this.getStoredBranches(storeId);
      if (localBranches.length > 0) {
        return localBranches;
      }

      return [];
    }

    return [];
  }

  async getBranchById(id: string, storeId?: string): Promise<ShippingBranch | undefined> {
    const branches = await this.getBranches(storeId);
    return branches.find((b) => b.id === id);
  }

  async getDefaultBranch(storeId?: string): Promise<ShippingBranch | undefined> {
    const branches = await this.getBranches(storeId);
    if (branches.length > 0) {
      return (
        branches.find((b) => b.isDefault && b.isActive) ||
        branches.find((b) => b.isDefault) ||
        branches[0]
      );
    }
    return undefined;
  }

  async createBranch(
    branchData: Omit<ShippingBranch, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ShippingBranch> {
    const storeId = branchData.storeId || '';
    const branches = this.getStoredBranches(storeId);
    const newId = await idService.generateNextId('shipping_branches');

    // Jika ini cabang pertama untuk toko tersebut, jadikan default otomatis
    const isFirstBranch = branches.length === 0;
    const isDefault = branchData.isDefault || isFirstBranch;

    // Jika diset default, nonaktifkan default cabang lain milik toko yang sama
    let updatedList = branches;
    if (isDefault) {
      updatedList = updatedList.map((b) => ({ ...b, isDefault: false }));
    }

    const newBranch: ShippingBranch = {
      ...branchData,
      id: newId,
      isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updatedList.unshift(newBranch);
    this.saveBranches(storeId, updatedList);

    // Sync ke Supabase jika tersedia
    try {
      await supabase.from('shipping_branches').insert([
        {
          id: newBranch.id,
          store_id: storeId || '',
          branch_name: newBranch.branchName,
          pic_name: newBranch.picName,
          pic_phone: newBranch.picPhone,
          address: newBranch.address,
          subdistrict: newBranch.subdistrict,
          city: newBranch.city,
          province: newBranch.province,
          postal_code: newBranch.postalCode,
          is_default: newBranch.isDefault,
          is_active: newBranch.isActive,
        },
      ]);
    } catch (err) {
      console.warn('Supabase branch sync skipped:', err);
    }

    return newBranch;
  }

  async updateBranch(
    id: string,
    updates: Partial<Omit<ShippingBranch, 'id'>>
  ): Promise<ShippingBranch> {
    const storeId = updates.storeId || '';
    const branches = this.getStoredBranches(storeId);
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Cabang gudang tidak ditemukan');

    let updatedList = [...branches];

    if (updates.isDefault) {
      // Hanya nonaktifkan default untuk branch milik toko yang sama
      updatedList = updatedList.map((b) => ({ ...b, isDefault: false }));
    }

    const updatedBranch: ShippingBranch = {
      ...updatedList[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    updatedList[index] = updatedBranch;
    this.saveBranches(storeId || updatedBranch.storeId || '', updatedList);

    try {
      await supabase
        .from('shipping_branches')
        .update({
          branch_name: updatedBranch.branchName,
          pic_name: updatedBranch.picName,
          pic_phone: updatedBranch.picPhone,
          address: updatedBranch.address,
          subdistrict: updatedBranch.subdistrict,
          city: updatedBranch.city,
          province: updatedBranch.province,
          postal_code: updatedBranch.postalCode,
          is_default: updatedBranch.isDefault,
          is_active: updatedBranch.isActive,
          updated_at: updatedBranch.updatedAt,
        })
        .eq('id', id)
        .eq('store_id', updatedBranch.storeId || storeId); // ownership check
    } catch (err) {
      console.warn('Supabase branch update skipped:', err);
    }

    return updatedBranch;
  }

  async setDefaultBranch(id: string, storeId?: string): Promise<ShippingBranch> {
    const branches = this.getStoredBranches(storeId);
    const target = branches.find((b) => b.id === id);
    if (!target) throw new Error('Cabang gudang tidak ditemukan');

    const resolvedStoreId = storeId || target.storeId || '';

    const updatedList = branches.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }));

    this.saveBranches(resolvedStoreId, updatedList);

    try {
      // Hanya update is_default=false untuk branch milik toko yang sama (ownership check!)
      await supabase
        .from('shipping_branches')
        .update({ is_default: false })
        .eq('store_id', resolvedStoreId) // <-- KUNCI: hanya toko ini
        .neq('id', id);

      await supabase
        .from('shipping_branches')
        .update({ is_default: true })
        .eq('id', id)
        .eq('store_id', resolvedStoreId); // ownership check
    } catch (err) {
      console.warn('Supabase set default branch skipped:', err);
    }

    return { ...target, isDefault: true };
  }

  async toggleActiveBranch(id: string, storeId?: string): Promise<ShippingBranch> {
    let resolvedStoreId = storeId;
    let target: ShippingBranch | undefined;
    if (resolvedStoreId) {
      const branches = this.getStoredBranches(resolvedStoreId);
      target = branches.find((b) => b.id === id);
    }
    if (!target) {
      try {
        const { data } = await supabase.from('shipping_branches').select('*').eq('id', id).maybeSingle();
        if (data) {
          target = mapDbRowToBranch(data);
          resolvedStoreId = target.storeId;
        }
      } catch { /* ignore */ }
    }
    if (!target) throw new Error('Cabang gudang tidak ditemukan');

    return this.updateBranch(id, { isActive: !target.isActive, storeId: resolvedStoreId || target.storeId });
  }

  async deleteBranch(id: string, storeId?: string): Promise<boolean> {
    // 1. Resolve store ID and branch info from Supabase or local cache
    let resolvedStoreId = storeId;
    let targetBranch: any = null;

    try {
      const { data, error } = await supabase
        .from('shipping_branches')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        targetBranch = data;
        if (!resolvedStoreId) {
          resolvedStoreId = data.store_id;
        }
      }
    } catch (err) {
      console.warn('Supabase fetch branch before delete error:', err);
    }

    if (!resolvedStoreId && targetBranch?.store_id) {
      resolvedStoreId = targetBranch.store_id;
    }

    // 2. Check total branches directly from actual database data for this store
    if (resolvedStoreId) {
      try {
        const { data: dbBranches, error: listError } = await supabase
          .from('shipping_branches')
          .select('id, is_default, store_id')
          .eq('store_id', resolvedStoreId);

        if (!listError && dbBranches) {
          if (dbBranches.length <= 1) {
            throw new Error('Minimal harus ada 1 cabang gudang yang terdaftar');
          }

          const targetInDb = dbBranches.find((b) => b.id === id);
          if (targetInDb?.is_default || targetBranch?.is_default) {
            throw new Error('Cabang utama tidak dapat dihapus. Silakan jadikan cabang lain sebagai cabang utama terlebih dahulu.');
          }

          // Execute actual database delete with strict store_id ownership check
          const { error: deleteError } = await supabase
            .from('shipping_branches')
            .delete()
            .eq('id', id)
            .eq('store_id', resolvedStoreId);

          if (deleteError) {
            throw new Error(`Gagal menghapus cabang dari database: ${deleteError.message}`);
          }

          // Update local cache
          const cachedBranches = this.getStoredBranches(resolvedStoreId);
          const updatedCache = cachedBranches.filter((b) => b.id !== id);
          localStorage.setItem(this.storeKey(resolvedStoreId), JSON.stringify(updatedCache));

          return true;
        }
      } catch (dbErr: any) {
        if (dbErr.message === 'Minimal harus ada 1 cabang gudang yang terdaftar' || 
            dbErr.message.includes('Cabang utama tidak dapat dihapus')) {
          throw dbErr;
        }
        console.warn('Supabase database count failed, falling back to local verification:', dbErr);
      }
    }

    // 3. Fallback verification if database was completely offline
    const localBranches = this.getStoredBranches(resolvedStoreId);
    if (localBranches.length <= 1) {
      throw new Error('Minimal harus ada 1 cabang gudang yang terdaftar');
    }

    const localTarget = localBranches.find((b) => b.id === id);
    if (localTarget?.isDefault) {
      throw new Error('Cabang utama tidak dapat dihapus. Silakan jadikan cabang lain sebagai cabang utama terlebih dahulu.');
    }

    const fallbackStoreId = resolvedStoreId || localTarget?.storeId || '';
    const updatedList = localBranches.filter((b) => b.id !== id);
    if (fallbackStoreId) {
      localStorage.setItem(this.storeKey(fallbackStoreId), JSON.stringify(updatedList));
    }

    return true;
  }
}

export const branchService = new BranchService();
