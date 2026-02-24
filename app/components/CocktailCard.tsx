import Link from 'next/link';
import { ArrowUpRight, Clock, Gauge } from 'lucide-react';
import clsx from 'clsx';

interface CocktailCardProps {
    id: string;
    name: string;
    image?: string | null;
    tags: string[];
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    duration: string;
    alcohol: boolean;
}

export function CocktailCard({ id, name, image, tags, difficulty, duration, alcohol }: CocktailCardProps) {
    return (
        <Link href={`/cocktail/${id}`} className="block group">
            <div className="card-skew h-full flex flex-col">
                <div className="transform skewY(2deg)">
                    <div className={clsx(
                        "w-full h-48 mb-4 flex items-center justify-center relative overflow-hidden",
                        alcohol ? "bg-gradient-to-br from-pink-200 to-purple-200" : "bg-gradient-to-br from-green-200 to-teal-200"
                    )}>
                        {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <span className="font-display text-brand-dark opacity-20 text-5xl group-hover:scale-125 transition-transform duration-300">
                                {name.substring(0, 2)}
                            </span>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                            {!alcohol && (
                                <div className="badge-skew !bg-gradient-to-r !from-green-400 !to-emerald-400">
                                    <span>Sans Alcool</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-display leading-tight group-hover:text-brand-primary transition-colors hover-bounce">
                                {name}
                            </h3>
                            <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-brand-dark border-2 border-yellow-300 transform skewX(-5deg)">
                                    <span className="inline-block transform skewX(5deg)">{tag}</span>
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-gray-600 pt-4 border-t-2 border-dashed border-gray-200">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {duration}
                            </div>
                            <div className="flex items-center gap-1">
                                <Gauge className="w-4 h-4" />
                                {difficulty}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
