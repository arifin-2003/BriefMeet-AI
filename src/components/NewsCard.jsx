import React from 'react';
import { Newspaper, Calendar, ExternalLink } from 'lucide-react';
import CitationBadge from './CitationBadge';

/**
 * NewsCard Component
 * 
 * Renders 30-day verified developments with interactive citation badges [1],
 * sentiment tags, source attribution, and smooth hover interaction.
 */
export default function NewsCard({ 
  item, 
  onCitationClick, 
  refNumber, 
  sourceInfo 
}) {
  const { title, summary, date, category, sourceName, sourceUrl, sentiment, citationId } = item;

  return (
    <article className="p-4 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 hover:shadow-warm-md transition-all duration-200 ease-out flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Pill */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-beige-200 text-charcoal-700 uppercase tracking-wide">
              {category}
            </span>

            {/* Sentiment Badge */}
            {sentiment && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                sentiment === 'Positive' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {sentiment}
              </span>
            )}

            {/* Publication Date */}
            <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-softbrown" />
              {date}
            </span>
          </div>

          {/* Numbered Citation Badge */}
          {citationId && (
            <CitationBadge
              refNumber={refNumber || 1}
              citationId={citationId}
              sourceInfo={sourceInfo}
              onClick={onCitationClick}
            />
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 group-hover:text-charcoal-900 leading-snug mb-1.5">
          {title}
        </h4>

        {/* Summary text */}
        <p className="text-xs text-charcoal-600 leading-relaxed mb-3">
          {summary}
        </p>
      </div>

      {/* Attribution Footer */}
      <div className="flex items-center justify-between text-[11px] text-charcoal-400 pt-2 border-t border-warm-border/60 mt-auto">
        <span className="font-medium text-charcoal-600 italic truncate max-w-[220px]">
          Source: {sourceName}
        </span>
        <span className="text-[10px] font-semibold text-softbrown-dark bg-gold-light/60 px-1.5 py-0.2 rounded border border-gold-muted/20">
          Demo Citation
        </span>
      </div>
    </article>
  );
}
