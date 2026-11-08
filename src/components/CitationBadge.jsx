import React from 'react';

/**
 * CitationBadge Component
 * 
 * Distinct, accessible micro-badge rendering [1], [2], etc.
 * Features refined champagne-gold styling, hover elevation,
 * keyboard accessibility, and click-to-highlight mapping.
 */
export default function CitationBadge({ 
  refNumber = 1, 
  citationId, 
  sourceInfo = null,
  onClick,
  className = "" 
}) {
  const tooltipText = sourceInfo 
    ? `[${refNumber}] ${sourceInfo.publisher || 'Source'} (${sourceInfo.publishDate || 'Recent'}) — Click to inspect citation`
    : `[${refNumber}] Verifiable source citation — Click to view reference`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(citationId || refNumber);
      }}
      title={tooltipText}
      aria-label={`Citation reference ${refNumber}`}
      className={`inline-flex items-center justify-center font-mono font-bold text-[10.5px] px-1.5 py-0.5 mx-1 rounded-md bg-[#F4ECDC] text-charcoal-800 border border-[#D5C29F] hover:bg-charcoal-900 hover:text-gold-muted hover:border-charcoal-900 active:scale-90 transition-all duration-180 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer select-none shadow-warm-sm ${className}`}
    >
      [{refNumber}]
    </button>
  );
}
