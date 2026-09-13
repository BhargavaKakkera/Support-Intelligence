'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TerminalSquare, GitCommit, BarChart3, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Agent Console', href: '/console', icon: TerminalSquare },
  { name: 'Architecture', href: '/pipeline', icon: GitCommit },
  { name: 'Evaluation', href: '/evaluation', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen border-r border-white/[0.08] bg-zinc-950/80 backdrop-blur-3xl flex flex-col justify-between fixed top-0 left-0 z-50">
      
      {/* Workspace Selector Mock */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-inner flex items-center justify-center border border-white/10">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div className="text-left">
              <h1 className="font-semibold text-zinc-100 tracking-tight text-sm leading-tight group-hover:text-white transition-colors">Hiver AI</h1>
              <p className="text-[11px] text-zinc-500 font-medium">Enterprise Tier</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-3">
          Support Intelligence
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] font-medium'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-3">
          Resources
        </div>
        <nav className="space-y-0.5">
          <Link
            href="/about"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
              pathname === '/about'
                ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] font-medium'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            )}
          >
            <Info className={cn("w-4 h-4 transition-colors", pathname === '/about' ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400")} />
            Project Philosophy
          </Link>
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 pb-6 mt-auto">
        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/[0.04]">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Organization</div>
          <div className="text-sm font-medium text-zinc-300 mb-4">AmazonHelp Support</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full bg-emerald-500/20 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] relative z-10" />
              </div>
              <span className="text-xs font-medium text-zinc-400">All systems online</span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
