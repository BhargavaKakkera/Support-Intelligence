'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

function analyzeQuerySim(query: string) {
  const q = query.toLowerCase();

  if (q.includes('payment') || q.includes('billing') || q.includes('account')) {
    return 'sensitive';
  }
  if (q.includes('weird') || q.includes('strange')) {
    return 'low-confidence';
  }
  if (q.includes('never happened') || q.includes('unprecedented')) {
    return 'low-retrieval';
  }
  if (q.includes('tomorrow') || q.includes('promise')) {
    return 'hallucination';
  }
  return 'standard';
}

const PIPELINE_STAGES = [
  'INTENT',
  'RETRIEVE',
  'RERANK',
  'ABSTRACT',
  'GENERATE',
  'VERIFY',
  'DECIDE'
];

export default function AgentConsole() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState(0);
  const [backendResult, setBackendResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsProcessing(true);
    setStage(1);
    setBackendResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setBackendResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to backend.');
    }
  };

  const handleReset = () => {
    setIsProcessing(false);
    setStage(0);
    setQuery('');
    setBackendResult(null);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (stage > 0 && stage < 7 && isProcessing) {
      // Only proceed past stage 2 if we have the backend result (or error)
      if (stage === 2 && !backendResult && !errorMsg) return;

      const timer = setTimeout(() => {
        setStage(s => {
          if (s + 1 === 7) setIsProcessing(false);
          return s + 1;
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [stage, isProcessing, backendResult, errorMsg]);

  // Map real backend results, or fallback to error state
  const decisionVariant = errorMsg ? 'danger' : (backendResult?.decision === 'AUTO_HANDLE' ? 'success' : 'danger');
  const decisionAction = errorMsg ? 'API_ERROR' : (backendResult?.decision || 'PROCESSING...');
  let decisionReason = errorMsg ? errorMsg : (backendResult?.decision_reason || 'Waiting for pipeline...');
  if (backendResult?.api_status === 'RATE_LIMITED') {
    decisionReason = "LLM Quota Exhausted. Verification bypassed.";
  } else if (decisionReason.length > 80) {
    decisionReason = decisionReason.substring(0, 80) + '...';
  }
  const generatedText = errorMsg ? 'Failed to generate response due to backend connection error.' : (backendResult?.draft_response || 'Generating response...');
  const intentClass = backendResult?.intent || 'PROCESSING...';
  const confidenceScore = backendResult?.intent_confidence ? backendResult.intent_confidence.toFixed(3) : '0.000';


  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col pt-12 px-10 pb-10 max-w-[1400px] mx-auto space-y-8 overflow-y-auto">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Agent Console</h1>
          <p className="text-zinc-400 mt-1">Strict vertical architecture for precise analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          {backendResult?.api_status === 'RATE_LIMITED' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              API_QUOTA_EXCEEDED
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API_ONLINE
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: CUSTOMER INPUT */}
      <section className="shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">1. Customer Message</h2>
          <span className="text-[10px] font-mono text-zinc-500">{query.length} chars</span>
        </div>

        <GlassCard className="p-2 bg-zinc-950/80 border-white/10 flex flex-col">
          <textarea
            className="w-full bg-transparent p-6 text-zinc-100 text-xl leading-relaxed font-sans resize-none focus:outline-none min-h-[280px] placeholder:text-zinc-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (query.trim() && !isProcessing && stage === 0) {
                  handleAnalyze();
                }
              }
            }}
            disabled={isProcessing || stage > 0}
            placeholder="Type a customer message here... (Press Enter to Analyze)"
          />

          <div className="border-t border-white/5 p-4 bg-black/20 flex flex-wrap items-center justify-between gap-4 rounded-b-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mr-2">Test Scenarios:</span>
              {[
                { label: 'Standard', q: 'My order is late and I haven\'t received any update.' },
                { label: 'Sensitive', q: 'I think someone accessed my account and changed my payment details.' },
                { label: 'Low Conf', q: 'I need help with something weird that happened.' },
                { label: 'Low Retr', q: 'This unprecedented issue has never happened before.' },
                { label: 'Hallucinate', q: 'When exactly will it arrive tomorrow? I need a promise.' },
              ].map((s, i) => (
                <button
                  key={i}
                  disabled={isProcessing || stage > 0}
                  onClick={() => setQuery(s.q)}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {stage > 0 ? (
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!query.trim()}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              >
                <Play className="w-4 h-4" /> Analyze
              </button>
            )}
          </div>
        </GlassCard>
      </section>

      {/* SECTION 2: WORKFLOW PIPELINE */}
      <section className={`shrink-0 transition-all duration-500 ${stage > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300 mb-4">2. Execution Workflow</h2>
        <GlassCard className="p-8 bg-zinc-950/80 border-white/10 flex items-center justify-between relative overflow-hidden">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />

          {PIPELINE_STAGES.map((sName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stage > stepNum;
            const isActive = stage === stepNum;
            const isPending = stage < stepNum;

            return (
              <div key={sName} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border-2 ${isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    isActive ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                      'bg-zinc-900 border-zinc-700 text-zinc-500'
                  }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `0${stepNum}`}
                </div>
                <span className={`text-[10px] font-semibold tracking-widest uppercase transition-colors ${isCompleted ? 'text-emerald-400' :
                    isActive ? 'text-white' :
                      'text-zinc-600'
                  }`}>
                  {sName}
                </span>
              </div>
            );
          })}
        </GlassCard>
      </section>

      {/* SECTION 3: FINAL OUTPUT DASHBOARD */}
      <section className={`flex-1 transition-all duration-700 delay-300 flex flex-col min-h-[300px] pb-8 ${stage === 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none hidden'}`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300 mb-4">3. Final Output Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
          {/* Intent Panel */}
          <GlassCard className="p-6 bg-zinc-950/80 border-white/10 flex flex-col items-center justify-center text-center hover:bg-zinc-900/60 transition-colors duration-300 group cursor-default">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">Predicted Intent</span>
            <span className="text-xl font-mono text-white tracking-tight">{intentClass}</span>
          </GlassCard>

          {/* Confidence Panel */}
          <GlassCard className="p-6 bg-zinc-950/80 border-white/10 flex flex-col items-center justify-center text-center hover:bg-zinc-900/60 transition-colors duration-300 group cursor-default">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">Confidence Score</span>
            <span className={`text-3xl font-mono tracking-tighter ${backendResult?.intent_confidence && backendResult.intent_confidence < 0.7 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {confidenceScore}
            </span>
          </GlassCard>

          {/* Decision Panel */}
          <GlassCard className={`p-6 border flex flex-col items-center justify-center text-center shadow-lg transition-all duration-500 hover:scale-[1.02] cursor-default ${decisionVariant === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <span className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${decisionVariant === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
              Final Decision
            </span>
            <div className="flex items-center gap-2 mb-2">
              {decisionVariant === 'success' ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-rose-400" />}
              <span className={`text-2xl font-bold tracking-tight ${decisionVariant === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {decisionAction}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 max-w-[220px] leading-relaxed break-words line-clamp-3">
              {decisionReason}
            </span>
          </GlassCard>
        </div>

        {/* Drafted Message Panel */}
        <GlassCard className={`p-6 md:p-8 bg-zinc-950/80 border-white/10 flex flex-col hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-500 ${backendResult?.api_status === 'RATE_LIMITED' ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <FileText className={`w-4 h-4 ${backendResult?.api_status === 'RATE_LIMITED' ? 'text-amber-500' : 'text-zinc-500'}`} />
            <h3 className={`text-[11px] font-semibold uppercase tracking-widest ${backendResult?.api_status === 'RATE_LIMITED' ? 'text-amber-400' : 'text-zinc-400'}`}>
              {backendResult?.api_status === 'RATE_LIMITED' ? 'API Throttled - Fallback Message' : 'Drafted Message (Grounded)'}
            </h3>
          </div>
          <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6 md:p-8 font-serif text-lg md:text-xl text-zinc-300 leading-relaxed italic shadow-inner overflow-hidden">
            {backendResult?.api_status === 'RATE_LIMITED' ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <span className="text-base md:text-lg font-sans not-italic text-amber-200/80 text-center">LLM Quota Exhausted. Please wait 60 seconds for the rate limit bucket to reset.</span>
                <span className="text-xs md:text-sm font-sans not-italic text-zinc-500 text-center">Fallback Policy Match: "{generatedText}"</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap m-0">&quot;{generatedText}&quot;</p>
            )}
          </div>
        </GlassCard>
      </section>

    </div>
  );
}
