import React from 'react';
import { ExternalLink, Calendar, ShieldCheck, Check } from 'lucide-react';

/**
 * SourceCitation Component
 * 
 * Verifiable citation grounding evidence card with reference numbers [1],
 * mock publication dates, interactive scroll highlighting, and clear demo labeling.
 */
export default function SourceCitation({ 
  source, 
  isHighlighted, 
  onClearHighlight 
}) {
  const { id, refNumber, title, publisher, publishDate, url, snippet } = source;

  return (
    <div 
      id={`source-${id}`}
      tabIndex={0}
      className={`p-4 rounded-xl border transition-all duration-300 ease-out text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted ${
        isHighlighted
          ? 'bg-amber-100/70 border-gold-muted ring-2 ring-gold-muted/50 shadow-warm-md scale-[1.01]'
          : 'bg-warm-surface border-warm-border hover:bg-white hover:border-gold-muted/60 hover:shadow-warm-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          {/* Reference badge */}
          <span className="w-5 h-5 rounded-full bg-charcoal-900 text-gold-muted flex items-center justify-center font-mono font-bold text-[10px] shrink-0 shadow-warm-sm border border-gold-muted/30">
            {refNumber || '1'}
          </span>
          <span className="font-bold text-charcoal-900">
            {publisher}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] text-charcoal-500 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-softbrown" />
            {publishDate}
          </span>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gold-light text-softbrown-dark border border-gold-muted/30">
            Demo Source
          </span>
        </div>
      </div>

      <h5 className="font-serif font-bold text-charcoal-900 mb-1.5 leading-snug">
        {title}
      </h5>

      {snippet && (
        <p className="text-[11px] text-charcoal-600 italic bg-white/80 p-2.5 rounded-lg border border-warm-border/60 leading-relaxed mb-2 font-serif">
          "{snippet}"
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-warm-border/40">
        <span className="text-charcoal-400 text-[10px] truncate max-w-[260px] font-mono">
          {url}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            // Keep demo link safe inside prototype
            e.preventDefault();
            alert(`Demo Source Citation:\n${title}\nPublisher: ${publisher} (${publishDate})\n\nIn Phase 2, this will open the live verified Tavily web article.`);
          }}
          className="inline-flex items-center gap-1 text-softbrown hover:text-charcoal-900 font-semibold cursor-pointer transition-colors duration-200"
          title="Inspect simulated citation source"
        >
          <span>Demo Ref</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
