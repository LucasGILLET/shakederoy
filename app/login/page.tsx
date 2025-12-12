'use client';

import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Login() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

                    <form className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            required
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        <Button className="w-full justify-center" size="lg">Se connecter</Button>

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
