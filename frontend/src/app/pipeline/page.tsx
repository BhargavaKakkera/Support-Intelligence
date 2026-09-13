import { GlassCard } from '@/components/ui/GlassCard';
import { PipelineDiagram } from '@/components/pipeline/PipelineDiagram';
const FULL_PIPELINE_NODES = [
  { 
    stage: 1, 
    title: 'INTENT CLASSIFICATION', 
    subtitle: 'DistilBERT Transformer with Class Weights',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Classifies the customer query into 9 intent categories. The model uses weighted cross-entropy to handle extreme class imbalance and was retrained on cleanly labeled data.</p>
        <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] grid grid-cols-2 gap-2">
          <div><span className="text-zinc-500">Latency:</span> <span className="text-zinc-300">~6.8ms</span></div>
          <div><span className="text-zinc-500">Macro F1 Score:</span> <span className="text-emerald-400">0.13</span></div>
          <div className="col-span-2"><span className="text-zinc-500">Defect Catch Rate (Recall):</span> <span className="text-indigo-400">100%</span></div>
        </div>
      </div>
    )
  },
  { 
    stage: 2, 
    title: 'HYBRID RETRIEVAL', 
    subtitle: 'BM25 + text-embedding-004',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Searches an offline vector database of 81,000 verified historical AmazonHelp conversations to find a precedent.</p>
        <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] grid grid-cols-2 gap-2">
          <div><span className="text-zinc-500">Corpus:</span> <span className="text-zinc-300">81k</span></div>
          <div><span className="text-zinc-500">Index:</span> <span className="text-indigo-400">FAISS</span></div>
        </div>
      </div>
    )
  },
  { 
    stage: 3, 
    title: 'POLICY ABSTRACTION', 
    subtitle: 'ResolutionExtractor',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Abstracts raw historical conversations into safe policy patterns, mathematically removing all PII and specific order IDs.</p>
        <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-zinc-300 overflow-x-auto">
          {"RAW -> {PATTERN} -> [ISSUE_APOLOGY]"}
        </div>
      </div>
    )
  },
  { 
    stage: 4, 
    title: 'GROUNDED GENERATION', 
    subtitle: 'Gemini 1.5 Pro',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Generates the customer-facing response based strictly on the extracted abstract policy pattern. External knowledge is disabled.</p>
        <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] grid grid-cols-2 gap-2">
          <div><span className="text-zinc-500">Temp:</span> <span className="text-zinc-300">0.0</span></div>
          <div><span className="text-zinc-500">Grounding:</span> <span className="text-emerald-400">Strict</span></div>
        </div>
      </div>
    )
  },
  { 
    stage: 5, 
    title: 'POST-GEN VERIFICATION', 
    subtitle: 'LLMVerifier',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Independent adversarial check to detect invented facts, tracking links, or policy contradictions in the generated string.</p>
      </div>
    )
  },
  { 
    stage: 6, 
    title: 'MULTI-SIGNAL ESCALATION', 
    subtitle: 'Final Routing Gate',
    status: 'idle' as const,
    children: (
      <div className="space-y-4 mt-4">
        <p className="text-zinc-400 text-xs leading-relaxed">Combines confidence scores from previous stages. If any safety threshold is missed, it fails closed and escalates to a human.</p>
      </div>
    )
  }
];

export default function PipelinePage() {
  return (
    <div className="p-10 max-w-6xl mx-auto py-16">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          System Architecture
        </div>
        <h1 className="text-5xl font-semibold text-white tracking-tight mb-6">How the Agent Thinks</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          The core philosophy is the <strong>Zero-Hallucination Policy</strong>. Rather than relying on a single prompt, the system routes queries through a multi-stage, mathematically verified data pipeline.
        </p>
      </div>

      <GlassCard className="p-16 relative overflow-hidden bg-zinc-950/80 border-white/5 shadow-2xl">
        {/* Decorative background grid/lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent -translate-x-1/2 blur-sm"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <PipelineDiagram nodes={FULL_PIPELINE_NODES} orientation="vertical" />
        </div>
      </GlassCard>
    </div>
  );
}
