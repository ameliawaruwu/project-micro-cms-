import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Merchant, Store } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  store: Store | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  registerWithGoogle: (params: {
    googleEmail: string;
    fullName?: string;
    storeName?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  register: (params: {
    fullName: string;
    email: string;
    phoneWhatsApp: string;
    storeName: string;
    storeSlug: string;
    businessCategory: string;
    password: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStore: (updatedStore: Store) => void;
  updateUser: (updatedUser: User) => void;
  switchStore: (newStore: Store) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const current = authService.getCurrentUser();
      setUser(current.user);
      setMerchant(current.merchant);
      setStore(current.store);
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setMerchant(data.merchant);
      setStore(data.store);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async (params: {
    googleEmail: string;
    fullName?: string;
    storeName?: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await authService.registerWithGoogle(params);
      setUser(data.user);
      setMerchant(data.merchant);
      setStore(data.store);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    fullName: string;
    email: string;
    phoneWhatsApp: string;
    storeName: string;
    storeSlug: string;
    businessCategory: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await authService.register(params);
      setUser(data.user);
      setMerchant(data.merchant);
      setStore(data.store);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setMerchant(null);
    setStore(null);
  };

  const updateStore = (updatedStore: Store) => {
    setStore(updatedStore);
    authService.updateActiveStore(updatedStore);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('microcms_auth_user', JSON.stringify(updatedUser));
  };

  const switchStore = (newStore: Store) => {
    setStore(newStore);
    authService.updateActiveStore(newStore);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        store,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerWithGoogle,
        register,
        forgotPassword,
        logout,
        updateStore,
        updateUser,
        switchStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
