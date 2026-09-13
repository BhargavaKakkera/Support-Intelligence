export default function AboutPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto py-24">
      <div className="space-y-12">
        <header>
          <span className="text-blue-400 font-mono text-xs uppercase tracking-widest font-bold">Project Philosophy</span>
          <h1 className="text-5xl font-semibold mt-4 text-white tracking-tight">Zero-Hallucination Policy</h1>
        </header>
        
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-a:text-blue-400">
          <p>
            The Hiver AI Support Agent is built on a fundamental constraint: <strong>The AI must never invent facts, policies, tracking links, or customer data.</strong>
          </p>
          <p>
            While raw Large Language Models are powerful, they are probabilistic engines prone to hallucination. In a customer support environment for a major brand like AmazonHelp, a hallucinated policy or order status is a critical failure.
          </p>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">The Pipeline Approach</h2>
          <p>
            To achieve zero-hallucination, we abandoned the standard single-prompt LLM approach. Instead, we built a mathematically verified pipeline where the LLM is tightly constrained.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
            <li><strong>Classification</strong> is handled by a fine-tuned <strong>DistilBERT Transformer</strong>. We strictly enforce data cleanliness and use Weighted Cross-Entropy (Class Weights) to prevent the "Accuracy Paradox" and mathematically protect minority classes (like Product Defects).</li>
            <li><strong>Knowledge</strong> is strictly retrieved from a verified database of 81,000 historical interactions.</li>
            <li><strong>Generation</strong> is restricted to rewriting pre-approved policy abstracts, with no access to external knowledge.</li>
            <li><strong>Verification</strong> is an independent, adversarial step designed solely to catch unsupported claims.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Fail Closed</h2>
          <p>
            When the system encounters ambiguity, lacks confidence, detects a sensitive intent (like billing), or fails verification, it is designed to <strong>fail closed</strong>. It gracefully escalates to a human agent rather than attempting a risky response.
          </p>
        </div>
        
        <div className="pt-12 border-t border-white/10 text-sm text-zinc-500 flex items-center justify-between">
          <span>Hiver AI Support Intelligence</span>
          <span>v1.0.0-production</span>
        </div>
      </div>
    </div>
  );
}
