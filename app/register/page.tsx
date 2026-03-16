'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { useAuth } from '@/app/context/AuthContext';

export default function Register() {
    const [mounted, setMounted] = useState(false);
    const { register, user, loading: authLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (!terms) {
            setError('Veuillez accepter les conditions generales.');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    if (!authLoading && user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <div className="w-full max-w-md card-skew !p-10 bg-gradient-to-br from-white to-purple-50 text-center">
                    <div className="transform skewY(2deg)">
                        <h1 className="text-4xl font-display mb-4">Compte deja actif</h1>
                        <p className="text-gray-600 text-lg mb-6">Tu es deja connecte.</p>
                        <Link href="/catalogue">
                            <Button className="w-full justify-center" size="lg">
                                Aller au catalogue
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className={`w-full max-w-md card-skew !p-10 bg-gradient-to-br from-white to-purple-50 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}>
                <div className="transform skewY(2deg)">
                    <div className="text-center mb-8">
                        <div className="inline-block text-6xl mb-4 animate-wiggle">*</div>
                        <h1 className="text-4xl font-display mb-2 hover-bounce">
                            Rejoins le <span className="text-brand-secondary">club</span>
                        </h1>
                        <p className="text-gray-600 text-lg">Cree ton compte gratuitement.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Pseudo"
                            type="text"
                            placeholder="Mixologist_92"
                            required
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="Choisis un mot de passe"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border-4 border-yellow-200 transform skewX(-2deg)">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-5 h-5 border-2 border-gray-300 accent-brand-primary"
                                required
                                checked={terms}
                                onChange={(event) => setTerms(event.target.checked)}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700 font-medium leading-relaxed transform skewX(2deg)">
                                J'accepte les conditions generales et je certifie avoir l'age legal pour consommer de l'alcool.
                            </label>
                        </div>

                        <Button className="w-full justify-center !btn-skew-secondary" size="lg" disabled={loading}>
                            {loading ? 'Inscription...' : "S'inscrire"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-lg">
                        Deja un compte ?{' '}
                        <Link href="/login" className="font-bold text-brand-primary hover:underline hover-scale inline-block">
                            Connexion
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
