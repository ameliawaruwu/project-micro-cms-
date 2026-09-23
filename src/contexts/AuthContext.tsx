import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Merchant, Store } from '../types';
import { authService } from '../services/authService';
import { supabase, signInWithGoogleOAuth } from '../services/supabaseClient';


  interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  store: Store | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
    autoLogin?: boolean;
  }) => Promise<{ user: User; merchant: Merchant; store: Store }>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyResetToken: (email: string, token: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>;
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
    const initAuth = async () => {
      try {
        // 1. Check local session & validate with Supabase database
        const current = authService.getCurrentUser();
        if (current.user) {
          const isValid = await authService.validateSessionWithDatabase(current.user.id, current.user.email);
          if (isValid) {
            setUser(current.user);
            setMerchant(current.merchant);
            setStore(current.store);
          } else {
            console.warn('[AuthContext] Sesi dibatalkan karena akun telah dihapus dari database Supabase.');
            setUser(null);
            setMerchant(null);
            setStore(null);
          }
        }

        // 2. Check Supabase OAuth session (if redirected from Google)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && session.user.email) {
          const googleUser = session.user;
          const userMeta = googleUser.user_metadata || {};
          const googleEmail = googleUser.email.toLowerCase().trim();
          const fullName = userMeta.full_name || userMeta.name || googleEmail.split('@')[0];
          const avatarUrl = userMeta.avatar_url || userMeta.picture;

          const pendingStoreName = sessionStorage.getItem('oauth_pending_store_name');
          sessionStorage.removeItem('oauth_pending_store_name');
          sessionStorage.removeItem('oauth_intent');

          const exists = await authService.checkAccountExists(googleEmail);

          let authData: { user: User; merchant: Merchant; store: Store | null };
          if (!exists) {
            // New user from Google OAuth: register user & merchant without auto-creating a store
            authData = await authService.registerWithGoogle({
              googleEmail,
              fullName,
              avatarUrl,
            });
          } else {
            // Existing user: log in directly
            authData = await authService.login(googleEmail, 'google-auth');
          }

          setUser(authData.user);
          setMerchant(authData.merchant);
          setStore(authData.store);
          window.dispatchEvent(new CustomEvent('auth_google_success', { detail: authData }));
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogleOAuth();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

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
    autoLogin?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const data = await authService.register(params);
      if (params.autoLogin) {
        setUser(data.user);
        setMerchant(data.merchant);
        setStore(data.store);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };


  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const verifyResetToken = async (email: string, token: string) => {
    return authService.verifyResetToken(email, token);
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    return authService.resetPassword(email, token, newPassword);
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
        loginWithGoogle,
        registerWithGoogle,
        register,
        forgotPassword,
        verifyResetToken,
        resetPassword,
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
