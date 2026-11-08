import React from 'react';
import { SearchX, ArrowLeft, Zap, HelpCircle } from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockBriefings';

/**
 * EmptyState Component
 * 
 * Displayed when no public records/findings are found for a search query.
 */
export default function EmptyState({ targetName, onReset, onSelectPreset }) {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center animate-fade-in">
      <div className="bg-white rounded-2xl border border-warm-border p-8 shadow-warm">
        <div className="w-16 h-16 rounded-2xl bg-beige-100 text-charcoal-400 flex items-center justify-center mx-auto mb-4 border border-warm-border shadow-warm-sm">
          <SearchX className="w-8 h-8 text-softbrown" />
        </div>

        <div className="inline-block px-2.5 py-0.5 rounded-full bg-beige-200 text-charcoal-700 text-xs font-bold mb-2">
          No Public Records Detected
        </div>

        <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">
          No recent information found for "{targetName}"
        </h3>

        <p className="text-sm text-charcoal-600 max-w-md mx-auto mb-6 leading-relaxed">
          Our simulated crawler found zero 30-day press releases, verified executive hires, or notable public filings matching this query.
        </p>

        {/* Suggestion Box */}
        <div className="bg-[#FAF7F2] border border-warm-border rounded-xl p-4 text-left max-w-md mx-auto mb-6 text-xs text-charcoal-600 space-y-1.5 shadow-warm-sm">
          <p className="font-bold text-charcoal-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-gold-muted" />
            Suggestions for better results:
          </p>
          <ul className="list-disc list-inside space-y-1 text-charcoal-500 pl-1">
            <li>Verify the spelling of the company or person's full legal name.</li>
            <li>Try adding parent company keywords or location.</li>
            <li>In Phase 2, Tavily Deep Search will run automatic semantic fallback queries.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search Another Entity</span>
          </button>
        </div>

        {/* Quick Presets */}
        {onSelectPreset && (
          <div className="mt-8 pt-5 border-t border-warm-border/60">
            <p className="text-xs text-charcoal-500 mb-2 font-medium flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-gold-muted" />
              Test with one of our featured demo datasets:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-beige-100 hover:bg-white hover:border-gold-muted border border-warm-border text-charcoal-700 font-semibold hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted shadow-warm-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
