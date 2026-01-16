'use client';

import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function Register() {
    const [mounted, setMounted] = useState(false);
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!terms) {
            setError('Veuillez accepter les conditions générales.');
            return;
        }
        setLoading(true);
        try {
            await register(username, email, password);
        } catch (err: any) {
             setError(err.message || 'Une erreur est survenue lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className={`w-full max-w-md card-skew !p-10 bg-gradient-to-br from-white to-purple-50 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}>
                <div className="transform skewY(2deg)">
                    <div className="text-center mb-8">
                        <div className="inline-block text-6xl mb-4 animate-wiggle">🎉</div>
                        <h1 className="text-4xl font-display mb-2 hover-bounce">
                            Rejoignez le <span className="text-brand-secondary">Club</span>
                        </h1>
                        <p className="text-gray-600 text-lg">Créez votre compte gratuitement</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Pseudo"
                            type="text"
                            placeholder="Mixologist_Du_92"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
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

                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border-4 border-yellow-200 transform skewX(-2deg)">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                className="mt-1 w-5 h-5 border-2 border-gray-300 accent-brand-primary" 
                                required 
                                checked={terms}
                                onChange={(e) => setTerms(e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700 font-medium leading-relaxed transform skewX(2deg)">
                                J'accepte les conditions générales et je certifie avoir l'âge légal pour consommer de l'alcool. 🔞
                            </label>
                        </div>

                        <Button 
                            className="w-full justify-center !btn-skew-secondary" 
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Inscription...' : 'S\'inscrire'}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-lg">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="font-bold text-brand-primary hover:underline hover-scale inline-block">
                            Connexion
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
