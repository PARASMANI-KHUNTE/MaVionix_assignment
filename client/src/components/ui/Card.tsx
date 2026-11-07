import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all',
        hoverable && 'hover:border-slate-300 hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
