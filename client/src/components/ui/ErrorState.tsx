import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-2">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 text-xs text-rose-700 max-w-sm">{message}</p>
      {onRetry && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            className="border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
