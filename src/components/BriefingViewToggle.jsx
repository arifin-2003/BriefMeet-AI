import React from 'react';
import { LayoutDashboard, FileText, Sparkles } from 'lucide-react';

/**
 * BriefingViewToggle Component
 * 
 * Segmented switcher between Detailed Results View and One-Page Executive Briefing View.
 * Provides accessible tab roles, keyboard navigation, and smooth active indicator transitions.
 */
export default function BriefingViewToggle({ activeView = 'detailed', onViewChange }) {
  return (
    <div 
      role="tablist" 
      aria-label="Briefing Display Mode"
      className="inline-flex items-center p-1 bg-[#EAE2D2] rounded-xl border border-warm-border shadow-warm-sm select-none"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'detailed'}
        onClick={() => onViewChange('detailed')}
        className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted ${
          activeView === 'detailed'
            ? 'bg-white text-charcoal-900 shadow-warm'
            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/60'
        }`}
      >
        <LayoutDashboard className={`w-3.5 h-3.5 transition-transform duration-200 ${activeView === 'detailed' ? 'text-gold-muted scale-110' : 'text-charcoal-400'}`} />
        <span>Detailed View</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'onepage'}
        onClick={() => onViewChange('onepage')}
        className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted ${
          activeView === 'onepage'
            ? 'bg-white text-charcoal-900 shadow-warm'
            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/60'
        }`}
      >
        <FileText className={`w-3.5 h-3.5 transition-transform duration-200 ${activeView === 'onepage' ? 'text-gold-muted scale-110' : 'text-charcoal-400'}`} />
        <span>One-Page Briefing</span>
        <span className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded transition-colors ${
          activeView === 'onepage'
            ? 'bg-gold-light text-softbrown-dark border border-gold-muted/40 shadow-warm-sm'
            : 'bg-[#DDD2BD] text-charcoal-600'
        }`}>
          A4 Print
        </span>
      </button>
    </div>
  );
}
