import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">{label}</label>}
            <input
                className={clsx(
                    "w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md transform skewX(-2deg) focus:skewX(0deg)",
                    error ? "border-red-400 focus:border-red-500" : "",
                    className
                )}
                {...props}
            />
            {error && <span className="text-red-500 text-sm font-bold mt-2 block">{error}</span>}
        </div>
    );
}
