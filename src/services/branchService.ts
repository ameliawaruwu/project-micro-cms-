import { ShippingBranch } from '../types';
import { supabase } from './supabaseClient';

const BRANCHES_STORAGE_KEY = 'microcms_shipping_branches_v1';

export const initialBranches: ShippingBranch[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    storeId: 'store-andhika',
    branchName: 'Gudang Pusat Jakarta',
    picName: 'Andhika Pratama',
    picPhone: '081298765432',
    address: 'Jl. Kemang Raya No. 42, RT 04 / RW 02',
    subdistrict: 'Bangka, Mampang Prapatan',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    storeId: 'store-andhika',
    branchName: 'Cabang Logistik Surabaya',
    picName: 'Budi Santoso',
    picPhone: '081377889900',
    address: 'Jl. Rungkut Industri Raya No. 15',
    subdistrict: 'Kali Rungkut',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    postalCode: '60293',
    isDefault: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    storeId: 'store-andhika',
    branchName: 'Hub Distribusi Bandung',
    picName: 'Rina Kusuma',
    picPhone: '081223344556',
    address: 'Jl. Soekarno Hatta No. 590',
    subdistrict: 'Buahbatu',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    postalCode: '40286',
    isDefault: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

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
  private getStoredBranches(): ShippingBranch[] {
    const data = localStorage.getItem(BRANCHES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(initialBranches));
      return initialBranches;
    }
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialBranches;
    } catch {
      return initialBranches;
    }
  }

  private saveBranches(branches: ShippingBranch[]) {
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
  }

  async getBranches(storeId?: string): Promise<ShippingBranch[]> {
    try {
      let query = supabase.from('shipping_branches').select('*').order('is_default', { ascending: false });
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const branches = data.map(mapDbRowToBranch);
        this.saveBranches(branches);
        return branches;
      }
    } catch (err) {
      console.warn('[Supabase Database] Falling back to local branch storage:', err);
    }

    const localBranches = this.getStoredBranches();
    if (storeId) {
      const filtered = localBranches.filter((b) => !b.storeId || b.storeId === storeId);
      return filtered.length > 0 ? filtered : localBranches;
    }
    return localBranches;
  }

  async getBranchById(id: string): Promise<ShippingBranch | undefined> {
    const branches = await this.getBranches();
    return branches.find((b) => b.id === id);
  }

  async getDefaultBranch(storeId?: string): Promise<ShippingBranch> {
    const branches = await this.getBranches(storeId);
    return branches.find((b) => b.isDefault && b.isActive) || branches.find((b) => b.isDefault) || branches[0] || initialBranches[0];
  }

  async createBranch(
    branchData: Omit<ShippingBranch, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ShippingBranch> {
    const branches = this.getStoredBranches();
    const newId = crypto.randomUUID ? crypto.randomUUID() : `brn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Jika diset default, nonaktifkan default cabang lain
    let updatedList = branches;
    if (branchData.isDefault) {
      updatedList = updatedList.map((b) => ({ ...b, isDefault: false }));
    }

    const newBranch: ShippingBranch = {
      ...branchData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updatedList.unshift(newBranch);
    this.saveBranches(updatedList);

    // Sync ke Supabase jika tersedia
    try {
      await supabase.from('shipping_branches').insert([
        {
          id: newBranch.id,
          store_id: newBranch.storeId || 'store-andhika',
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
    const branches = this.getStoredBranches();
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Cabang gudang tidak ditemukan');

    let updatedList = [...branches];

    if (updates.isDefault) {
      updatedList = updatedList.map((b) => ({ ...b, isDefault: false }));
    }

    const updatedBranch: ShippingBranch = {
      ...updatedList[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    updatedList[index] = updatedBranch;
    this.saveBranches(updatedList);

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
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase branch update skipped:', err);
    }

    return updatedBranch;
  }

  async setDefaultBranch(id: string, storeId?: string): Promise<ShippingBranch> {
    const branches = this.getStoredBranches();
    const target = branches.find((b) => b.id === id);
    if (!target) throw new Error('Cabang gudang tidak ditemukan');

    const updatedList = branches.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }));

    this.saveBranches(updatedList);

    try {
      await supabase
        .from('shipping_branches')
        .update({ is_default: false })
        .neq('id', id);

      await supabase
        .from('shipping_branches')
        .update({ is_default: true })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase set default branch skipped:', err);
    }

    return { ...target, isDefault: true };
  }

  async toggleActiveBranch(id: string): Promise<ShippingBranch> {
    const branches = this.getStoredBranches();
    const target = branches.find((b) => b.id === id);
    if (!target) throw new Error('Cabang gudang tidak ditemukan');

    return this.updateBranch(id, { isActive: !target.isActive });
  }

  async deleteBranch(id: string): Promise<boolean> {
    const branches = this.getStoredBranches();
    if (branches.length <= 1) {
      throw new Error('Minimal harus ada 1 cabang gudang yang terdaftar');
    }

    const target = branches.find((b) => b.id === id);
    if (target?.isDefault) {
      throw new Error('Cabang utama tidak dapat dihapus. Silakan jadikan cabang lain sebagai cabang utama terlebih dahulu.');
    }

    const updatedList = branches.filter((b) => b.id !== id);
    this.saveBranches(updatedList);

    try {
      await supabase.from('shipping_branches').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase branch delete skipped:', err);
    }

    return true;
  }
}

export const branchService = new BranchService();
