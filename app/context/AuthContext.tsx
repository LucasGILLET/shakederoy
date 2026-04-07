'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/app/lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    is_bar_owner: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        const loadCurrentUser = async () => {
            try {
                const currentUser = await apiFetch<User>('/users/self');
                if (!cancelled) {
                    setUser(currentUser);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ credential: email, password }),
        });

        const currentUser = await apiFetch<User>('/users/self');
        setUser(currentUser);
        router.push('/catalogue');
        router.refresh();
    };

    const register = async (username: string, email: string, password: string) => {
        await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });

        const currentUser = await apiFetch<User>('/users/self');
        setUser(currentUser);
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
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
