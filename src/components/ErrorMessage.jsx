import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Zap } from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockBriefings';

/**
 * ErrorMessage Component
 * 
 * Renders simulated gateway or network error states with
 * troubleshooting guidance, retry actions, and demo preset shortcuts.
 */
export default function ErrorMessage({ 
  error, 
  onRetry, 
  onReset, 
  onSelectPreset 
}) {
  const errorMessage = error?.message || 'An unexpected error occurred while generating the briefing.';

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-red-200/90 p-6 sm:p-8 shadow-warm-md">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-warm-sm">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 bg-red-100/80 px-2 py-0.5 rounded border border-red-200">
                Briefing Request Failed
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-charcoal-900 mt-1 mb-2">
              Unable to generate briefing
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-800 bg-red-50/60 p-3 rounded-xl border border-red-200 font-mono mb-4 leading-relaxed">
              {errorMessage}
            </p>

            <p className="text-xs text-charcoal-600 mb-5">Check your connection and retry. If the issue persists, the research or AI provider may be temporarily unavailable.</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-warm-border">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center space-x-2 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gold-muted" />
                  <span>Try Again</span>
                </button>
              )}

              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center space-x-2 bg-warm-surface hover:bg-beige-100 text-charcoal-800 border border-warm-border hover:border-gold-muted px-4 py-2 rounded-xl text-xs font-semibold hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Generator</span>
                </button>
              )}
            </div>

            {/* Try Presets */}
            {onSelectPreset && (
              <div className="mt-5 pt-4 border-t border-warm-border/60">
                <p className="text-xs text-charcoal-500 mb-2 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-gold-muted" />
                  Try another research target:
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-beige-100 hover:bg-white hover:border-gold-muted border border-warm-border text-charcoal-700 font-semibold hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
