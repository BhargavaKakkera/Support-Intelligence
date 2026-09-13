'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface PipelineNodeProps {
  stage: number;
  title: string;
  subtitle: string;
  isActive?: boolean;
  isComplete?: boolean;
  status?: 'idle' | 'processing' | 'success' | 'error' | 'warning';
  children?: ReactNode;
  icon?: ReactNode;
}

export function PipelineNode({
  stage,
  title,
  subtitle,
  status = 'idle',
  children,
  icon,
}: PipelineNodeProps) {
  const getBorderColor = () => {
    switch (status) {
      case 'processing': return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'success': return 'border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
      case 'error': return 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'warning': return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default: return 'border-white/10 hover:border-white/20';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'processing': return 'bg-blue-500/10';
      case 'success': return 'bg-emerald-500/10';
      case 'error': return 'bg-rose-500/10';
      case 'warning': return 'bg-amber-500/10';
      default: return 'bg-white/5';
    }
  };

  const getNumberColor = () => {
    switch (status) {
      case 'processing': return 'text-blue-400';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-zinc-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group w-full"
    >
      <div className={cn(
        "relative rounded-xl border backdrop-blur-xl transition-all duration-500 overflow-hidden",
        getBorderColor(),
        getBgColor()
      )}>
        {/* Animated processing background */}
        {status === 'processing' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        <div className="p-4 relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-2">
            <span className={cn("text-xs font-mono font-bold tracking-widest", getNumberColor())}>
              {String(stage).padStart(2, '0')}
            </span>
            {icon && <div className="text-zinc-400">{icon}</div>}
          </div>
          
          <h3 className={cn(
            "text-sm font-semibold mb-1 tracking-wide uppercase",
            status === 'processing' ? 'text-white' : 'text-zinc-200'
          )}>
            {title}
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            {subtitle}
          </p>

          {children && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-zinc-300">
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
