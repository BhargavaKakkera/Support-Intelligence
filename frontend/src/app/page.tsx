'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { PipelineDiagram } from '@/components/pipeline/PipelineDiagram';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const STATIC_PIPELINE_NODES = [
  { stage: 1, title: 'INTENT', subtitle: 'DistilBERT Transformer' },
  { stage: 2, title: 'RETRIEVE', subtitle: 'BM25 + Embeddings' },
  { stage: 3, title: 'ABSTRACT', subtitle: 'ResolutionExtractor' },
  { stage: 4, title: 'GENERATE', subtitle: 'Gemini LLM' },
  { stage: 5, title: 'VERIFY', subtitle: 'LLMVerifier' },
  { stage: 6, title: 'DECIDE', subtitle: 'AUTO / ESCALATE' },
];

const mockChartData = [
  { time: '00:00', queries: 120, auto: 90 },
  { time: '04:00', queries: 80, auto: 60 },
  { time: '08:00', queries: 250, auto: 180 },
  { time: '12:00', queries: 400, auto: 320 },
  { time: '16:00', queries: 380, auto: 300 },
  { time: '20:00', queries: 200, auto: 160 },
  { time: '24:00', queries: 150, auto: 120 },
];

export default function Dashboard() {
  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-16">
      
      {/* Hero Section */}
      <section className="space-y-8 pt-12 relative">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Hiver Support Intelligence
          </div>
          <h1 className="text-6xl md:text-7xl font-semibold text-white tracking-tighter leading-[1.1]">
            Resolve support queries. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">
              Safely and autonomously.
            </span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-xl leading-relaxed mt-6">
            An intelligent support pipeline that classifies, retrieves, generates and verifies every response before deciding whether AI can handle the customer.
          </p>
          <div className="flex items-center gap-4 pt-8">
            <Link href="/console" className="px-6 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 duration-300">
              Test Support Query
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pipeline" className="px-6 py-3.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-medium text-sm hover:bg-zinc-800 transition-colors">
              View Pipeline Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { label: 'Total Queries Processed', value: '12,482', icon: Activity, trend: '+14.2%', highlight: false },
          { label: 'Autonomously Handled', value: '8,924', icon: BrainCircuit, trend: '+22.4%', highlight: true },
          { label: 'Escalated to Human', value: '3,558', icon: ShieldCheck, trend: '-5.1%', highlight: false },
          { label: 'Verification Pass Rate', value: '97.8%', icon: CheckCircle2, trend: '+0.4%', highlight: true },
        ].map((metric, i) => (
          <GlassCard key={i} className="p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-white/10 transition-colors">
                <metric.icon className="w-5 h-5 text-zinc-400" />
              </div>
              <span className={`text-xs font-semibold ${metric.highlight ? "text-emerald-400" : "text-zinc-500"}`}>
                {metric.trend}
              </span>
            </div>
            <div>
              <div className="text-4xl font-semibold text-white tracking-tight">{metric.value}</div>
              <div className="text-sm text-zinc-500 mt-1 font-medium">{metric.label}</div>
            </div>
          </GlassCard>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Chart Section */}
        <GlassCard className="p-8 lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-white">Resolution Volume</h2>
              <p className="text-sm text-zinc-400 mt-1">Queries processed vs autonomously handled over 24h</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-600" /> Total Queries</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Auto-Handled</div>
            </div>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#52525b" strokeWidth={2} fill="transparent" />
                <Area type="monotone" dataKey="auto" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAuto)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Zero-Hallucination Banner */}
        <GlassCard className="p-8 relative overflow-hidden group flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Zero-Hallucination Policy</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Every generated response is grounded, verified and evaluated by our LLMVerifier before it reaches the customer.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">Active Enforcement</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Pipeline Visualization Summary */}
      <section className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Architecture Overview</h2>
            <p className="text-sm text-zinc-400 mt-1">The 6-stage intelligence pipeline</p>
          </div>
          <Link href="/pipeline" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View detailed specs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <GlassCard className="p-10 bg-zinc-950/50">
          <PipelineDiagram nodes={STATIC_PIPELINE_NODES} orientation="horizontal" />
        </GlassCard>
      </section>
      
    </div>
  );
}
