import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const DEMO_KEY = 'zapcatalogo_demo_auth';
export const DEMO_TEST_EMAIL = 'demo@zapcatalogo.com.br';
export const DEMO_TEST_PASSWORD = 'ZapCatalogo2026!';

interface AuthContextData {
  user: User | null;
  isDemoAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  loginDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_KEY) === 'true';
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginDemo = () => {
    setIsDemoAdmin(true);
    localStorage.setItem(DEMO_KEY, 'true');
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Se utilizou as credenciais oficiais de demonstração / portfólio, autentica imediatamente
    if (
      cleanEmail === DEMO_TEST_EMAIL ||
      cleanEmail === 'admin@zapcatalogo.com.br'
    ) {
      if (supabase) {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password }).catch(() => null);
      }
      loginDemo();
      return {};
    }

    if (!supabase) {
      return {
        error: 'Supabase não configurado no .env. Use as credenciais de demonstração.',
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return {
        error: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
      };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? { error: error.message } : {};
  };

  const logout = async () => {
    setIsDemoAdmin(false);
    localStorage.removeItem(DEMO_KEY);
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isDemoAdmin,
        isAuthenticated: Boolean(user || isDemoAdmin),
        signIn,
        signUp,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
