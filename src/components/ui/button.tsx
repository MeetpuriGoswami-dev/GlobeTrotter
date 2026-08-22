import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export function Button({ className, variant = 'default', isLoading, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    default: 'bg-[#1a3a6b] text-white hover:bg-[#15305a] focus:ring-[#1a3a6b]',
    outline: 'border-2 border-[#1a3a6b] text-[#1a3a6b] bg-white hover:bg-[#f0f4ff] focus:ring-[#1a3a6b]',
    ghost: 'text-[#1a3a6b] hover:bg-[#f0f4ff]',
  };
  return (
    <button className={cn(base, variants[variant], className)} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
