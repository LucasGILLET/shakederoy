'use client';

import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function Login() {
    const [mounted, setMounted] = useState(false);
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className={`w-full max-w-md card-skew !p-10 bg-gradient-to-br from-white to-pink-50 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}>
                <div className="transform skewY(2deg)">
                    <div className="text-center mb-8">
                        <div className="inline-block text-6xl mb-4 animate-wiggle">👋</div>
                        <h1 className="text-4xl font-display mb-2 hover-bounce">
                            Bon <span className="text-brand-primary">Retour !</span>
                        </h1>
                        <p className="text-gray-600 text-lg">Connectez-vous pour continuer</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button 
                            className="w-full justify-center" 
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>

                        <div className="text-center text-base font-bold text-gray-400 my-6">OU</div>

                        <Button type="button" variant="outline" className="w-full justify-center">
                            <span className="text-2xl">🔐</span>
                            Continuer avec Google
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-lg">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="font-bold text-brand-primary hover:underline hover-scale inline-block">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
