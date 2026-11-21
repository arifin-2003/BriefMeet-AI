import React from 'react';
import { ResearchSources } from './GeneratedBriefing';

export default function ResearchOnly({ briefing, onBackToGenerator }) {
  return <article className="w-full max-w-5xl mx-auto space-y-5 pb-16 text-charcoal-900">
    <button type="button" onClick={onBackToGenerator} className="no-print rounded-xl border border-warm-border bg-white px-4 py-2 text-sm">Back to Generator</button>
    <div role="status" className="rounded-2xl border border-warm-border bg-gold-pale p-5 sm:p-7">
      <h1 className="font-serif text-2xl font-bold">Research sources found — AI briefing unavailable</h1>
      <p className="mt-2 text-sm">{briefing.aiNotice}</p>
      <p className="mt-2 text-sm break-words">Research for {briefing.targetName}</p>
    </div>
    <ResearchSources sources={briefing.sources} />
  </article>;
}
