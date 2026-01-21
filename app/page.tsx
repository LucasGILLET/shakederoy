'use client';

import { Button } from "./components/Button";
import Link from "next/link";
import { ArrowRight, Zap, Sparkles, Flame, Trophy, PartyPopper, ChefHat, Users, MapPin, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-[#FFF9F0]">
      {/* Intro Overlay - Only connects to first load logic if we had one, keeping it simple for now */}

      {/* Hero Section - Ultra Interactive */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center border-b-8 border-brand-dark overflow-hidden"
      >
        {/* Animated line background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          {/* Horizontal lines */}
          {[...Array(12)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 100 + 50}
              x2="100%"
              y2={i * 100 + 50}
              stroke="#2D3748"
              strokeWidth="3"
              strokeDasharray="2000"
              strokeDashoffset="2000"
              className="animate-draw-line"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s',
                animationFillMode: 'forwards'
              }}
            />
          ))}

          {/* Vertical lines */}
          {[...Array(20)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2="100%"
              stroke="#2D3748"
              strokeWidth="3"
              strokeDasharray="2000"
              strokeDashoffset="2000"
              className="animate-draw-line"
              style={{
                animationDelay: `${i * 0.08}s`,
                animationDuration: '2s',
                animationFillMode: 'forwards'
              }}
            />
          ))}
        </svg>

        {/* Floating parallax elements reacting to mouse */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 text-9xl opacity-20 animate-float transition-transform duration-100 ease-out"
            style={{ transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)` }}>🍹</div>
          <div className="absolute top-1/4 right-20 text-8xl opacity-20 animate-float transition-transform duration-100 ease-out"
            style={{ animationDelay: '1s', transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)` }}>🧊</div>
          <div className="absolute bottom-20 left-1/3 text-[10rem] opacity-10 animate-float transition-transform duration-100 ease-out"
            style={{ animationDelay: '2s', transform: `translate(${mousePos.x * -4}px, ${mousePos.y * -4}px)` }}>🍋</div>
        </div>

        <div className="relative z-10 text-center max-w-7xl mx-auto px-4">
          <div className={`inline-block mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}>
            <span className="bg-brand-secondary text-brand-dark font-black text-xl md:text-2xl px-8 py-3 border-4 border-brand-dark shadow-[8px_8px_0px_0px_rgba(45,55,72,1)]">
              V2.0 • L'APP ULTIME
            </span>
          </div>

          <h1 className="mb-12 relative group cursor-default">
            <div className={`text-[6rem] md:text-[13rem] font-display leading-[0.8] mb-2 text-brand-dark transition-all duration-300 group-hover:tracking-widest ${mounted ? 'animate-slide-left' : 'opacity-0'}`}>
              SHAKE
              <span className="text-brand-primary absolute -top-4 -right-8 md:right-20 text-8xl animate-bounce">.</span>
            </div>
            <div className={`text-[6rem] md:text-[13rem] font-display leading-[0.8] text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary relative ${mounted ? 'animate-slide-right' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              DE ROY
              {/* Decorative underline */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-brand-tertiary -z-10 opacity-60 skew-x-12 mix-blend-multiply group-hover:scale-x-110 transition-transform"></div>
            </div>
          </h1>

          <div className={`flex flex-col md:flex-row gap-6 justify-center items-center ${mounted ? 'animate-bounce-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <Link href="/catalogue">
              <button className="btn-skew group relative overflow-hidden text-2xl px-12 py-6 bg-brand-dark text-white hover:text-brand-tertiary transition-colors">
                <span className="relative z-10 flex items-center gap-3">
                  EXPLORER <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </span>
                {/* Hover fill effect */}
                <div className="absolute inset-0 bg-brand-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </Link>
            <Link href="/party">
              <button className="text-xl font-bold border-b-4 border-brand-dark pb-1 hover:text-brand-primary hover:border-brand-primary transition-all">
                Mode Soirée ?
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee Section - Infinite Scroll */}
      <div className="bg-brand-primary border-b-8 border-brand-dark py-6 overflow-hidden transform -skew-y-2 origin-left scale-110 z-20">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-white font-black text-4xl uppercase tracking-widest">
          <span>Shake it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Taste it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Love it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Share it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Repeat</span> <Star className="fill-brand-tertiary text-brand-dark" />

          {/* Duplicate for seamless loop */}
          <span>Shake it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Taste it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Love it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Share it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Repeat</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Shake it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Taste it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Love it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Share it</span> <Star className="fill-brand-tertiary text-brand-dark" />
          <span>Repeat</span> <Star className="fill-brand-tertiary text-brand-dark" />
        </div>
      </div>

      {/* La Vibe Section - Asymmetric Grid */}
      <section className="py-32 px-4 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-8">
          {/* Title - Vertical */}
          <div className="col-span-12 md:col-span-2 flex md:justify-center items-center">
            <h2 className="text-8xl md:vertical-text font-display text-brand-dark md:rotate-180 md:writing-mode-vertical uppercase tracking-tighter opacity-10">
              LA VIBE • LA VIBE
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="col-span-12 md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { emoji: '🔥', title: 'Découvre', desc: 'Des recettes de ouf. Du classique au WTF.', color: 'bg-[#FFDEE9]' },
              { emoji: '🎊', title: 'Organise', desc: 'Mode Soirée = tes potes, tes règles, nos calculs.', color: 'bg-[#C1F0F6]' },
              { emoji: '🎨', title: 'Crée', desc: 'Deviens le barman légendaire que tu as toujours rêvé d\'être.', color: 'bg-[#E2F0CB]' },
              { emoji: '📍', title: 'Explore', desc: 'Trouve les spots les plus cachés de ta ville.', color: 'bg-[#F0E68C]' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`card-skew ${item.color} p-12 hover:scale-105 transition-all duration-500 group border-4 border-brand-dark shadow-[12px_12px_0px_0px_rgba(45,55,72,1)] hover:shadow-[16px_16px_0px_0px_rgba(45,55,72,1)]`}
              >
                <div className="transform skewY(2deg)">
                  <div className="text-8xl mb-8 group-hover:scale-125 transition-transform duration-300 inline-block">{item.emoji}</div>
                  <h3 className="text-5xl font-display mb-4 text-brand-dark">{item.title}</h3>
                  <p className="text-xl font-bold text-brand-dark/80">{item.desc}</p>

                  <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <ArrowRight className="w-12 h-12 text-brand-dark" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section - 3D Card Effect */}
      <section className="py-40 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-[#FFF9F0] rounded-b-[50%] transform scale-x-110"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <div className="inline-block bg-brand-tertiary text-brand-dark px-6 py-2 font-black transform -rotate-3 border-2 border-white">
              COCKTAIL DU MOMENT
            </div>
            <h2 className="text-8xl font-display leading-[0.9]">
              LE <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">MOJITO</span><br />
              ROYAL
            </h2>
            <p className="text-2xl text-gray-400 max-w-lg">
              Une explosion de fraîcheur avec une touche de luxe. Le classique revisité pour les rois et reines de la soirée.
            </p>
            <div className="flex gap-4 pt-8">
              <Button className="!bg-white !text-brand-dark hover:!bg-brand-primary hover:!text-white !border-none text-xl px-10 py-6">
                Voir la recette
              </Button>
            </div>
          </div>

          <div className="flex-1 relative perspective-1000">
            <div className="relative w-full aspect-square bg-gradient-to-br from-green-400 to-blue-500 rounded-[3rem] border-8 border-white shadow-[0px_20px_50px_rgba(78,205,196,0.5)] transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out group">
              <div className="absolute inset-0 flex items-center justify-center text-[15rem] group-hover:scale-110 transition-transform duration-500">
                🍹
              </div>
              {/* Floating Cards */}
              <div className="absolute -right-10 top-10 bg-white text-brand-dark p-6 rounded-2xl shadow-xl transform translate-z-20 group-hover:translate-x-4 transition-transform delay-100">
                <div className="font-bold text-sm uppercase text-gray-400">Note</div>
                <div className="text-4xl font-black">4.9/5</div>
              </div>
              <div className="absolute -left-10 bottom-20 bg-brand-primary text-white p-6 rounded-2xl shadow-xl transform translate-z-30 group-hover:-translate-x-4 transition-transform delay-200">
                <div className="font-bold text-sm uppercase opacity-80">Difficulté</div>
                <div className="text-3xl font-black">Easy</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-20 bg-[#FFF9F0] rounded-t-[50%] transform scale-x-110"></div>
      </section>

      {/* Hall of Fame - Marquee Reverse */}
      <section className="py-20 mb-20 overflow-hidden">
        <h2 className="text-center text-4xl font-bold uppercase tracking-[1rem] mb-12 opacity-30">Hall of Fame</h2>

        <div className="whitespace-nowrap animate-marquee-reverse flex gap-8">
          {[1, 2, 3, 4, 1, 2, 3, 4].map((i, idx) => (
            <div key={idx} className="w-96 h-64 bg-white border-4 border-brand-dark shadow-[8px_8px_0px_0px_rgba(45,55,72,1)] p-8 flex flex-col justify-center items-center shrink-0 hover:bg-brand-tertiary transition-colors">
              <div className="text-6xl mb-4">{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🏅'}</div>
              <div className="text-3xl font-display">Champion #{i}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 pb-32 text-center">
        <div className="max-w-4xl mx-auto bg-brand-primary p-20 rounded-[4rem] border-8 border-brand-dark shadow-[20px_20px_0px_0px_rgba(45,55,72,1)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-7xl md:text-9xl font-display text-white mb-8 group-hover:scale-105 transition-transform duration-500">
              READY ?
            </h2>
            <Button size="lg" className="text-3xl px-16 py-8 !bg-brand-active !text-brand-dark !border-white hover:!scale-110 !skew-x-0 !rounded-full">
              JE ME LANCE 🚀
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
