"use client";
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
  hover?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  divider?: boolean; // auto insert divider between header/body
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({
  className,
  muted = false,
  hover = false,
  header,
  footer,
  divider = true,
  children,
  ...rest
}, ref) {
  return (
    <div ref={ref} className={clsx('card', muted && 'card-muted', hover && 'card-hover', className)} {...rest}>
      {header && (
        <div className="mb-2">
          <div className="card-header mb-1">{header}</div>
          {divider && <div className="card-divider" />}
        </div>
      )}
      <div className="space-y-3 text-xs leading-relaxed">
        {children}
      </div>
      {footer && (
        <div className="mt-3 pt-2 border-t border-white/5 text-[10px] flex justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
});
