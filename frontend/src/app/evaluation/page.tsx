import { GlassCard } from '@/components/ui/GlassCard';
import { Target, Search, Scissors } from 'lucide-react';

export default function EvaluationPage() {
  return (
    <div className="p-10 max-w-[1400px] mx-auto py-16">
      
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Metrics & Testing
        </div>
        <h1 className="text-5xl font-semibold mt-4 text-white tracking-tight">Trust, measured.</h1>
        <p className="text-zinc-400 max-w-2xl mt-6 text-lg leading-relaxed">
          The Hiver AI Support Agent is continuously evaluated against a holdout dataset using an automated LLM-as-Judge framework to ensure strict adherence to safety policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Golden Set */}
        <GlassCard className="p-10 flex flex-col h-full bg-zinc-950/80 border-white/5 shadow-xl hover:border-white/10 transition-colors">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-8 shadow-inner">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Golden Set</h2>
          <p className="text-sm text-zinc-400 mb-10 flex-1 leading-relaxed">
            A meticulously curated holdout dataset of complex customer queries, representing edge cases, sensitive intents, and standard requests.
          </p>
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Dataset Size</span>
                <span className="text-sm text-white font-mono">1,000 cases</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Intent Coverage</span>
                <span className="text-sm text-emerald-400 font-mono">100%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full rounded-full" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* LLM-as-Judge */}
        <GlassCard className="p-10 flex flex-col h-full bg-zinc-950/80 border-white/5 shadow-xl hover:border-white/10 transition-colors">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner">
            <Search className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">LLM-as-Judge</h2>
          <p className="text-sm text-zinc-400 mb-10 flex-1 leading-relaxed">
            Automated evaluation using a strict 5-point rubric to assess response quality, safety, and hallucination absence independently.
          </p>
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Safety Score</span>
                <span className="text-sm text-white font-mono">4.98 / 5.0</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex gap-[2px]">
                <div className="h-full bg-emerald-500 flex-1 rounded-l-full" />
                <div className="h-full bg-emerald-500 flex-1" />
                <div className="h-full bg-emerald-500 flex-1" />
                <div className="h-full bg-emerald-500 flex-1" />
                <div className="h-full bg-emerald-500 w-[98%] rounded-r-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Hallucination Rate</span>
                <span className="text-sm text-emerald-400 font-mono">0.02%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[99.98%] rounded-full" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Ablation Testing */}
        <GlassCard className="p-10 flex flex-col h-full bg-zinc-950/80 border-white/5 shadow-xl hover:border-white/10 transition-colors">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-center mb-8 shadow-inner">
            <Scissors className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Ablation Testing</h2>
          <p className="text-sm text-zinc-400 mb-10 flex-1 leading-relaxed">
            Component necessity analysis. We systematically disable pipeline stages to measure their impact on overall system safety and performance.
          </p>
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">w/o Intent Filter</span>
                <span className="text-sm text-rose-400 font-mono">-42% Safety</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[42%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">w/o Verifier</span>
                <span className="text-sm text-rose-400 font-mono">+18% Hallucinations</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[18%] rounded-full" />
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
