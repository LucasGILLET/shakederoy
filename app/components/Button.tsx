import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "btn-skew";

  const variants = {
    primary: "",
    secondary: "btn-skew-secondary",
    outline: "btn-skew-outline",
  };

  const sizes = {
    sm: "!px-4 !py-2 !text-sm",
    md: "!px-6 !py-3 !text-base",
    lg: "!px-8 !py-4 !text-lg",
  };

  const variantClass = variant === 'primary' ? baseStyles : variants[variant];

  return (
    <button
      className={clsx(variantClass, sizes[size], className)}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}
