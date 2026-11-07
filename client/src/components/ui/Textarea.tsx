import React, { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
