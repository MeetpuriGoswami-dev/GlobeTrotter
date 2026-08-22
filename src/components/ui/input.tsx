import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ className, icon, rightIcon, ...props }: InputProps) {
  if (icon || rightIcon) {
    return (
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400 pointer-events-none">{icon}</span>}
        <input
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-white py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-all',
            icon – 'pl-10' : 'pl-4',
            rightIcon – 'pr-10' : 'pr-4',
            className
          )}
          {...props}
        />
        {rightIcon && <span className="absolute right-3 text-gray-400">{rightIcon}</span>}
      </div>
    );
  }
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-all',
        className
      )}
      {...props}
    />
  );
}
