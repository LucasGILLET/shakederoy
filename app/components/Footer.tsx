export function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16 border-t-8 border-brand-tertiary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div>
                        <h3 className="font-display text-3xl mb-4 text-brand-tertiary">SHAKEDEROY</h3>
                        <p className="text-gray-300 leading-relaxed">
                            L'app qui met l'ambiance 🎉
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-4 text-white">Explorer</h4>
                        <ul className="space-y-3">
                            <li><a href="/catalogue" className="hover:text-brand-secondary transition-colors text-gray-300">Tous les cocktails</a></li>
                            <li><a href="/trends" className="hover:text-brand-secondary transition-colors text-gray-300">Tendances</a></li>
                            {/* <li><a href="/bars" className="hover:text-brand-secondary transition-colors text-gray-300">Map des bars</a></li> */}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-4 text-white">Communauté</h4>
                        <ul className="space-y-3">
                            <li><a href="/login" className="hover:text-brand-secondary transition-colors text-gray-300">Connexion</a></li>
                            <li><a href="/register" className="hover:text-brand-secondary transition-colors text-gray-300">Créer un compte</a></li>
                            <li><a href="/party" className="hover:text-brand-secondary transition-colors text-gray-300">Mode Soirée</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-4 text-white">Infos</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-brand-secondary transition-colors text-gray-300">À propos</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors text-gray-300">Contact</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors text-gray-300">Mentions légales</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
                    <p className="font-semibold">Made with 💜 by ShakeDeRoy • {new Date().getFullYear()}</p>
                </div>
            </div>
        </footer>
    );
}
