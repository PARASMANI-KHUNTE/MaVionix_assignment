import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};
