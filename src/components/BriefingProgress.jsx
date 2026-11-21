import React from 'react';
import { Search, BrainCircuit, Sparkles, Loader2, ShieldCheck, FileText } from 'lucide-react';

/**
 * BriefingProgress Component
 * 
 * Indeterminate loading state for the server-side pipeline,
 * shimmering skeleton wireframe placeholders, and reduced-motion accessibility.
 */
export default function BriefingProgress({ targetName = "Target" }) {
  const stages = [
    {
      step: 1,
      title: "Stage 1: Searching Sources",
      description: `Searching Tavily for developments, news, and releases for ${targetName}...`,
      icon: Search
    },
    {
      step: 2,
      title: "Stage 2: Analyzing Information",
      description: "Analyzing sourced leadership information, product milestones, and strategic market signals...",
      icon: BrainCircuit
    },
    {
      step: 3,
      title: "Stage 3: Generating Briefing",
      description: "Formulating executive summary, high-impact meeting questions, and mapping verifiable citations...",
      icon: Sparkles
    }
  ];

  return (
    <div className="briefing-progress w-full max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8 shadow-warm text-center relative overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-softbrown via-gold-muted to-softbrown" />

        {/* Central Animated Orb */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FAF3E0] border border-gold-muted/40 flex items-center justify-center relative shadow-warm-sm">
          <Loader2 className="w-8 h-8 text-gold-muted animate-spin motion-reduce:animate-none" />
          <div className="absolute inset-0 rounded-2xl border-2 border-gold-muted/20 opacity-25 pointer-events-none motion-reduce:hidden" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-bold text-charcoal-900 tracking-tight mb-1">
          Researching {targetName}
        </h3>
        <p className="text-xs text-charcoal-500 mb-6 max-w-md mx-auto">
          Waiting for Tavily research and Gemini synthesis. This may take a couple of minutes.
        </p>

        <p role="status" className="mb-7 text-sm text-softbrown-dark">Research and AI generation in progress...</p>

        {/* 3 Clear Stages List */}
        <div aria-live="polite" className="space-y-3 text-left max-w-md mx-auto mb-6">
          {stages.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="flex items-start space-x-3.5 p-3.5 rounded-xl border bg-warm-surface border-warm-border"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-charcoal-900 text-gold-muted flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-charcoal-900">{s.title}</p>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shimmering Skeleton Wireframe Placeholder */}
        <div className="max-w-md mx-auto pt-4 border-t border-warm-border/60 text-left">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-2.5">
            <FileText className="w-3.5 h-3.5 text-gold-muted" />
            <span>Assembling Executive Document Layout</span>
          </div>
          
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-warm-border/60 space-y-2">
            <div className="h-3 w-3/4 rounded bg-beige-200 animate-shimmer" />
            <div className="h-2.5 w-full rounded bg-beige-200/70 animate-shimmer" />
            <div className="h-2.5 w-5/6 rounded bg-beige-200/70 animate-shimmer" />
            <div className="flex space-x-2 pt-1">
              <div className="h-2 w-16 rounded bg-beige-200/80 animate-shimmer" />
              <div className="h-2 w-20 rounded bg-beige-200/80 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Phase 1 Notice */}
        <div className="mt-5 pt-3 border-t border-warm-border/60 text-[10.5px] text-charcoal-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-muted" />
          <span>Simulated Pipeline (Phase 1 Prototype) • Tavily & Gemini APIs connect in Phase 2</span>
        </div>
      </div>
    </div>
  );
}
