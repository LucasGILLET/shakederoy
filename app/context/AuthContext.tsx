'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credential: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const profile = await apiFetch<UserProfile>('/users/self');
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const profile = await apiFetch<UserProfile>('/users/self');
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credential: string, password: string) => {
    await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential, password }),
    });

    await refreshUser();
    router.push('/catalogue');
    router.refresh();
  };

  const register = async (username: string, email: string, password: string) => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    await refreshUser();
    router.push('/catalogue');
    router.refresh();
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout');
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
