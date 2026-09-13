import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'danger' | 'success';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border backdrop-blur-xl transition-all duration-300',
          {
            'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10': variant === 'default',
            'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]': variant === 'highlight',
            'bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]': variant === 'danger',
            'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]': variant === 'success',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
