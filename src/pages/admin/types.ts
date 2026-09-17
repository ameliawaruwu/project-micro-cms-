import { LucideIcon } from 'lucide-react';
import { User, Store, WithdrawalRequest, AdminPlatformStats, Order, BillingPlan, BillingSubscription } from '../../types';

export type AdminTab = 'overview' | 'stores' | 'withdrawals' | 'plans' | 'orders-shipping' | 'transactions' | 'settings';

export interface AdminNavItem {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  count?: number;
  badge?: number;
}

export interface PlanFormState {
  name: string;
  slug: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  featuresText: string;
  sortOrder: number;
  isActive: boolean;
}
