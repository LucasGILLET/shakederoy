'use client';

import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Register() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

                    <form className="space-y-6">
                        <Input
                            label="Pseudo"
                            type="text"
                            placeholder="Mixologist_Du_92"
                            required
                        />
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

                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border-4 border-yellow-200 transform skewX(-2deg)">
                            <input type="checkbox" id="terms" className="mt-1 w-5 h-5 border-2 border-gray-300 accent-brand-primary" required />
                            <label htmlFor="terms" className="text-sm text-gray-700 font-medium leading-relaxed transform skewX(2deg)">
                                J'accepte les conditions générales et je certifie avoir l'âge légal pour consommer de l'alcool. 🔞
                            </label>
                        </div>

                        <Button className="w-full justify-center !btn-skew-secondary" size="lg">S'inscrire</Button>
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
