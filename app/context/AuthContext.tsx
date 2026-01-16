'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiFetch<any>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ credential: email, password }),
            });
            
            console.log('Login response:', response);

            if (response.sub) {
                const userData: User = {
                    id: response.sub.id,
                    username: response.sub.username,
                    email: email,   
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                router.push('/catalogue');
                router.refresh();
            } else {
                 console.warn("Unexpected login response:", response);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await apiFetch<any>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            
            if (response.sub) {
                const userData: User = {
                    id: response.sub.id,
                    username: response.sub.username,
                    email: email,
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                router.push('/catalogue');
                router.refresh();
            } else {
                await login(email, password);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
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
